const express = require('express');
const router = express.Router();
const { getMovies, getMovieById, getMovieShowtimes } = require('../controllers/movieController');

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.get('/:movieId/showtimes', getMovieShowtimes);

module.exports = router;