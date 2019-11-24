let mongoose = require('mongoose');
module.exports = mongoose.model('Rsvp', new mongoose.Schema({
  inviteeId: {type: Number, unique: true, required: true},
  attending: [{
    fullName: String,
    isAttending: {type: Boolean, required: true}
  }],
  inviteeFullNames: [String],
  email: {type: String, unique: true, required: true},
  otherGuests: {type: String, required: true},
  roomId: Number,
  message: String
}));

