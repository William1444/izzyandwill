var express = require('express');
var router = express.Router();
const Room = require('./../models/room');

/* GET rooms */
router.get('/', function (req, res, next) {
  Room.find({})
    .then(rooms => res.render('rsvp', {
      rooms: rooms.filter(r => !r.paid && !(r.assignee && r.assignee.length > 1)),
      key: req.query.key
    }))
    .catch(err => next(err))
});

module.exports = router;
