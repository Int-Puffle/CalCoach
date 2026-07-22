const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');
const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Start Google OAuth flow
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google redirects here after login
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Successful login — redirect to frontend
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

// Check current logged-in user. Always 200 - this endpoint reports auth
// status rather than gating access, so "not logged in" isn't an error.
router.get('/me', (req, res) => {
  res.json({ user: req.user || null });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

// Clicked from the verification email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  const user = token && await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.redirect(`${FRONTEND_URL}/dashboard?verified=0`);
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.redirect(`${FRONTEND_URL}/dashboard?verified=1`);
});

// Logged-in user asking for another verification email
router.post('/resend-verification', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  if (req.user.emailVerified) {
    return res.json({ message: 'Already verified' });
  }

  req.user.verificationToken = crypto.randomBytes(32).toString('hex');
  req.user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  await req.user.save();

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  try {
    await sendVerificationEmail(
      req.user.email,
      `${baseUrl}/api/auth/verify-email?token=${req.user.verificationToken}`
    );
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

module.exports = router;
