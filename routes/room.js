const express = require('express');
const router = express.Router();
const Room = require('./../models/room');
const {ensureAuthenticated, ensureAdmin} = require('./../config/auth');

/* GET rooms */
router.get('/', ensureAuthenticated, function (req, res, next) {
  Room.find({})
    .then(rooms => res.send(rooms))
    .catch(err => next(err))
});

/* GET rooms admin */
router.get('/admin', ensureAuthenticated, ensureAdmin, function (req, res, next) {
  Room.find({})
    .then(rooms => res.render('rooms', {
      rooms: rooms.map(r => Object.assign(r, {
        isAvailableText: !(r.paid || r.assignee) ? 'Yes' : 'No',
        isAvailable: !(r.paid || r.assignee),
        isPaidText: !!r.paid ? 'Yes' : 'No',
        isAssigned: !!r.assignee,
        isPaid: !!r.paid,
        isAssignedNotPaid: r.assignee && !r.paid
      }))
    }))
    .catch(err => next(err))
});

/* GET admin room */
router.get('/admin/:id', ensureAuthenticated, ensureAdmin, function (req, res, next) {
  Room.findById({_id: req.params.id})
    .then(room => {
      if (!room) {
        let error = new Error("Not Found");
        error.status = 404;
        return next(error)
      } else {
        res.render('room-admin', {
          room
        })
      }
    })
    .catch(err => next(err))
});

/* POST admin room */
router.post('/admin/:id', ensureAuthenticated, ensureAdmin, function (req, res, next) {
  const key = req.query.key;
  const updatedRoom = {
    room: req.body.room,
    assignee: req.body.assignee,
    paid: req.body.paidCheckboxVal === 'on'
  };
  console.info(updatedRoom);
  Room.updateOne({_id: req.params.id}, updatedRoom)
    .then(() => res.redirect(`/room/admin`))
    .catch(err => next(err))
});

module.exports = router;
