const express = require('express');
const router = express.Router();
const { getShowtimeById } = require('../controllers/movieController');

// Ensure the route has a proper handler
router.get('/:id', (req, res) => {
  getShowtimeById(req, res);
});

module.exports = router;