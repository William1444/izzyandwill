let mongoose = require('mongoose');
module.exports = mongoose.model('room', new mongoose.Schema({
  _id: Number,
  room: String,
  price: String,
  assignee: String,
  paid: Boolean
}), 'room');
