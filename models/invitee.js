let mongoose = require('mongoose');
module.exports = mongoose.model('invitee', new mongoose.Schema({
  _id: Number,
  invitees: [{
    fullName: String,
    match: {
      firstName: [String],
      lastName: [String]
    }
  }]
}), 'invitee');
