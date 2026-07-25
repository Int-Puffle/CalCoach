const express = require('express');
const router = express.Router();
const FoodLog = require('../models/FoodLog');
const PetState = require('../models/PetState');
const User = require('../models/User');
const { calculateMood, calculateMealQuality } = require('../utils/mood');
const { localDateKey, todayKey, yesterdayKey } = require('../utils/date');

const COINS_PER_MEAL = 5;
const THREE_MEALS_BONUS = 25;

// A new streak day is credited the first time a user logs food on a given
// calendar day: +1 if they also logged yesterday (streak continues), reset
// to 1 if there's a gap, unchanged if today was already credited.
function nextStreak(existingPetState, today) {
  const lastStreakDate = existingPetState?.lastStreakDate;
  if (lastStreakDate === today) {
    return { streakDays: existingPetState.streakDays, lastStreakDate };
  }
  const streakDays = lastStreakDate === yesterdayKey() ? (existingPetState?.streakDays || 0) + 1 : 1;
  return { streakDays, lastStreakDate: today };
}

// POST /api/foodlog - log a meal, update pet mood, and award coins
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
    const goals = user || {};
    const { mood, moodScore } = calculateMood(totals, goals);
    const mealQuality = calculateMealQuality({ calories, protein, carbs, fat }, goals);

    const existingPetState = await PetState.findOne({ userId });
    const today = todayKey();

    let coinsAwarded = COINS_PER_MEAL;
    let mealBonusAwarded = false;
    if (todaysLogs.length === 3 && existingPetState?.lastMealBonusDate !== today) {
      coinsAwarded += THREE_MEALS_BONUS;
      mealBonusAwarded = true;
    }

    const { streakDays, lastStreakDate } = nextStreak(existingPetState, today);

    const petState = await PetState.findOneAndUpdate(
      { userId },
      {
        $set: {
          mood,
          moodScore,
          lastFedAt: new Date(),
          streakDays,
          lastStreakDate,
          ...(mealBonusAwarded ? { lastMealBonusDate: today } : {}),
        },
        $inc: { coins: coinsAwarded },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      log: newLog,
      petState,
      mealQuality,
      coinsAwarded,
      mealBonusAwarded,
      error: '',
    });
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

    const [logs, user] = await Promise.all([
      FoodLog.find({
        userId: req.params.userId,
        loggedAt: { $gte: rangeStart },
      }),
      User.findById(req.params.userId),
    ]);

    // Bucket in JS by local calendar day rather than Mongo's $dateToString
    // (which groups by UTC), so "today" here lines up with the local-time
    // "today" used everywhere else (e.g. logging a meal, the streak).
    const byDate = new Map();
    for (const log of logs) {
      const dateKey = localDateKey(log.loggedAt);
      const entry = byDate.get(dateKey) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      entry.calories += log.calories;
      entry.protein += log.protein || 0;
      entry.carbs += log.carbs || 0;
      entry.fat += log.fat || 0;
      byDate.set(dateKey, entry);
    }

    const history = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(rangeStart);
      day.setDate(day.getDate() + i);
      const dateKey = localDateKey(day);
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
