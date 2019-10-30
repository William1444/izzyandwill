var express = require('express');
var router = express.Router();
const util = require('util');
const Room = require('./../models/room');

/* GET rooms */
router.get('/', function (req, res, next) {
  Room.find({})
    .then(rooms => res.send(rooms))
    .catch(err => next(err))
});

router.get('/', function (req, res, next) {
  Room.find({})
    .then(rooms => res.send(rooms))
    .catch(err => next(err))
});

module.exports = router;
