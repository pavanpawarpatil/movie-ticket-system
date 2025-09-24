const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Movie Management
const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Soft delete - just mark as inactive
    movie.isActive = false;
    await movie.save();
    
    res.json({ message: 'Movie deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Theater Management
const createTheater = async (req, res) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json(theater);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Showtime Management
const createShowtime = async (req, res) => {
  try {
    const { movie, theater, screen, date, time, price } = req.body;
    
    // Get theater details to create seat layout
    const theaterDoc = await Theater.findById(theater);
    const screenData = theaterDoc.screens.find(s => s.screenNumber === screen);
    
    if (!screenData) {
      return res.status(400).json({ message: 'Invalid screen number' });
    }
    
    // Generate available seats based on theater layout
    const availableSeats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    for (let i = 0; i < screenData.seatLayout.rows; i++) {
      for (let j = 1; j <= screenData.seatLayout.seatsPerRow; j++) {
        availableSeats.push({
          row: rows[i],
          seatNumber: j,
          isBooked: false
        });
      }
    }
    
    const showtime = await Showtime.create({
      movie,
      theater,
      screen,
      date,
      time,
      price,
      availableSeats
    });
    
    res.status(201).json(showtime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    res.json(showtime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Analytics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate({
        path: 'showtime',
        populate: { path: 'movie', select: 'title' }
      })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      stats: {
        totalUsers,
        totalMovies,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMovie,
  updateMovie,
  deleteMovie,
  createTheater,
  getTheaters,
  createShowtime,
  updateShowtime,
  getDashboardStats
};