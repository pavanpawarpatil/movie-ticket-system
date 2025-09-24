const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');

router.use(protect); // All booking routes require authentication

router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;