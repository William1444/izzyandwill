const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('./../config/auth');

/* GET home page. */
router.get('/', ensureAuthenticated, function (req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
