const mongoose = require('mongoose');
module.exports = mongoose.model('invitee', new mongoose.Schema({
  invitees: [{
    _id: {type: String, required: true},
    fullName: {type: String, required: true},
    match: {
      firstName: [String],
      lastName: [String]
    }
  }]
}), 'invitee');
