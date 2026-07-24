const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const FoodLog = require('../models/FoodLog');
const PetState = require('../models/PetState');
const User = require('../models/User');
const { calculateMood } = require('../utils/mood');

// POST /api/foodlog - log a meal and update pet mood
router.post('/', async (req, res) => {
  try {
    const { userId, foodName, calories, protein, carbs, fat } = req.body;

    if (!userId || !foodName || calories == null) {
      return res.status(400).json({ error: 'userId, foodName, and calories are required' });
    }

    const newLog = new FoodLog({ userId, foodName, calories, protein, carbs, fat });
    await newLog.save();

    // recalculate pet mood based on today's totals across all macros
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysLogs = await FoodLog.find({ userId, loggedAt: { $gte: todayStart } });
    const totals = todaysLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const user = await User.findById(userId);
    const { mood, moodScore } = calculateMood(totals, user || {});

    const petState = await PetState.findOneAndUpdate(
      { userId },
      { mood, moodScore, lastFedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ log: newLog, petState, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /api/foodlog/petstate/:userId - get current pet state
router.get('/petstate/:userId', async (req, res) => {
  try {
    const petState = await PetState.findOne({ userId: req.params.userId });
    res.status(200).json({ petState, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /api/foodlog/stats/:userId?days=30 - daily calorie/macro/mood history for charts
router.get('/stats/:userId', async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 90);

    const rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);
    rangeStart.setDate(rangeStart.getDate() - (days - 1));

    const [dailyTotals, user] = await Promise.all([
      FoodLog.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.params.userId),
            loggedAt: { $gte: rangeStart },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
            calories: { $sum: '$calories' },
            protein: { $sum: '$protein' },
            carbs: { $sum: '$carbs' },
            fat: { $sum: '$fat' },
          },
        },
      ]),
      User.findById(req.params.userId),
    ]);

    const byDate = new Map(dailyTotals.map((entry) => [entry._id, entry]));

    const history = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(rangeStart);
      day.setDate(day.getDate() + i);
      const dateKey = day.toISOString().slice(0, 10);
      const entry = byDate.get(dateKey);
      const totals = {
        calories: entry?.calories || 0,
        protein: entry?.protein || 0,
        carbs: entry?.carbs || 0,
        fat: entry?.fat || 0,
      };
      const { mood, moodScore } = calculateMood(totals, user || {});

      history.push({ date: dateKey, ...totals, mood, moodScore });
    }

    res.status(200).json({ history, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString(), history: [] });
  }
});

// GET /api/foodlog/:userId - get today's food logs for a user
router.get('/:userId', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const logs = await FoodLog.find({
      userId: req.params.userId,
      loggedAt: { $gte: todayStart },
    });

    res.status(200).json({ logs, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
