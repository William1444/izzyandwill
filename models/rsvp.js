let mongoose = require('mongoose');
module.exports = mongoose.model('Rsvp', new mongoose.Schema({
  email: {type: String, unique: true, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  attending: {type: Boolean, required: false},
  otherGuests: {type: String, required: true},
  room: String
}));

