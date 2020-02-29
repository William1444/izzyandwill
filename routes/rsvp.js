const url = require('url');

const express = require('express');
const router = express.Router();
const Rsvp = require('./../models/rsvp');
const Invitee = require('./../models/invitee');
const Room = require('./../models/room');
const rsvpReply = require('./../services/rsvp-reply');
const {isTest} = require('./../config');
const {ensureAuthenticated, ensureAdmin} = require('./../config/auth');
const NA_ROOM_ID = -1;
const ERROR_ROOM_ALREADY_ASSIGNED = 'ROOM_ALREADY_ASSIGNED';
const USER_ERRORS = ['USER_EMAIL_EXISTS', 'USER_NO_MATCH', 'USER_TOO_MANY_MATCHES', 'USER_INVITEE_EXISTS'];

function isRoomAssigned(room) {
  return room.paid || (room.assignee && room.assignee.length > 1);
}

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

function ensureRsvpDoesNotExist(inviteeId, res) {
  return Rsvp.findOne({inviteeId})
    .then(rsvp => {
      if (rsvp) {
        // tbd
        res.render('rsvp-result', Object.assign(rsvp, {errorInviteeExists: true}));
        throw new Error('USER_INVITEE_EXISTS');
      }
    });
}

/**
 *
 * @param req
 * @param attendingMap
 * @returns {Promise<[attendees, absentees]>}
 */
function getAttendees(inviteeId, attendingMap) {
  return Invitee.findById({_id: inviteeId})
    .then(invitee => {
      const invitees = invitee.invitees.map(invitee => ({
        _id: invitee._id,
        fullName: invitee.fullName,
        firstName: invitee.match.firstName[0],
        isAttending: attendingMap[invitee._id].toLowerCase() === 'yes'
      }));
      const attendees = invitees.filter(a => a.isAttending);
      const absentees = invitees.filter(a => !a.isAttending);
      return [attendees, absentees];
    });
}

function getLeadBookerId(invitee, firstName, lastName) {
  let leadBooker = invitee.invitees.find(i => {
    const firstNameMatch = i.match.firstName.find(f => firstName.toLowerCase() === f);
    const lastNameMatch = i.match.lastName.find(l => lastName.toLowerCase() === l);
    return firstNameMatch && firstNameMatch.length > 0 && lastNameMatch && lastNameMatch.length > 0
  });
  return leadBooker && leadBooker._id;
}

/* GET rsvp invitee */
router.get('/', ensureAuthenticated, function (req, res, next) {
  res.render('rsvp-invitee');
});

