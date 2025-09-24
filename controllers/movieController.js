const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

const getMovies = async (req, res) => {
  try {
    const { genre, language, isActive } = req.query;
    let query = {};
    
    if (genre) query.genre = genre;
    if (language) query.language = language;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const movies = await Movie.find(query);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieShowtimes = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;
    
    let query = { movie: movieId };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const showtimes = await Showtime.find(query)
      .populate('theater')
      .sort({ date: 1, time: 1 });
      
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMovies, getMovieById, getMovieShowtimes };