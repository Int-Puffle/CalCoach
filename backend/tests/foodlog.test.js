const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('POST /api/foodlog', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  it('rejects a request missing required fields', async () => {
    const res = await request(app).post('/api/foodlog').send({ userId });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('logs a meal and returns a happy pet state for a light day', async () => {
    const res = await request(app)
      .post('/api/foodlog')
      .send({ userId, foodName: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 });

    expect(res.status).toBe(200);
    expect(res.body.log.foodName).toBe('Apple');
    expect(res.body.petState.mood).toBe('happy');
    expect(res.body.petState.moodScore).toBe(80);
  });

  it('drops the pet mood to sad once daily calories exceed 2800', async () => {
    await request(app)
      .post('/api/foodlog')
      .send({ userId, foodName: 'Feast', calories: 3000, protein: 0, carbs: 0, fat: 0 });

    const res = await request(app)
      .post('/api/foodlog')
      .send({ userId, foodName: 'Dessert', calories: 200, protein: 0, carbs: 0, fat: 0 });

    expect(res.body.petState.mood).toBe('sad');
    expect(res.body.petState.moodScore).toBe(30);
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
