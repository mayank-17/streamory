// test-server.js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/v1/events', (req, res) => {
  console.log('Received event:', req.body);
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Test server running on http://localhost:3000');
});

