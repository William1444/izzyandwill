let mongoose = require('mongoose');
module.exports = mongoose.model('Rsvp', new mongoose.Schema({
  inviteeId: {type: String, unique: true, required: true},
  email: {type: String},
  attendees: [{
    _id: {type: String, require: true},
    leadBooker: {type: Boolean, default: false, required: true},
    firstName: String,
    fullName: String,
    foodChoice: String,
  }],
  absentees: [{
    _id: {type: String, require: true},
    leadBooker: {type: Boolean, default: false, required: true},
    firstName: String,
    fullName: {type: String, require: true}
  }],
  allInvitees: String,
  roomId: Number,
  message: String,
  time: {type: String, default: new Date().toISOString(), required: true}
}));

