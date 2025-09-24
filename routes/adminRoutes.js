const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createMovie,
  updateMovie,
  deleteMovie,
  createTheater,
  getTheaters,
  createShowtime,
  updateShowtime,
  getDashboardStats
} = require('../controllers/adminController');

router.use(protect, admin); // All admin routes require authentication and admin role

// Movie management
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

// Theater management
router.post('/theaters', createTheater);
router.get('/theaters', getTheaters);

// Showtime management
router.post('/showtimes', createShowtime);
router.put('/showtimes/:id', updateShowtime);

// Analytics
router.get('/dashboard', getDashboardStats);

module.exports = router;