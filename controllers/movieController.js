const Showtime = require('../models/Showtime');

const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('theater');
      
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    res.json(showtime);
  } catch (error) {
    console.error('Error fetching showtime:', error);
    res.status(500).json({ 
      message: 'Error fetching showtime', 
      error: error.message 
    });
  }
};

// Export the function
module.exports = { 
  getMovies, 
  createMovie,
  getMovieById,
  getShowtimeById 
};