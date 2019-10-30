const {adminKey} = require('./../config');

module.exports = (req, res, next) => {
  if (req.query.key === adminKey) {
    next();
  } else {
    let error = new Error('Unauthorized!');
    error.status = 404;
    next(error);
  }
};
