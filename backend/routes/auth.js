const express = require('express');
const passport = require('passport');
const router = express.Router();

// Start Google OAuth flow
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google redirects here after login
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Successful login — redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`);
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

module.exports = router;