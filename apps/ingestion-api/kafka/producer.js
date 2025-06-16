const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log('Kafka Producer Connected!')
};

const sendMessage = async (message) => {
    await producer.send({
        topic: process.env.KAFKA_TOPIC,
        messages: [{value: JSON.stringify(message) }]
    });
    console.log('Message sent: ', message);
};


module.exports = {connectProducer, sendMessage};