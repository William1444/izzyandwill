const rooms = require('../rooms');

module.exports = {
  up(db) {
    return db.collection('room').insertMany(rooms);
  },

  down(db) {
    return db.collection('room').drop();
  }
};
