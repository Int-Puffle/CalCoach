const express = require('express');
const router = express.Router();
const FoodLog = require('../models/FoodLog');
const PetState = require('../models/PetState');

// POST /api/foodlog - log a meal and update pet mood
router.post('/', async (req, res) => {
  try {
    const { userId, foodName, calories, protein, carbs, fat } = req.body;

    if (!userId || !foodName || calories == null) {
      return res.status(400).json({ error: 'userId, foodName, and calories are required' });
    }

    const newLog = new FoodLog({ userId, foodName, calories, protein, carbs, fat });
    await newLog.save();

    // recalculate pet mood based on today's totals
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysLogs = await FoodLog.find({ userId, loggedAt: { $gte: todayStart } });
    const totalCalories = todaysLogs.reduce((sum, log) => sum + log.calories, 0);

    // simple mood logic - tweak later
    let moodScore = 50;
    if (totalCalories > 0 && totalCalories <= 2200) moodScore = 80;
    else if (totalCalories > 2200 && totalCalories <= 2800) moodScore = 60;
    else if (totalCalories > 2800) moodScore = 30;

    let mood = 'neutral';
    if (moodScore >= 70) mood = 'happy';
    else if (moodScore >= 45) mood = 'neutral';
    else mood = 'sad';

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