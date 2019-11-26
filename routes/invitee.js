const express = require('express');
const router = express.Router();
const {ensureAdmin} = require('./../config/auth');
const Invitee = require('./../models/invitee');
const mongoose = require('mongoose');

router.get('/', ensureAdmin, function (req, res) {
  Invitee.find({})
    .then(i => res.send(i))
});

function addIdToInvitee(invitee) {
  const thing = Object.assign(invitee, {
    _id: mongoose.Types.ObjectId(),
    invitees: invitee.invitees.map(i => Object.assign(i, {
      _id: mongoose.Types.ObjectId()
    }))
  });
  console.info(thing)
  return thing
}

function addIdToInvitees(invitees) {
  return invitees.map(addIdToInvitee);
}

router.post('/bulk', ensureAdmin, function (req, res) {
  Invitee.find({})
    .then(i => {
      if (i && i.length > 0) {
        res.send('invitee db already has content. Use /invitee api instead')
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
        res.send(e);
      }
    });
});

router.post('/', ensureAdmin, function (req, res) {
  Invitee.create(addIdToInvitee(req.body))
    .then(() => res.send("SUCCESS"))
});

module.exports = router;
