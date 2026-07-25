const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');

// GoogleStrategy's constructor throws synchronously if clientID/clientSecret
// are missing, which would otherwise crash the whole server on boot. Skip
// registering it when unconfigured so the rest of the API stays usable.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
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
} else {
  console.warn('GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set — Google sign-in is disabled until backend/.env is filled in.');
}

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
