const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('./../config/auth');

/* GET home page. */
router.get('/', ensureAuthenticated, function (req, res) {
  res.render('index');
});

/* GET home page. */
router.get('/wedding', ensureAuthenticated, function (req, res) {
  res.render('wedding');
});

/* GET home page. */
router.get('/travel', ensureAuthenticated, function (req, res) {
  res.render('travel');
});

/* GET home page. */
router.get('/sleeping', ensureAuthenticated, function (req, res) {
  res.render('sleeping');
});

/* GET home page. */
router.get('/gifts', ensureAuthenticated, function (req, res) {
  res.render('gifts');
});

/* GET home page. */
router.get('/photos', ensureAuthenticated, function (req, res) {
  res.render('photos');
});

module.exports = router;
