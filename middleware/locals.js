const {fromEmail, fromTel, mapsApiKey} = require('./../config');
module.exports = function (req, res, next) {
  const isAdmin = req.isAuthenticated() && req.user.admin;
  res.locals = {
    fromEmail,
    tel: fromTel,
    mapsApiKey,
    global: {
      views: [
        {
          name: 'Home',
          href: '/'
        },
        {
          name: 'Wedding',
          href: '/wedding'
        },
        {
          name: 'Travel',
          href: '/travel'
        },
        {
          name: 'Sleeping',
          href: '/sleeping'
        },
        {
          name: 'Gifts',
          href: '/gifts'
        },
        {
          name: 'Photos',
          href: '/photos'
        }
      ]
    }
  };
  if (isAdmin) {
    res.locals.global.views = [{name: 'admin: rsvp', href: '/rsvp/admin'}, {name: 'admin: room', href: '/room/admin'}].concat(res.locals.global.views)
  }

  next();
};
