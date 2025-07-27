import { Kafka } from "kafkajs";
import { createClient } from "@clickhouse/client";
import "dotenv/config";
import { timeStamp } from "console";
import { performance } from 'perf_hooks';

const testClickHouseConnection = async () => {
  // Debug environment variables
  console.log('🔍 Environment variables:');
  console.log('CLICKHOUSE_HOST:', process.env.CLICKHOUSE_HOST);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  const url = process.env.CLICKHOUSE_HOST || "http://clickhouse:8123";
  try {
    console.log(`Testing ClickHouse connection: ${url}`);
    const client = createClient({ url });
    await client.ping();
    console.log(`✅ ClickHouse connected successfully: ${url}`);
    return client;
  } catch (error) {
    console.log(`❌ Failed to connect to ${url}:`, error.message);
    console.log('❌ Error details:', {
      errno: error.errno,
      code: error.code,
      address: error.address,
      port: error.port
    });
    throw error;
  }
};

const runConsumer = async () => {
  console.log("Starting Streamory processor...");

  let consumer;
  let clickhouse;

  try {
    // Test ClickHouse connection
    clickhouse = await testClickHouseConnection();

    // Setup Kafka
    const kafka = new Kafka({
      clientId: "streamory-processor",
      brokers: process.env.KAFKA_BROKERS?.split(",") || ["kafka:29092"],
    });

    consumer = kafka.consumer({ groupId: "streamory-group" });

    // Connect to Kafka
    await consumer.connect();
    console.log("✅ Kafka consumer connected");

    await consumer.subscribe({
      topic: process.env.KAFKA_TOPIC || "streamory-events",
      fromBeginning: true
    });
    console.log(`✅ Subscribed to topic: ${process.env.KAFKA_TOPIC || "streamory-events"}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const eventStr = message.value?.toString();
          console.log(`Received raw message: ${eventStr}`);
          if (!eventStr) {
            console.warn("⚠️ Received empty message, skipping");
            return;
          }

          const event = JSON.parse(eventStr);
          console.log(`📥 Received event: ${event.event}`);

          // Transform or enrich event here if needed
          const transformed = transformEvent(event);

          // Debug: Check if clickhouse client is still valid
          console.log(`🔍 About to insert into ClickHouse, client exists: ${!!clickhouse}`);

          // Insert into ClickHouse
          await insertIntoClickHouse(clickhouse, transformed);

          console.log(`✅ Processed event: ${transformed.event}`);
        } catch (err) {
          console.error("❌ Error processing message:", err);
          console.error("❌ Error stack:", err.stack);
          // Log the raw> message for debugging
          console.error("❌ Raw message:", message.value?.toString());
          // Don't throw - let consumer continue with other messages
        }
      },
    });

    // Setup graceful shutdown handlers
    setupGracefulShutdown(consumer, clickhouse);

  } catch (error) {
    console.error("❌ Fatal error in consumer setup:", error);
    await cleanupResources(consumer, clickhouse);
    process.exit(1);
  }
};

const transformEvent = (event) => {
  // Clean timestamp
  const cleanTimestamp = event.timestamp
    ? event.timestamp.replace('Z', '').replace('T', ' ')
    : getTimestampWithMicros()
  // : new Date().toISOString().replace(/\.\d{3}Z$/, '').replace('T', ' ');
  return {
    event: event.event,
    action: event.action,
    properties: JSON.stringify(event.properties || {}),
    timestamp: cleanTimestamp,
    user_id: event.user_id || null,
    session_id: event.session_id || null,
  };
};

async function insertIntoClickHouse(client, event) {
  try {
    await client.insert({
      table: 'streamory_events',
      values: [event],
      format: 'JSONEachRow',
    });
  } catch (error) {
    console.error("❌ ClickHouse insertion error:", error);
    console.error("❌ Failed event:", JSON.stringify(event, null, 2));
    throw error;
  }
}

async function cleanupResources(consumer, clickhouse) {
  try {
    if (consumer) {
      console.log('🔄 Disconnecting Kafka consumer...');
      await consumer.disconnect();
      console.log('✅ Kafka consumer disconnected');
    }

    if (clickhouse) {
      console.log('🔄 Closing ClickHouse connection...');
      await clickhouse.close();
      console.log('✅ ClickHouse connection closed');
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

function setupGracefulShutdown(consumer, clickhouse) {
  const gracefulShutdown = async (signal) => {
    console.log(`🔄 Received ${signal}, gracefully shutting down...`);
    await cleanupResources(consumer, clickhouse);
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

runConsumer().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});

function getTimestampWithMicros() {
  const now = new Date();

  // Format date to "YYYY-MM-DD HH:mm:ss"
  const datePart = now.toISOString().slice(0, 19).replace('T', ' ');

  // Get milliseconds fraction, 3 digits
  const ms = now.getMilliseconds();

  // Get high-res sub-millisecond time (in microseconds)
  const highRes = Math.floor((performance.now() % 1) * 1000); // 0-999 microseconds

  // Combine ms + highRes (ms * 1000 + microseconds) to get 6 digits
  const micros = (ms * 1000) + highRes;

  // Pad with leading zeros to ensure 6 digits
  const microStr = micros.toString().padStart(6, '0');

  return `${datePart}.${microStr}`;
}
