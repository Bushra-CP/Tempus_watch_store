const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userSchema');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (user) {
          if (user.googleId) {
            if (req.session.signupUrl == '/signup') {
              return done(
                null,
                false,
                req.flash(
                  'error_msg',
                  'You are already signed up with Google. Please use login.',
                ),
              );
            } else if (req.session.signupUrl == '/login') {
              return done(null, user);
            }
          } else if (!user.googleId) {
            return done(
              null,
              false,
              req.flash(
                'error_msg',
                'An account with this email already exists.This account was not signed up via Google. Please log in with your email and password.',
              ),
            );
          }
        }
        const newUser = new User({
          firstName: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });
        await newUser.save();
        return done(null, user);
      } catch (error) {
        return done(
          null,
          false,
          req.flash('error_msg', 'Something went wrong. Please try again.'),
        );
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});

module.exports = passport;
