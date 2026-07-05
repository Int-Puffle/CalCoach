const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

app.get('/', (req, res) => {
  res.send('CalCoach API is running');
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});