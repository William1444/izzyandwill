const LocalStrategy = require('passport-local').Strategy;
const { userPassword } = require('./../config');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({usernameField: 'name'}, (name, password, done) => {
      if (!password) {
        return done(null, false, {message: 'No password supplied'});
      } else {
        if (password === userPassword) {
          return done(null, {name});
        }
      }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, 1);
  });

  passport.deserializeUser(function (id, done) {
    done(null, {name: 'name'})
  });
};