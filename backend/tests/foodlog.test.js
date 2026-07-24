const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const FoodLog = require('../models/FoodLog');
const User = require('../models/User');

describe('POST /api/foodlog', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  it('rejects a request missing required fields', async () => {
    const res = await request(app).post('/api/foodlog').send({ userId });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('is happy when a balanced meal lands on the default goals', async () => {
    const res = await request(app)
      .post('/api/foodlog')
      .send({ userId, foodName: 'Balanced meal', calories: 2000, protein: 100, carbs: 225, fat: 56 });

    expect(res.status).toBe(200);
    expect(res.body.log.foodName).toBe('Balanced meal');
    expect(res.body.petState.mood).toBe('happy');
    expect(res.body.petState.moodScore).toBeGreaterThanOrEqual(70);
  });

  it('is sad after badly under-eating for the day', async () => {
    const underUserId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/foodlog')
      .send({ userId: underUserId, foodName: 'Small snack', calories: 150, protein: 5, carbs: 20, fat: 5 });

    expect(res.body.petState.mood).toBe('sad');
  });

  it('turns sick from drastically overeating rather than just sad', async () => {
    const overUserId = new mongoose.Types.ObjectId().toString();
    await request(app)
      .post('/api/foodlog')
      .send({ userId: overUserId, foodName: 'Feast', calories: 3000, protein: 150, carbs: 300, fat: 100 });

    const res = await request(app)
      .post('/api/foodlog')
      .send({ userId: overUserId, foodName: 'Dessert', calories: 1200, protein: 20, carbs: 150, fat: 60 });

    expect(res.body.petState.mood).toBe('sick');
  });

  it('scores against the logged-in user\'s own goals, not the defaults', async () => {
    const goalUserId = new mongoose.Types.ObjectId();
    await User.create({
      _id: goalUserId,
      googleId: 'goal-test-google-id',
      name: 'Goal User',
      email: 'goal-user@example.com',
      dailyCalorieGoal: 1500,
      dailyProteinGoal: 60,
    });

    const res = await request(app)
      .post('/api/foodlog')
      .send({ userId: goalUserId.toString(), foodName: 'Fitted meal', calories: 1500, protein: 60, carbs: 169, fat: 42 });

    expect(res.body.petState.mood).toBe('happy');
  });
});

describe('GET /api/foodlog/:userId', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  it('returns only today\'s logs for the given user', async () => {
    await request(app)
      .post('/api/foodlog')
      .send({ userId, foodName: 'Toast', calories: 150, protein: 4, carbs: 20, fat: 5 });

    const res = await request(app).get(`/api/foodlog/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(1);
    expect(res.body.logs[0].foodName).toBe('Toast');
  });

  it('returns an empty list for a user with no logs', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/foodlog/${otherUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(0);
  });
});

describe('GET /api/foodlog/petstate/:userId', () => {
  it('returns null when the user has no pet state yet', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/foodlog/petstate/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.petState).toBeNull();
  });
});

describe('GET /api/foodlog/stats/:userId', () => {
  it('defaults to a 30-day history, zero-filled with no logs', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/foodlog/stats/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(30);
    expect(res.body.history.every((day) => day.calories === 0 && day.mood === 'neutral')).toBe(true);
    expect(res.body.history[29].date).toBe(new Date().toISOString().slice(0, 10));
  });

  it('aggregates multiple logs on the same day and keeps days separate', async () => {
    const userId = new mongoose.Types.ObjectId();
    const today = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await FoodLog.create([
      { userId, foodName: 'Breakfast', calories: 800, protein: 40, carbs: 90, fat: 22, loggedAt: today },
      { userId, foodName: 'Lunch', calories: 1200, protein: 60, carbs: 135, fat: 34, loggedAt: today },
      { userId, foodName: 'Old meal', calories: 300, protein: 10, carbs: 30, fat: 5, loggedAt: twoDaysAgo },
    ]);

    const res = await request(app).get(`/api/foodlog/stats/${userId}?days=7`);
    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(7);

    const todayEntry = res.body.history[6];
    expect(todayEntry.calories).toBe(2000);
    expect(todayEntry.protein).toBe(100);
    expect(todayEntry.mood).toBe('happy');

    const oldMealEntry = res.body.history[4];
    expect(oldMealEntry.calories).toBe(300);
  });

  it('clamps an out-of-range days value to the 90-day max', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/foodlog/stats/${userId}?days=500`);
    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(90);
  });
});
