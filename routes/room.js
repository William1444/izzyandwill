const express = require('express');
const router = express.Router();
const Room = require('./../models/room');
const {ensureAuthenticated, ensureAdmin} = require('./../config/auth');
const ensureApiKey = require('./../middleware/ensureApiKey');

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

/* POST bulk create rooms */
router.post('/bulk', ensureApiKey, function (req, res) {
  Room.find({})
    .then(i => {
      if (i && i.length > 0) {
        res.status(400).send('room db already has content. Use /room api instead');
        throw new Error('USER_ROOM_NOT_EMPTY');
      }
    })
    .then(() =>
      Promise.all(
        req.body
          .map(r => Room.create(r))
      ))
    .then(() => res.send("SUCCESS"))
    .catch(e => {
      if ('USER_ROOM_NOT_EMPTY' !== e.message) {
        res.status(500).send(e.message);
      }
    });
});

/* POST create rooms */
router.post('/', ensureApiKey, function (req, res) {
  Room.create(req.body)
    .then(() => res.send("SUCCESS"))
    .catch(e => res.status(500).send(e.message))
});

module.exports = router;
