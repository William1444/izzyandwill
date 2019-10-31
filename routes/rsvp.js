const express = require('express');
const router = express.Router();
const Room = require('./../models/room');
const rsvpReply = require('./../services/rsvp-reply');
const basicApiKey = require('./../middleware/basic-api-key');

/* GET rooms */
router.get('/', function (req, res, next) {
  Room.find({})
    .then(rooms => res.render('rsvp', {
      rooms: rooms.filter(r => !r.paid && !(r.assignee && r.assignee.length > 1)),
      key: req.query.key
    }))
    .catch(err => next(err))
});

router.get('/test', basicApiKey, function (req, res, next) {
  rsvpReply.email({to: 'williamlacy2@gmail.com', firstName: 'Izzy', otherGuests: 'Pup', room: {room: 'Cheeky Bonita', price: '100.00'}})
    .then(r => res.send(r))
    .catch(e => next(e));
});

router.get('/test/html', basicApiKey, function (req, res, next) {
  res.send(rsvpReply.html({firstName: 'Izzy', otherGuests: 'Pup', room: {room: 'Cheeky Bonita', price: '100.00'}}));
});

module.exports = router;
