#!/bin/bash

# Simple Time-Based Kafka Lag Monitor
# Gets actual timestamp-based lag in seconds

KAFKA_CONTAINER=$(docker ps -q --filter "ancestor=confluentinc/cp-kafka:7.5.0")
CONSUMER_GROUP="streamory-group"
TOPIC="streamory-events"

if [ -z "$KAFKA_CONTAINER" ]; then
  echo "❌ Kafka container not found"
  exit 1
fi

echo "🔍 Checking consumer lag for: $CONSUMER_GROUP"
echo "📊 Topic: $TOPIC"
echo "==========================================="

# Function to get current timestamp in milliseconds
get_current_timestamp() {
  date +%s%3N
}

# Function to get message timestamp from offset
get_message_timestamp() {
  local topic=$1
  local partition=$2
  local offset=$3

  # Use kafka-dump-log to get timestamp (more reliable)
  local timestamp=$(timeout 5 docker exec $KAFKA_CONTAINER \
    kafka-console-consumer \
    --bootstrap-server kafka:29092 \
    --topic $topic \
    --partition $partition \
    --offset $offset \
    --max-messages 1 \
    --property print.timestamp=true \
    --timeout-ms 3000 2>/dev/null |
    grep -o "CreateTime:[0-9]*" |
    cut -d: -f2 | head -n1)

  echo "$timestamp"
}

# Main lag checking function
check_consumer_lag() {
  # Get consumer group status
  local consumer_output=$(docker exec $KAFKA_CONTAINER kafka-consumer-groups \
    --bootstrap-server kafka:29092 \
    --group $CONSUMER_GROUP \
    --describe 2>/dev/null)

  if [ $? -ne 0 ] || [ -z "$consumer_output" ]; then
    echo "❌ Consumer group not found or error occurred"
    echo ""
    echo "Available consumer groups:"
    docker exec $KAFKA_CONTAINER kafka-consumer-groups \
      --bootstrap-server kafka:29092 \
      --list 2>/dev/null
    return 1
  fi

  echo "Consumer Status:"
  echo "$consumer_output"
  echo ""

  # Parse each line of consumer data
  echo "$consumer_output" | grep "^$TOPIC" | while read line; do
    local partition=$(echo "$line" | awk '{print $2}')
    local current_offset=$(echo "$line" | awk '{print $3}')
    local end_offset=$(echo "$line" | awk '{print $4}')
    local message_lag=$(echo "$line" | awk '{print $5}')

    echo "📍 Partition $partition:"
    echo "   Current Offset: $current_offset"
    echo "   End Offset: $end_offset"
    echo "   Message Lag: $message_lag messages"

    if [[ "$message_lag" =~ ^[0-9]+$ ]] && [ "$message_lag" -gt 0 ]; then
      echo "   🕐 Getting timestamp lag..."

      # Get timestamp of consumer's current position
      if [ "$current_offset" != "-" ] && [ "$current_offset" -gt 0 ]; then
        local consumer_timestamp=$(get_message_timestamp $TOPIC $partition $current_offset)

        # Get timestamp of latest message
        local latest_offset=$((end_offset - 1))
        local latest_timestamp=$(get_message_timestamp $TOPIC $partition $latest_offset)

        if [ -n "$consumer_timestamp" ] && [ -n "$latest_timestamp" ] &&
          [ "$consumer_timestamp" -gt 0 ] && [ "$latest_timestamp" -gt 0 ]; then

          local time_diff_ms=$((latest_timestamp - consumer_timestamp))
          local time_diff_sec=$((time_diff_ms / 1000))

          echo "   ⏰ Time Lag: ${time_diff_sec} seconds"

          # Format time nicely
          if [ $time_diff_sec -gt 3600 ]; then
            local hours=$((time_diff_sec / 3600))
            local minutes=$(((time_diff_sec % 3600) / 60))
            echo "   📊 Formatted: ${hours}h ${minutes}m"
          elif [ $time_diff_sec -gt 60 ]; then
            local minutes=$((time_diff_sec / 60))
            local seconds=$((time_diff_sec % 60))
            echo "   📊 Formatted: ${minutes}m ${seconds}s"
          else
            echo "   📊 Formatted: ${time_diff_sec}s"
          fi
        else
          echo "   ❓ Could not determine timestamp lag"
        fi
      fi
    elif [ "$message_lag" = "0" ]; then
      echo "   ✅ No lag - consumer is up to date"
    else
      echo "   🔴 No active consumer (lag: $message_lag)"
    fi
    echo ""
  done
}

# Alternative method: Check latest message age
check_latest_message_age() {
  echo "🔍 Checking age of latest messages in topic..."

  # Get latest message with timestamp
  local latest_msg=$(timeout 10 docker exec $KAFKA_CONTAINER \
    kafka-console-consumer \
    --bootstrap-server kafka:29092 \
    --topic $TOPIC \
    --max-messages 1 \
    --from-beginning \
    --property print.timestamp=true \
    --timeout-ms 5000 2>/dev/null | tail -n1)

  if [ -n "$latest_msg" ]; then
    local timestamp=$(echo "$latest_msg" | grep -o "CreateTime:[0-9]*" | cut -d: -f2)
    if [ -n "$timestamp" ]; then
      local current_time=$(get_current_timestamp)
      local age_ms=$((current_time - timestamp))
      local age_sec=$((age_ms / 1000))

      echo "📅 Latest message age: ${age_sec} seconds"
      echo "🕐 Latest message timestamp: $timestamp"
      echo "🕐 Current timestamp: $current_time"
    fi
  else
    echo "⚠️  Could not retrieve latest message"
  fi
}

# Execute the checks
check_consumer_lag
echo ""
check_latest_message_age

echo ""
echo "============================================"
echo "💡 Tip: Your Kafka UI at http://localhost:8080"
echo "   should also show time-based lag information"
echo "============================================"
