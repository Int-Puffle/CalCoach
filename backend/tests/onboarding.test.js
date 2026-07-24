const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const PetState = require('../models/PetState');

async function createUser(overrides = {}) {
  return User.create({
    googleId: `onboarding-${new mongoose.Types.ObjectId()}`,
    name: 'Test User',
    email: `onboarding-${Date.now()}-${Math.random()}@example.com`,
    ...overrides,
  });
}

describe('POST /api/onboarding/complete', () => {
  it('rejects a request missing required bio fields', async () => {
    const user = await createUser();
    const res = await request(app)
      .post('/api/onboarding/complete')
      .send({ userId: user._id.toString() });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('rejects an out-of-range weight', async () => {
    const user = await createUser();
    const res = await request(app)
      .post('/api/onboarding/complete')
      .send({ userId: user._id.toString(), gender: 'male', weightKg: 1000, heightCm: 180, age: 30 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/weightKg/);
  });

  it('computes and saves personalized goals, sets the pet name, and flips onboardingCompleted', async () => {
    const user = await createUser();

    const res = await request(app).post('/api/onboarding/complete').send({
      userId: user._id.toString(),
      petName: 'Sprout',
      gender: 'male',
      weightKg: 80,
      heightCm: 180,
      age: 30,
      activityLevel: 'moderate',
      goal: 'maintain',
    });

    expect(res.status).toBe(200);
    expect(res.body.user.onboardingCompleted).toBe(true);
    expect(res.body.user.dailyCalorieGoal).toBe(2760);
    expect(res.body.user.dailyProteinGoal).toBe(96);
    expect(res.body.petState.petName).toBe('Sprout');
    expect(res.body.bmi).toBeCloseTo(24.7, 1);

    const savedUser = await User.findById(user._id);
    expect(savedUser.onboardingCompleted).toBe(true);
    expect(savedUser.weightKg).toBe(80);
  });

  it('defaults the pet name to Binky when none is given', async () => {
    const user = await createUser();
    const res = await request(app).post('/api/onboarding/complete').send({
      userId: user._id.toString(),
      gender: 'female',
      weightKg: 60,
      heightCm: 165,
      age: 25,
    });

    expect(res.body.petState.petName).toBe('Binky');
  });

  it('404s for an unknown userId', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post('/api/onboarding/complete').send({
      userId: missingId,
      gender: 'male',
      weightKg: 80,
      heightCm: 180,
      age: 30,
    });

    expect(res.status).toBe(404);
  });
});
