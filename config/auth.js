module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/user/login');
  },
  ensureAdmin: function(req, res, next) {
    if (req.user.admin) {
      return next();
    } else {
      req.flash('error_msg', 'Please log in as admin to view that resource');
      res.send(400, 'not authorized');
    }
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/index');
  }
};
