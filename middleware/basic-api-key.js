const express = require('express');
const app = express();
const {adminKey} = require('./../config');

module.exports = app.use((req, res, next) => {
  if (req.param('key') === adminKey) {
    next();
  } else {
    let error = new Error('Unauthorized!');
    error.status = 404;
    next(error);
  }
});
