const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          emailVerified: false,
          verificationToken,
          verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
        });

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        sendVerificationEmail(user.email, `${baseUrl}/api/auth/verify-email?token=${verificationToken}`)
          .catch((err) => console.error('Failed to send verification email:', err));
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
