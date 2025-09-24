const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true // in minutes
  },
  genre: [{
    type: String,
    required: true
  }],
  rating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  posterUrl: {
    type: String,
    required: true
  },
  trailerUrl: String,
  cast: [{
    name: String,
    role: String
  }],
  director: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);