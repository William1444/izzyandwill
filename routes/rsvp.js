const url = require('url');

const express = require('express');
const router = express.Router();
const Rsvp = require('./../models/rsvp');
const Invitee = require('./../models/invitee');
const Room = require('./../models/room');
const rsvpReply = require('./../services/rsvp-reply');
const {isTest, fromEmail, fromTel} = require('./../config');
const {ensureAuthenticated, ensureAdmin} = require('./../config/auth');
const NA_ROOM_ID = -1;
const ERROR_ROOM_ALREADY_ASSIGNED = 'ROOM_ALREADY_ASSIGNED';
const VALID_RSVP_QUERY_PARAMS = ['roomId', 'firstName', 'lastName', 'attending', 'otherGuests', 'errorEmailExists', 'message', 'success', 'hasSelectedRoom'];
const USER_ERRORS = ['USER_EMAIL_EXISTS', 'USER_NO_MATCH', 'USER_TOO_MANY_MATCHES'];

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

/* GET rsvp invitee */
router.get('/', ensureAuthenticated, function (req, res, next) {
  res.render('rsvp-invitee');
});

router.post('/', ensureAuthenticated, function (req, res, next) {
  const body = req.body;
  const firstName = body.firstName;
  const lastName = body.lastName;
  let inviteeFullNames, inviteeId;
  Invitee.find({'invitees.match.firstName': firstName.toLowerCase(), 'invitees.match.lastName': lastName.toLowerCase()})
    .then(invitees => {
      let sysErrorMessage, tooManyMatch = false, noMatch = false;
      if (invitees.length === 1) {
        inviteeFullNames = invitees[0].invitees.map(i => i.fullName);
        inviteeId = invitees[0]._id;
        return;
      } else if (invitees.length > 1) {
        sysErrorMessage = 'USER_TOO_MANY_MATCHES';
        tooManyMatch = true;
      } else if (invitees.length === 0) {
        sysErrorMessage = 'USER_NO_MATCH';
        noMatch = true;
      } else {
        throw new Error(`Issue finding ${firstName} and ${lastName}`);
      }
      let locals = {tooManyMatch, noMatch, firstName, lastName};
      res.render('rsvp-invitee', locals);
      throw new Error(sysErrorMessage);
    })
    .then(() => res.redirect(`/rsvp/attending/${inviteeId}`))
    .catch(e => {
      if (e.message !== 'USER_EMAIL_EXISTS' && e.message !== 'USER_NO_MATCH' && e.message !== 'USER_TOO_MANY_MATCHES') {
        console.error(e.message);
        res.send(e.message);
      }
    });
});

router.get('/attending/:inviteeId', ensureAuthenticated, function (req, res, next) {
  const inviteeId = req.params.inviteeId;
  let invitee;
  Invitee.findById({_id: inviteeId})
    .then(result => {
      if (!result) {
        throw new Error("NotFound")
      }
      invitee = result;
    })
    .then(() => Rsvp.findOne({inviteeId: inviteeId}))
    .then(rsvp => {
      res.render('rsvp-attending', {
        invitees: invitee.invitees.map(i => ({key: `attending-${i._id}`, value: i.fullName})),
        rsvp
      })
    })
    .catch(e => {
      if (USER_ERRORS.indexOf(e.message) < 0) {
        res.send(e.message);
      }
    });
});

router.post('/attending/:inviteeId', ensureAuthenticated, function (req, res, next) {
  const body = req.body;
  const attendingMap = Object.keys(body)
    .filter(key => /^attending-[0-9]+$/.test(key))
    .map(key => key.replace(/attending-/, ''))
    .reduce((accum, key) => {
      accum[Number(key)] = body[`attending-${key}`];
      return accum;
    }, {});
  res.redirect(url.format({query: attendingMap, pathname: `/rsvp/options/${req.params.inviteeId}`}));
});

