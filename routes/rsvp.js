const express = require('express');
const router = express.Router();
const Rsvp = require('./../models/rsvp');
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

router.get('/rsvps', basicApiKey, function (req, res, next) {
  Rsvp.find({})
    .then(rsvps => res.render('rsvps', {rsvps}))
    .catch(e => next(e))
});

router.post('/', function (req, res, next) {
  let body = req.body;
  Rsvp.init()
    .then(() => Rsvp.create({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      attending: body.attending === 'on',
      otherGuests: body.otherGuests,
      room: body.room
    }))
    .then(r => res.redirect('/rsvp?success=true'))
    .catch(e => {
      if (e.code === 11000) {
        res.redirect('/rsvp?success=false&exists=true')
      } else {
        throw e
      }
    })
});

router.get('/test', basicApiKey, function (req, res, next) {
  rsvpReply.email({
    to: 'williamlacy2@gmail.com',
    firstName: 'Izzy',
    otherGuests: 'Pup',
    room: {room: 'Cheeky Bonita', price: '100.00'}
  })
    .then(r => res.send(r))
    .catch(e => next(e));
});

router.get('/test/html', basicApiKey, function (req, res, next) {
  res.send(rsvpReply.html({firstName: 'Izzy', otherGuests: 'Pup', room: {room: 'Cheeky Bonita', price: '100.00'}}));
});

module.exports = router;
