const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PetState = require('../models/PetState');
const { calculateGoals } = require('../utils/health');

const VALID_GENDERS = ['male', 'female', 'other'];

// POST /api/onboarding/complete - save the new user's bio stats, compute
// personalized calorie/protein goals from them, and set the pet's name
router.post('/complete', async (req, res) => {
  try {
    const { userId, petName, gender, weightKg, heightCm, age, activityLevel, goal } = req.body;

    if (!userId || !gender || weightKg == null || heightCm == null || age == null) {
      return res.status(400).json({ error: 'userId, gender, weightKg, heightCm, and age are required' });
    }
    if (!VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ error: 'gender must be male, female, or other' });
    }
    if (weightKg < 20 || weightKg > 300) {
      return res.status(400).json({ error: 'weightKg must be between 20 and 300' });
    }
    if (heightCm < 100 || heightCm > 250) {
      return res.status(400).json({ error: 'heightCm must be between 100 and 250' });
    }
    if (age < 5 || age > 120) {
      return res.status(400).json({ error: 'age must be between 5 and 120' });
    }

    const { dailyCalorieGoal, dailyProteinGoal, bmi } = calculateGoals({
      gender,
      weightKg,
      heightCm,
      age,
      activityLevel,
      goal,
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        gender,
        weightKg,
        heightCm,
        age,
        activityLevel: activityLevel || 'moderate',
        goal: goal || 'maintain',
        dailyCalorieGoal,
        dailyProteinGoal,
        onboardingCompleted: true,
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    const petState = await PetState.findOneAndUpdate(
      { userId },
      { petName: (petName || 'Binky').trim().slice(0, 24) || 'Binky' },
      { upsert: true, new: true }
    );

    res.status(200).json({ user, petState, bmi, error: '' });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