router.get('/options/:inviteeId', ensureAuthenticated, function (req, res, next) {
  Invitee.findById({_id: req.params.inviteeId})
    .then(invitee => {
      const attendees = invitee.invitees.map(invitee => ({_id: invitee._id, fullName: invitee.fullName, isAttending: req.query[invitee._id].toLowerCase() === 'yes'}));
      res.render('rsvp-options', {attendees: attendees.filter(a => a.isAttending).map(a => ({key: `attending-${a._id}`, value: a.fullName})), absentees: attendees.filter(a => !a.isAttending)})
    });
});

router.get('/email', ensureAuthenticated, function (req, res, next) {
  res.render('rsvp-invitee');
});

/* GET rsvp */
// router.get('/', ensureAuthenticated, function (req, res, next) {
//   Room.find({})
//     .then(rooms => {
//       let unassignedRooms = rooms
//         .filter(r => !isRoomAssigned(r))
//         .sort((a, b) => a.room > b.room ? 1 : -1);
//       res.render('rsvp', Object.assign({
//         rooms: [{room: 'NA', _id: NA_ROOM_ID}].concat(unassignedRooms)
//       }, getValidQueryParamsForModel(req)))
//     })
//     .catch(err => next(err))
// });

router.get('/rsvps', ensureAuthenticated, ensureAdmin, function (req, res, next) {
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

// router.post('/', ensureAuthenticated, function (req, res, next) {
//   console.info(req.body);
//   const body = req.body;
//   const email = body.email;
//   const firstName = body.firstName;
//   const lastName = body.lastName;
//   const attending = body.attending === 'Yes';
//   const roomId = attending && Number(body.roomId);
//   const otherGuests = !attending && 'na' || body.otherGuests;
//   const message = body.message;
//   let room;
//   let hasSelectedRoom = roomId && roomId !== NA_ROOM_ID;
//   Rsvp.findOne({email})
//     .then(rsvp => {
//       if (rsvp) {
//         res.render('rsvp-result', {
//           roomId,
//           firstName,
//           lastName,
//           attending,
//           otherGuests,
//           errorEmailExists: true,
//           message
//         });
//         throw new Error('USER_EMAIL_EXISTS');
//       }
//     })
//     .then(() => attending && assignRoom(roomId, email))
//     .then(r => room = r)
//     .catch(e => {
//       if (e.message === ERROR_ROOM_ALREADY_ASSIGNED) {
//         res.render('rsvp-result', {room, error: {roomTaken: true}});
//         throw new Error('USER_ROOM_TAKEN');
//       } else {
//         throw e;
//       }
//     })
//     .then(() => Rsvp.init())
//     .then(() => Rsvp.create({
//       email,
//       firstName: firstName,
//       lastName: lastName,
//       attending,
//       otherGuests: otherGuests,
//       message,
//       roomId
//     }))
//     .then(() => isTest
//       ? rsvpReply.html({to: email, firstName, lastName, otherGuests, room, attending})
//       : rsvpReply.email({to: email, firstName, lastName, otherGuests, room, attending}))
//     .then(r => isTest
//       ? res.send(r)
//       : res.render('rsvp-result', {success: true, hasSelectedRoom, attending}))
//     .catch(e => {
//       if (e.message !== 'USER_ROOM_TAKEN' && e.message !== 'USER_EMAIL_EXISTS') {
//         res.send(e.message);
//       }
//       ;
//     });
// });

router.get('/test', ensureAuthenticated, ensureAdmin, function (req, res, next) {
  rsvpReply.email({
    to: 'williamlacy2@gmail.com',
    firstName: 'Izzy',
    otherGuests: 'Pup',
    room: {room: 'Cheeky Bonita', price: '100.00'}
  })
    .then(r => res.send(r))
    .catch(e => next(e));
});

router.get('/test/html', ensureAuthenticated, ensureAdmin, function (req, res, next) {
  res.send(rsvpReply.html({
    firstName: 'Izzy',
    lastName: 'Miller',
    otherGuests: 'Pup',
    room: {room: 'NA', price: '100.00'},
    message: 'Something reasonably long and \n maybe '
  }));
});

module.exports = router;
