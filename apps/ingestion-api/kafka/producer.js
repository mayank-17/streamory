const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
    clientId: 'ingestion-api',
    brokers: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
    retry: {
      initialRetryTime: 100,
      retries: 8
    }
});

const producer = kafka.producer();

let isConnecting = false;
let isConnected = false; // Track connection state

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const connectProducer = async (retries = 5, interval = 5000) => {
  if (isConnected) return; // Already connected
  if (isConnecting) return; // Connection in progress
  
  isConnecting = true;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Trying to connect Kafka (attempt ${i + 1})`);
      await producer.connect();
      console.log("✅ Kafka Producer connected!");
      isConnected = true;
      isConnecting = false;
      return;
    } catch (err) {
      console.error(`❌ Kafka connection failed (attempt ${i + 1}): ${err.message}`);
      if (i < retries - 1) {
        await sleep(interval);
      }
    }
  }
  
  isConnecting = false;
  throw new Error('Kafka producer failed to connect after maximum retries');
};

const sendMessage = async (topic, message) => {
  try {
    // Ensure connection before sending
    if (!isConnected) {
      await connectProducer();
    }
    
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (err) {
    console.error(`❌ Failed to send message to Kafka: ${err.message}`);
    
    // Reset connection state on error
    if (err.message.includes('leadership election')) {
      isConnected = false;
    }
    
    throw err; // Re-throw to let caller handle
  }
};

// Graceful shutdown
const disconnectProducer = async () => {
  try {
    if (isConnected) {
      await producer.disconnect();
      isConnected = false;
      console.log('✅ Kafka Producer disconnected');
    }
  } catch (err) {
    console.error('❌ Error disconnecting Kafka producer:', err.message);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down...');
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Gracefully shutting down...');
  await disconnectProducer();
  process.exit(0);
});

module.exports = { connectProducer, sendMessage, producer, disconnectProducer };