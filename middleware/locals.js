module.exports = function (req, res, next) {
  res.locals = ({
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
          name: 'RSVP',
          href: '/rsvp'
        },
        {
          name: 'Photos',
          href: '/photos'
        }
      ]
    }
  });

  next();
};
