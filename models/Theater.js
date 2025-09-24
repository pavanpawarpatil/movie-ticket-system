const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  screens: [{
    screenNumber: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      required: true
    },
    seatLayout: {
      rows: Number,
      seatsPerRow: Number
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Theater', theaterSchema);