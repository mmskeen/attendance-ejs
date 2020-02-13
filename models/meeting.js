const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: 'Name cannot be blank!'
  },
  date: String,
  time: String,
  notes: String,
  code: Number,
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  created_date: {
    type: Date,
    default: Date.now
  }
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
