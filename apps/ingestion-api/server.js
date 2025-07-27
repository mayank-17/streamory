const express = require('express');
require('dotenv').config();

const { connectProducer, sendMessage, producer } = require('./kafka/producer');

const app = express();
const PORT = 3001;

app.use(express.json());

app.post('/v1/ingest', async (req, res) => {
  const payload = req.body;
  try {
    await sendMessage(process.env.KAFKA_TOPIC, payload);
    res.status(200).json({ status: 'SUCCESS', message: 'Data ingested to Kafka' });
  } catch (err) {
    console.error('Error sending message', err);
    res.status(500).json({ status: 'ERROR', message: 'Failed to send message' });
  }
});

app.get('/v1/health', async (_, res) => {
  try {
    const metadata = await producer.cluster.refreshMetadata();
    res.status(200).json({
      status: 'SUCCESS',
      message: 'Ingestion API and Kafka are Healthy',
      brokers: metadata.brokers,
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      message: err.message,
    });
  }
});

(async () => {
  try {
    await connectProducer();
    app.listen(PORT, () => {
      console.log(`Ingestion API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect Kafka producer', err);
    process.exit(1);
  }
})();
