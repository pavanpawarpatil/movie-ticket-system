const express = require('express');
const router = express.Router();
const { 
  getMovies, 
  createMovie,
  getMovieById 
} = require('../controllers/movieController');

// GET all movies
router.get('/', getMovies);

// GET movie by ID
router.get('/:id', getMovieById);

// CREATE a new movie (optional, for admin)
router.post('/', createMovie);

module.exports = router;