jest.mock('../utils/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('GET /api/auth/verify-email', () => {
  it('redirects with verified=0 when no token is given', async () => {
    const res = await request(app).get('/api/auth/verify-email');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/verified=0/);
  });

  it('redirects with verified=0 for an unknown token', async () => {
    const res = await request(app).get('/api/auth/verify-email?token=doesnotexist');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/verified=0/);
  });

  it('redirects with verified=0 for an expired token', async () => {
    await User.create({
      googleId: 'google-expired',
      name: 'Expired User',
      email: 'expired@example.com',
      emailVerified: false,
      verificationToken: 'expired-token',
      verificationTokenExpires: Date.now() - 1000,
    });

    const res = await request(app).get('/api/auth/verify-email?token=expired-token');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/verified=0/);
  });

  it('verifies the user and redirects with verified=1 for a valid token', async () => {
    const user = await User.create({
      googleId: 'google-valid',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      verificationToken: 'valid-token',
      verificationTokenExpires: Date.now() + 60000,
    });

    const res = await request(app).get('/api/auth/verify-email?token=valid-token');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/verified=1/);

    const updated = await User.findById(user._id);
    expect(updated.emailVerified).toBe(true);
    expect(updated.verificationToken).toBeUndefined();
  });
});

describe('POST /api/auth/resend-verification', () => {
  it('requires an active session', async () => {
    const res = await request(app).post('/api/auth/resend-verification');
    expect(res.status).toBe(401);
  });
});
