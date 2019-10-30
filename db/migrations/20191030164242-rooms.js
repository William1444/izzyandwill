const rooms = require('../rooms');

module.exports = {
  up(db) {
    return db.collection('rooms').insertMany(rooms);
  },

  down(db) {
    return db.collection('rooms').drop();
  }
};
