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

// Check current logged-in user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;