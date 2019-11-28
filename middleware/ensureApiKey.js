const {apiKey} = require('./../config');

module.exports = (req, res, next) => {
  if (req.query.key === apiKey) {
    next();
  } else {
    res.status(400).send('not authorized');
  }
};
