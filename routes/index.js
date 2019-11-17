const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('./../config/auth');

router.get('/', ensureAuthenticated, function (req, res) {
  res.render('index');
});

router.get('/wedding', ensureAuthenticated, function (req, res) {
  res.render('wedding');
});

router.get('/travel', ensureAuthenticated, function (req, res) {
  res.render('travel');
});

router.get('/sleeping', ensureAuthenticated, function (req, res) {
  res.render('sleeping');
});


router.get('/gifts', ensureAuthenticated, function (req, res) {
  res.render('gifts');
});


router.get('/photos', ensureAuthenticated, function (req, res) {
  res.render('photos');
});

module.exports = router;
