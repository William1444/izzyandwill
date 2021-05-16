const express = require('express');
const router = express.Router();
const Rsvp = require('./../models/rsvp');
const Invitee = require('./../models/invitee');
const Room = require('./../models/room');
const {ensureAuthenticated, ensureAdmin} = require('./../config/auth');

router.get('/', ensureAuthenticated, ensureAdmin, function (req, res, next) {
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

module.exports = router;
