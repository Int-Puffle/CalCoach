require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const foodLogRoutes = require('./routes/foodLog');
const foodSearchRoutes = require('./routes/foodSearch');
const authRoutes = require('./routes/auth');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/foodlog', foodLogRoutes);
app.use('/api/foodsearch', foodSearchRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

app.get('/', (req, res) => {
  res.send('CalCoach API is running');
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});