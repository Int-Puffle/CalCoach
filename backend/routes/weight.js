const express = require('express');
const router = express.Router();
const WeightLog = require('../models/WeightLog');
const User = require('../models/User');
const { localDateKey } = require('../utils/date');

// POST /api/weight - log a weigh-in and update the user's current weight
router.post('/', async (req, res) => {
  try {
    const { userId, weightKg } = req.body;
    if (!userId || weightKg == null) {
      return res.status(400).json({ error: 'userId and weightKg are required' });
    }
    if (weightKg < 20 || weightKg > 300) {
      return res.status(400).json({ error: 'weightKg must be between 20 and 300' });
    }

    const log = await WeightLog.create({ userId, weightKg });
    const user = await User.findByIdAndUpdate(userId, { weightKg }, { new: true });

    res.status(200).json({ log, goalWeightKg: user?.goalWeightKg ?? null, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /api/weight/:userId?days=90 - weigh-in history for the chart (last
// entry per calendar day), plus current/goal weight
router.get('/:userId', async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 90, 1), 365);

    const rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);
    rangeStart.setDate(rangeStart.getDate() - (days - 1));

    const [logs, user] = await Promise.all([
      WeightLog.find({ userId: req.params.userId, loggedAt: { $gte: rangeStart } }).sort({ loggedAt: 1 }),
      User.findById(req.params.userId),
    ]);

    // Bucket by local calendar day (last weigh-in wins per day), consistent
    // with how "today" is computed elsewhere in the app.
    const byDate = new Map();
    for (const log of logs) {
      byDate.set(localDateKey(log.loggedAt), log.weightKg);
    }

    const history = Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, weightKg]) => ({ date, weightKg }));

    res.status(200).json({
      history,
      currentWeightKg: user?.weightKg ?? null,
      goalWeightKg: user?.goalWeightKg ?? null,
      error: '',
    });
  } catch (err) {
    res.status(500).json({ error: err.toString(), history: [] });
  }
});

// PATCH /api/weight/goal - set the target weight
router.patch('/goal', async (req, res) => {
  try {
    const { userId, goalWeightKg } = req.body;
    if (!userId || goalWeightKg == null || goalWeightKg < 20 || goalWeightKg > 300) {
      return res.status(400).json({ error: 'userId and a goalWeightKg between 20 and 300 are required' });
    }

    const user = await User.findByIdAndUpdate(userId, { goalWeightKg }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ goalWeightKg: user.goalWeightKg, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
