// src/routes/watchlist.js
const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const auth = require('../middleware/auth');

router.get('/', auth, watchlistController.getWatchlist);
router.post('/add', auth, watchlistController.addToWatchlist);
router.delete('/:symbol', auth, watchlistController.removeFromWatchlist);
router.put('/:symbol/alerts', auth, watchlistController.updateAlerts);

module.exports = router;