let mongoose = require('mongoose');
module.exports = mongoose.model('invitee', new mongoose.Schema({
  _id: {type: String, required: true, unique: true},
  invitees: [{
    _id: {type: String, required: true},
    fullName: {type: String, required: true},
    match: {
      firstName: [String],
      lastName: [String]
    }
  }]
}), 'invitee');
