var express = require('express');
var router = express.Router();
const Room = require('./../models/room');
const basicApiKey = require('./../middleware/basic-api-key');
const {ensureAuthenticated} = require('./../config/auth');

/* GET rooms */
router.get('/', ensureAuthenticated, function (req, res, next) {
  Room.find({})
    .then(rooms => res.send(rooms))
    .catch(err => next(err))
});

/* GET rooms admin */
router.get('/admin', ensureAuthenticated, basicApiKey, function (req, res, next) {
  Room.find({})
    .then(rooms => res.render('rooms', {rooms, key: req.query.key}))
    .catch(err => next(err))
});

/* GET admin room */
router.get('/admin/:id', ensureAuthenticated, basicApiKey, function (req, res, next) {
  Room.findById({_id: req.params.id})
    .then(room => {
      if (!room) {
        let error = new Error("Not Found");
        error.status = 404;
        return next(error)
      } else {
        res.render('room-admin', {
          room,
          key: req.query.key
        })
      }
    })
    .catch(err => next(err))
});

/* POST admin room */
router.post('/admin/:id', ensureAuthenticated, basicApiKey, function (req, res, next) {
  const key = req.query.key;
  const updatedRoom = {
    room: req.body.room,
    assignee: req.body.assignee,
    paid: req.body.paidCheckboxVal === 'on'
  };
  console.info(updatedRoom);
  Room.updateOne({_id: req.params.id}, updatedRoom)
    .then(() => res.redirect(`/room/admin?key=${key}`))
    .catch(err => next(err))
});

module.exports = router;
