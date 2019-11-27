const express = require('express');
const router = express.Router();
const {ensureAdmin} = require('./../config/auth');
const Invitee = require('./../models/invitee');
const mongoose = require('mongoose');
const crypto = require('crypto');

router.get('/', ensureAdmin, function (req, res) {
  Invitee.find({})
    .then(i => res.send(i))
});

function addIdToInvitee(invitee) {
  invitee._id = mongoose.Types.ObjectId();
  invitee.invitees = invitee.invitees.map(i => {
    i._id = crypto.randomBytes(16).toString("hex");
    i.match.lastName = i.match.lastName.map(name => name.toLowerCase());
    i.match.firstName = i.match.firstName.map(name => name.toLowerCase());
    return i;
  });
  return invitee;
}

function addIdToInvitees(invitees) {
  return invitees.map(addIdToInvitee);
}

router.post('/bulk', ensureAdmin, function (req, res) {
  Invitee.find({})
    .then(i => {
      if (i && i.length > 0) {
        res.status(400).send('invitee db already has content. Use /invitee api instead');
        throw new Error('USER_INVITEE_NOT_EMPTY');
      }
    })
    .then(() =>
      Promise.all(
        addIdToInvitees(req.body)
          .map(i => Invitee.create(i))
      ))
    .then(() => res.send("SUCCESS"))
    .catch(e => {
      if ('USER_INVITEE_NOT_EMPTY' !== e.message) {
        res.status(500).send(e.message);
      }
    });
});

router.post('/', ensureAdmin, function (req, res) {
  Invitee.create(addIdToInvitee(req.body))
    .then(() => res.send("SUCCESS"))
});

module.exports = router;
