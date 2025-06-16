const express = require('express');

const { connectProducer, sendMessage } = require('./kafka/producer');

require('dotenv').config()

const app = express();
const PORT = 3000;

app.use(express.json());


// Basic ingestion endpoint
app.post('/ingest', async (req, res) => {
    const payload = req.body;
    try {
        await sendMessage(payload);
        res.status(200).json({status: 'success', message: 'Data ingested to Kafka'});
    } catch (error) {
        console.error('Error sending message', error);
        res.status(500).json({status: 'error', message: 'Failed to send message'});
    }
});

app.listen(PORT, async() => {
    console.log(`Ingestion API running at http://localhost:${PORT}`);
    await connectProducer();
});