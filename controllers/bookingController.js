const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const mongoose = require('mongoose');

const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { showtimeId, seats, paymentDetails } = req.body;
    
    const showtime = await Showtime.findById(showtimeId).session(session);
    if (!showtime) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Check seat availability
    for (const seat of seats) {
      const seatIndex = showtime.availableSeats.findIndex(
        s => s.row === seat.row && s.seatNumber === seat.seatNumber
      );
      
      if (seatIndex === -1 || showtime.availableSeats[seatIndex].isBooked) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'One or more seats are already booked' });
      }
    }

    // Mark seats as booked
    for (const seat of seats) {
      const seatIndex = showtime.availableSeats.findIndex(
        s => s.row === seat.row && s.seatNumber === seat.seatNumber
      );
      showtime.availableSeats[seatIndex].isBooked = true;
    }

    await showtime.save({ session });

    // Create booking
    const totalAmount = showtime.price * seats.length;
    const booking = await Booking.create([{
      user: req.user._id,
      showtime: showtimeId,
      seats,
      totalAmount,
      paymentStatus: 'completed',
      paymentDetails
    }], { session });

    await session.commitTransaction();
    
    const populatedBooking = await Booking.findById(booking[0]._id)
      .populate('showtime')
      .populate('user', 'name email');
      
    res.status(201).json(populatedBooking);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title posterUrl duration' },
          { path: 'theater', select: 'name location' }
        ]
      })
      .sort({ bookingDate: -1 });
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie' },
          { path: 'theater' }
        ]
      })
      .populate('user', 'name email phoneNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure user can only view their own bookings (unless admin)
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);
    
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Free up the seats
    const showtime = await Showtime.findById(booking.showtime).session(session);
    for (const seat of booking.seats) {
      const seatIndex = showtime.availableSeats.findIndex(
        s => s.row === seat.row && s.seatNumber === seat.seatNumber
      );
      if (seatIndex !== -1) {
        showtime.availableSeats[seatIndex].isBooked = false;
      }
    }
    await showtime.save({ session });

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = { createBooking, getUserBookings, getBookingById, cancelBooking };