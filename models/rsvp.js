let mongoose = require('mongoose');
module.exports = mongoose.model('Rsvp', new mongoose.Schema({
  inviteeId: {type: Number, unique: true, required: true},
  inviteeFullNames: [String],
  email: {type: String, unique: true, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  attending: {type: Boolean, required: false},
  otherGuests: {type: String, required: true},
  roomId: Number,
  message: String
}));

