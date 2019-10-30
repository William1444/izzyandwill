var express = require('express');
var router = express.Router();
const Room = require('./../models/room');
const basicApiKey = require('./../middleware/basic-api-key');

/* GET rooms */
router.get('/', basicApiKey, function (req, res, next) {
  Room.find({})
    .then(rooms => res.send(rooms))
    .catch(err => next(err))
});

/* admin rooms */
router.get('/admin', function (req, res, next) {
  Room.find({})
    .then(rooms => res.send(rooms))
    .catch(err => next(err))
});

module.exports = router;
