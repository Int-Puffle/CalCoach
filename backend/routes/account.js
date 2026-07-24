const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PetState = require('../models/PetState');
const FoodLog = require('../models/FoodLog');

// POST /api/account/reset - wipe a user's food logs and pet progress, and
// send them back through onboarding to start over with a new pet
router.post('/reset', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    await Promise.all([
      FoodLog.deleteMany({ userId }),
      PetState.deleteOne({ userId }),
      User.findByIdAndUpdate(userId, {
        onboardingCompleted: false,
        gender: null,
        weightKg: null,
        heightCm: null,
        age: null,
        activityLevel: null,
        goal: null,
        dailyCalorieGoal: 2000,
        dailyProteinGoal: 100,
      }),
    ]);

    res.status(200).json({ message: 'Reset complete', error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
