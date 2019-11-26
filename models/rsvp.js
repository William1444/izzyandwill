let mongoose = require('mongoose');
module.exports = mongoose.model('Rsvp', new mongoose.Schema({
  inviteeId: {type: String, unique: true, required: true},
  email: {type: String, required: true},
  attendees: [{
    _id: {type: String, require: true},
    firstName: String,
    fullName: String,
    foodChoice: String,
  }],
  absentees: [{
    _id: {type: String, require: true},
    firstName: String,
    fullName: {type: String, require: true}
  }],
  allInvitees: String,
  roomId: Number,
  message: String
}));

