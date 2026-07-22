const request = require('supertest');
const app = require('../app');

describe('GET /api/auth/me', () => {
  it('returns 401 with a null user when not logged in', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.user).toBeNull();
  });
});

describe('POST /api/auth/logout', () => {
  it('succeeds even when no session is active', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');
  });
});
