let mongoose = require('mongoose');
module.exports = mongoose.model('Invitee', new mongoose.Schema({
  invitees: [{
    fullName: String,
    match: {
      firstName: [String],
      lastName: [String]
    }
  }]
}));
