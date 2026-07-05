const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const foodLogRoutes = require('./routes/foodLog');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/foodlog', foodLogRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

app.get('/', (req, res) => {
  res.send('CalCoach API is running');
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});