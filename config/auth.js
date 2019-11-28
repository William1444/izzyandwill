const { isTest } = require('./index');
module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated() || isTest) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/user/login');
  },
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.admin || isTest) {
      return next();
    } else {
      req.flash('error_msg', 'Please log in as admin to view that resource');
      res.status(400).send('not authorized');
    }
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/index');
  }
};
