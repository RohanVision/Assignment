const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: Date,
  time: String,
  isTimeSlotAvailable: Boolean,
});

module.exports = mongoose.model('appointment', appointmentSchema);
