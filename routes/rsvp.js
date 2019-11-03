const url = require('url');

const express = require('express');
const router = express.Router();
const Rsvp = require('./../models/rsvp');
const Room = require('./../models/room');
const rsvpReply = require('./../services/rsvp-reply');
const basicApiKey = require('./../middleware/basic-api-key');
const NA_ROOM_ID = -1;
const ERROR_ROOM_ALREADY_ASSIGNED = 'ROOM_ALREADY_ASSIGNED';
const VALID_RSVP_QUERY_PARAMS = ['roomId', 'firstName', 'lastName', 'attending', 'otherGuests', 'errorEmailExists', 'message'];

function isRoomAssigned(room) {
  return room.paid && !(room.assignee && room.assignee.length > 1);
}

function getValidQueryParamsForModel(req) {
  const query = req.query;
  return Object.keys(query)
    .filter(key => VALID_RSVP_QUERY_PARAMS.includes(key))
    .reduce((obj, key) => {
      obj[key] = query[key];
      return obj;
    }, {});
}

/* GET rsvp */
router.get('/', function (req, res, next) {
  Room.find({})
    .then(rooms => res.render('rsvp', Object.assign({
      rooms: rooms
        .filter(r => isRoomAssigned(r))
        .sort((a, b) => a.room > b.room ? 1 : -1)
        .concat([{room: 'NA', _id: NA_ROOM_ID}]),
      key: req.query.key
    }, getValidQueryParamsForModel(req))))
    .catch(err => next(err))
});

router.get('/rsvps', basicApiKey, function (req, res, next) {
  Rsvp.find({})
    .then(rsvps => res.render('rsvps', {rsvps}))
    .catch(e => next(e))
});

function assignRoom(id, email) {
  return id === NA_ROOM_ID ? Promise.resolve(id) :
    Room.find({_id: id})
      .then(room => {
        if (isRoomAssigned(room)) {
          return Promise.reject(new Error(ERROR_ROOM_ALREADY_ASSIGNED))
        } else {
          return Room.updateOne({_id: room.id}, Object.assign(room, {assignee: email, paid: false}))
        }
      })
}

router.post('/', function (req, res, next) {
  const body = req.body;
  const roomId = body.roomId;
  const email = body.email;
  let firstName = body.firstName;
  let lastName = body.lastName;
  let attending = body.attending;
  let otherGuests = body.otherGuests;
  assignRoom(roomId, email)
    .catch(e => {
      if (e.message === ERROR_ROOM_ALREADY_ASSIGNED) {
        res.render('rsvp', {room, error: {roomTaken: true}})
      }
    })
    .then(() => Rsvp.init())
    .then(() => Rsvp.create({
      email,
      firstName: firstName,
      lastName: lastName,
      attending: attending === 'on',
      otherGuests: otherGuests,
      roomId
    }))
    .then(r => res.redirect('/rsvp?success=true'))
    .catch(e => {
      if (e.code === 11000) {
        res.redirect(url.format({
          pathname: '/rsvp',
          query: {roomId, firstName, lastName, attending, otherGuests, errorEmailExists: true}
        }))
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
