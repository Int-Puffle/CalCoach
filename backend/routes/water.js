const express = require('express');
const router = express.Router();
const WaterLog = require('../models/WaterLog');
const User = require('../models/User');

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/water/:userId - today's cup count and goal
router.get('/:userId', async (req, res) => {
  try {
    const [cups, user] = await Promise.all([
      WaterLog.countDocuments({ userId: req.params.userId, loggedAt: { $gte: todayStart() } }),
      User.findById(req.params.userId),
    ]);
    res.status(200).json({ cups, goal: user?.dailyWaterGoalCups ?? 8, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// POST /api/water - log one cup of water for today
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    await WaterLog.create({ userId });
    const [cups, user] = await Promise.all([
      WaterLog.countDocuments({ userId, loggedAt: { $gte: todayStart() } }),
      User.findById(userId),
    ]);
    res.status(200).json({ cups, goal: user?.dailyWaterGoalCups ?? 8, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// DELETE /api/water/undo - remove the most recent cup logged today (mistap fix)
router.delete('/undo', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const last = await WaterLog.findOne({ userId, loggedAt: { $gte: todayStart() } }).sort({ loggedAt: -1 });
    if (last) await WaterLog.deleteOne({ _id: last._id });

    const [cups, user] = await Promise.all([
      WaterLog.countDocuments({ userId, loggedAt: { $gte: todayStart() } }),
      User.findById(userId),
    ]);
    res.status(200).json({ cups, goal: user?.dailyWaterGoalCups ?? 8, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// PATCH /api/water/goal - update the daily water goal (cups)
router.patch('/goal', async (req, res) => {
  try {
    const { userId, goal } = req.body;
    if (!userId || !goal || goal < 1 || goal > 30) {
      return res.status(400).json({ error: 'userId and a goal between 1 and 30 are required' });
    }

    const user = await User.findByIdAndUpdate(userId, { dailyWaterGoalCups: goal }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ goal: user.dailyWaterGoalCups, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
