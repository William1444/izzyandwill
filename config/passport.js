const LocalStrategy = require('passport-local').Strategy;
const {userPassword, adminPassword} = require('./../config');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({usernameField: 'name'}, (name, password, done) => {
  if (!password) {
    return done(null, false, {message: 'No password supplied'});
  } else {
    if (password === adminPassword) {
      return done(null, {name: 'admin', admin: true});
    } else if (password === userPassword) {
      return done(null, {name: 'user'});
    } else {
      return done(null, false, {message: 'Incorrect password. Password can be found on invite'})
    }
  }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.admin ? 2 : 1);
  });

  passport.deserializeUser(function (id, done) {
    done(null, id === 2 ? {name: 'admin', admin: true} : {name: 'user', admin: false})
  });
};
