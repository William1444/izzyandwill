const express = require('express');
const router = express.Router()
const ensureApiKey = require('./../middleware/ensureApiKey');
const Invitee = require('./../models/invitee');
const crypto = require('crypto');

router.get('/', ensureApiKey, function (req, res) {
  Invitee.find({})
    .then(i => res.send(i))
});

router.get('/:id', ensureApiKey, function (req, res, next) {
  Invitee.findOne({_id: req.params.id})
    .then(invitee => {
      if (!invitee) {
        let error = new Error("Not Found");
        error.status = 404;
        return next(error)
      } else {
        res.send(invitee);
      }
    })
    .catch(err => next(err))
});

/* POST admin room */
router.put('/:id', ensureApiKey, function (req, res, next) {
  Invitee.updateOne({_id: req.params.id}, req.body)
    .then(r => res.send(r))
    .catch(err => next(err))
});

function addIdToInvitee(invitee) {
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

router.post('/bulk', ensureApiKey, function (req, res) {
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

router.post('/', ensureApiKey, function (req, res) {
  Invitee.create(addIdToInvitee(req.body))
    .then(() => res.send("SUCCESS"))
});

module.exports = router;
