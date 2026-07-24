const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const PetState = require('../models/PetState');
const FoodLog = require('../models/FoodLog');

describe('POST /api/account/reset', () => {
  it('requires a userId', async () => {
    const res = await request(app).post('/api/account/reset').send({});
    expect(res.status).toBe(400);
  });

  it('wipes food logs, pet state, and onboarding fields for the user', async () => {
    const userId = new mongoose.Types.ObjectId();
    await User.create({
      _id: userId,
      googleId: `reset-${userId}`,
      name: 'Reset Test',
      email: `reset-${Date.now()}@example.com`,
      onboardingCompleted: true,
      gender: 'male',
      weightKg: 80,
      heightCm: 180,
      age: 30,
      dailyCalorieGoal: 2760,
      dailyProteinGoal: 96,
    });
    await PetState.create({ userId, coins: 500, petName: 'OldPet', mood: 'happy', moodScore: 90 });
    await FoodLog.create({ userId, foodName: 'Old meal', calories: 500, protein: 20, carbs: 50, fat: 10 });

    const res = await request(app).post('/api/account/reset').send({ userId: userId.toString() });
    expect(res.status).toBe(200);

    const logs = await FoodLog.find({ userId });
    expect(logs).toHaveLength(0);

    const petState = await PetState.findOne({ userId });
    expect(petState).toBeNull();

    const user = await User.findById(userId);
    expect(user.onboardingCompleted).toBe(false);
    expect(user.gender).toBeNull();
    expect(user.weightKg).toBeNull();
    expect(user.dailyCalorieGoal).toBe(2000);
    expect(user.dailyProteinGoal).toBe(100);
  });
});
