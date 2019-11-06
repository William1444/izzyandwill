const url = require('url');

const express = require('express');
const router = express.Router();
const Rsvp = require('./../models/rsvp');
const Room = require('./../models/room');
const rsvpReply = require('./../services/rsvp-reply');
const basicApiKey = require('./../middleware/basic-api-key');
const {ensureAuthenticated} = require('./../config/auth');
const NA_ROOM_ID = -1;
const ERROR_ROOM_ALREADY_ASSIGNED = 'ROOM_ALREADY_ASSIGNED';
const VALID_RSVP_QUERY_PARAMS = ['roomId', 'firstName', 'lastName', 'attending', 'otherGuests', 'errorEmailExists', 'message', 'success', 'hasSelectedRoom'];

function isRoomAssigned(room) {
  return room.paid || (room.assignee && room.assignee.length > 1);
}

function getValidQueryParamsForModel(req) {
  const query = req.query;
  return Object.keys(query)
    .filter(key => VALID_RSVP_QUERY_PARAMS.includes(key))
    .reduce((obj, key) => {
      if (query[key] === 'false') {
        obj[key] = false
      } else if (query[key] === 'true') {
        obj[key] = true
      } else {
        obj[key] = query[key];
      }
      return obj;
    }, {});
}

/* GET rsvp */
router.get('/', ensureAuthenticated, function (req, res, next) {
  Room.find({})
    .then(rooms => {
      let unassignedRooms = rooms
        .filter(r => !isRoomAssigned(r))
        .sort((a, b) => a.room > b.room ? 1 : -1);
      res.render('rsvp', Object.assign({
        rooms: [{room: 'NA', _id: NA_ROOM_ID}].concat(unassignedRooms),
        key: req.query.key
      }, getValidQueryParamsForModel(req)))
    })
    .catch(err => next(err))
});

router.get('/rsvps', ensureAuthenticated, basicApiKey, function (req, res, next) {
  Rsvp.find({})
    .then(rsvps => Promise.all(rsvps
      .map(rsvp => Room.findOne({_id: rsvp.roomId})
        .then(room =>
          Object.assign(rsvp, {room: room && room.room || 'NA'})
        )
      )))
    .then(rsvps => res.render('rsvps', {rsvps}))
    .catch(e => next(e));
});

function assignRoom(id, email) {
  let room;
  return id === NA_ROOM_ID ? Promise.resolve({_id: id}) :
    Room.findOne({_id: id})
      .then(r => {
        room = r;
        if (isRoomAssigned(room)) {
          return Promise.reject(new Error(ERROR_ROOM_ALREADY_ASSIGNED))
        } else {
          return Room.updateOne({_id: room.id}, Object.assign(room, {assignee: email, paid: false}))
        }
      })
      .then(() => room)
}

router.post('/', ensureAuthenticated, function (req, res, next) {
  console.info(req.body);
  const body = req.body;
  const roomId = Number(body.roomId);
  const email = body.email;
  const firstName = body.firstName;
  const lastName = body.lastName;
  const attending = body.attending === 'Yes';
  console.info(attending, body.attending);
  const otherGuests = body.otherGuests;
  const message = body.message;
  let room;
  let hasSelectedRoom = roomId !== NA_ROOM_ID;
  Rsvp.findOne({email})
    .then(rsvp => {
      if (rsvp) {
        res.redirect(url.format({
          pathname: '/rsvp',
          query: {roomId, firstName, lastName, attending, otherGuests, errorEmailExists: true, message}
        }));
        throw new Error('email exists');
      }
    })
    .then(() => assignRoom(roomId, email))
    .then(r => room = r)
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
      attending,
      otherGuests: otherGuests,
      message,
      roomId
    }))
    .then(() => rsvpReply.email(
      {to: email, firstName, lastName, otherGuests, room, attending}))
    .then(() => res.redirect(url.format({
      pathname: '/rsvp',
      query: {success: true, hasSelectedRoom, attending}
    })))
});

router.get('/test', ensureAuthenticated, basicApiKey, function (req, res, next) {
  rsvpReply.email({
    to: 'williamlacy2@gmail.com',
    firstName: 'Izzy',
    otherGuests: 'Pup',
    room: {room: 'Cheeky Bonita', price: '100.00'}
  })
    .then(r => res.send(r))
    .catch(e => next(e));
});

router.get('/test/html', ensureAuthenticated, basicApiKey, function (req, res, next) {
  res.send(rsvpReply.html({
    firstName: 'Izzy',
    lastName: 'Miller',
    otherGuests: 'Pup',
    room: {room: 'NA', price: '100.00'},
    message: 'Something reasonably long and \n maybe '
  }));
});

module.exports = router;