/* POST rsvp */
router.post('/', ensureAuthenticated, function (req, res, next) {
  const body = req.body;
  const firstName = body.firstName;
  const lastName = body.lastName;
  let inviteeFullNames, inviteeId, leadBookerInviteeId;
  Invitee.find({'invitees.match.firstName': firstName.toLowerCase(), 'invitees.match.lastName': lastName.toLowerCase()})
    .then(invitees => {
      let sysErrorMessage, tooManyMatch = false, noMatch = false;
      if (invitees.length === 1) {
        inviteeFullNames = invitees[0].invitees.map(i => i.fullName);
        inviteeId = invitees[0].id;
        leadBookerInviteeId = getLeadBookerId(invitees[0], firstName, lastName);
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
    .then(() => ensureRsvpDoesNotExist(inviteeId, res))
    .then(() => res.redirect(`/rsvp/attending/${inviteeId}/${leadBookerInviteeId}`))
    .catch(e => {
      if (USER_ERRORS.indexOf(e.message) < 0) {
        console.error(e.message);
        res.send(e.message);
      }
    });
});

router.get('/attending/:inviteeId/:leadBookerInviteeId', ensureAuthenticated, function (req, res, next) {
  const inviteeId = req.params.inviteeId;
  let invitee;
  ensureRsvpDoesNotExist(inviteeId, res)
    .then(() => Invitee.findById({_id: inviteeId}))
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

router.post('/attending/:inviteeId/:leadBookerInviteeId', ensureAuthenticated, function (req, res, next) {
  const body = req.body;
  const inviteeId = req.params.inviteeId;
  const leadBookerInviteeId = req.params.leadBookerInviteeId;
  const attendingMap = Object.keys(body)
    .filter(key => /^attending-[a-f\d]{32}$/.test(key))
    .map(key => key.replace(/attending-/, ''))
    .reduce((accum, key) => {
      accum[key] = body[`attending-${key}`];
      return accum;
    }, {});
  if (Object.keys(attendingMap).some(key => attendingMap[key] === 'Yes')) {
    res.redirect(url.format({
      query: attendingMap,
      pathname: `/rsvp/options/${inviteeId}/${leadBookerInviteeId}`
    }));
  } else {
    ensureRsvpDoesNotExist(inviteeId, res)
      .then(() => createRsvp({inviteeId, attendingMap, leadBookerInviteeId}))
      .then(rsvp => res.render('rsvp-result', {success: true,}))
      .catch(handleError(res));
  }
});

router.get('/options/:inviteeId/:leadBookerInviteeId', ensureAuthenticated, function (req, res, next) {
  getAttendees(req.params.inviteeId, req.query)
    .then(([attendees, absentees]) => res.render('rsvp-options', {
      attendees: attendees.map(a => ({key: `meal-${a._id}`, value: a.fullName})),
      absentees
    }));
});

router.post('/options/:inviteeId/:leadBookerInviteeId', ensureAuthenticated, function (req, res, next) {
  const attendingMap = req.query;
  const body = req.body;
  const email = body.email;
  const roomId = Number(body.roomId);
  const message = body.message;
  const inviteeId = req.params.inviteeId;
  const leadBookerInviteeId = req.params.leadBookerInviteeId;
  let rsvp;
  const foodMap = Object.keys(body)
    .filter(key => /^meal-[a-f\d]{32}$/.test(key))
    .map(key => key.replace(/meal-/, ''))
    .reduce((accum, key) => {
      accum[key] = body[`meal-${key}`];
      return accum;
    }, {});
  let hasSelectedRoom = roomId && roomId !== NA_ROOM_ID;
  ensureRsvpDoesNotExist(inviteeId, res)
    .then(() => assignRoom(roomId, email))
    .then(r => room = r)
    .catch(e => {
      if (e.message === ERROR_ROOM_ALREADY_ASSIGNED) {
        res.render('rsvp-result', {room, error: {roomTaken: true}});
        throw new Error('USER_ROOM_TAKEN');
      } else {
        throw e;
      }
    })
    .then(() => createRsvp({inviteeId, attendingMap, leadBookerInviteeId, foodMap, message, roomId, email}))
    .then(rsvpResult => rsvp = rsvpResult)
    .then(rsvp => isTest
      ? rsvpReply.html({attendees: rsvp.attendees, absentees: rsvp.absentees, room})
      : rsvpReply.email({to: rsvp.email, attendees: rsvp.attendees, absentees: rsvp.absentees, room})
        .then(r => rsvpReply.email({to: 'isabelmiller27@gmail.com', attendees: rsvp.attendees, absentees: rsvp.absentees, room}))
    )
    .then(r => isTest
      ? res.send(r)
      : res.render('rsvp-result', {success: true, hasSelectedRoom, attending: rsvp.attendees.length > 0}))
    .catch(handleError(res));
});

function handleError(res) {
  return e => {
    if (e.message !== 'USER_ROOM_TAKEN' && e.message !== 'USER_EMAIL_EXISTS') {
      res.send(e.message);
    }
  }
}

function createRsvp({inviteeId, attendingMap, leadBookerInviteeId, foodMap = {}, message = '', roomId = NA_ROOM_ID, email = ''}) {
  return Rsvp.init()
    .then(() => getAttendees(inviteeId, attendingMap))
    .then(([attendees, absentees]) => {
      const invitees = attendees.concat(absentees);
      return Rsvp.create({
        email,
        attendees: attendees.map(attendee => Object.assign(attendee, {
          foodChoice: foodMap[attendee._id],
          leadBooker: attendee._id === leadBookerInviteeId
        })),
        absentees: absentees.map(absentee => Object.assign(absentee, {
          leadBooker: absentee._id === leadBookerInviteeId
        })),
        allInvitees: invitees.map(i => i.fullName).join(', '),
        message,
        roomId,
        inviteeId
      });
    });
}

router.get('/admin', ensureAuthenticated, ensureAdmin, function (req, res, next) {
  let rsvps;
  let inviteCounter = 0, togetherSwitch;
  Promise.all([Rsvp.find({}), Invitee.find({}), Room.find({})])
    .then(([rsvps, invitees, rooms]) =>
      rsvps
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .reduce((accum, rsvp) => {
          inviteCounter += 1;
          let roomId = rsvp.roomId;
          const room = roomId > -1 ? rooms.find(r => r._id === roomId) : {room: 'NA'};
          togetherSwitch = inviteCounter % 2 === 0 ? 'a' : 'b';
          const absentees = rsvp.absentees.map(absentee => Object.assign(absentee, {
            hasRsvp: true,
            hasRsvpText: 'Yes',
            isAttending: 'No',
            foodChoice: 'NA',
            email: rsvp.email,
            togetherSwitch,
            roomPaid: 'NA',
            roomPrice: 'NA',
            room: 'NA',
            message: rsvp.message,
            time: rsvp.time
          }));
          const attendees = rsvp.attendees.map(attendee => Object.assign(attendee, {
            hasRsvp: true,
            hasRsvpText: 'Yes',
            isAttending: 'Yes',
            email: rsvp.email,
            togetherSwitch,
            room: room.room,
            roomPaid: room.paid,
            roomPrice: room.price,
            message: rsvp.message,
            time: rsvp.time
          }));
          const sortedInvitees = absentees.concat(attendees)
            .sort((a, b) => b.isAttending === 'Yes' ? 1 : 0)
            .sort((a, b) => b.leadBooker ? 1 : 0);
          return accum.concat(sortedInvitees);
        }, [])
        .concat(
          invitees
            .filter(invitee => !rsvps.find(r => r.inviteeId === invitee.id))
            .reduce((accum, invitee, i) => {
              inviteCounter += 1;
              const togetherSwitch = inviteCounter % 2 === 0 ? 'a' : 'b';
              return accum.concat(
                invitee.invitees.map(guest => ({
                  fullName: guest.fullName,
                  hasRsvp: false,
                  hasRsvpText: 'No',
                  isAttending: '',
                  foodChoice: '',
                  email: '',
                  togetherSwitch,
                  roomPaid: '',
                  roomPrice: '',
                  room: '',
                  message: '',
                  time: ''
                })))
            }, [])
        )
    )
    .then(inviteesStatus => res.render('rsvps', {
      invitees: inviteesStatus,
      totals: {
        attending: inviteesStatus.filter(i => i.hasRsvp && i.isAttending === 'Yes').length,
        notAttending: inviteesStatus.filter(i => i.hasRsvp && i.isAttending === 'No').length,
        replied: inviteesStatus.filter(i => i.hasRsvp).length,
        notReplied: inviteesStatus.filter(i => !i.hasRsvp).length,
        invitees: inviteesStatus.length
      }
    }))
    .catch(e => next(e));
});

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
