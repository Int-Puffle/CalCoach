require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
