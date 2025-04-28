// src/routes/trades.js
const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getTradeHistory, getPortfolio } = require('../controllers/tradeController');
const auth = require('../middleware/auth');

// Trading routes
router.post('/buy', auth, buyStock);
router.post('/sell', auth, sellStock);
router.get('/history', auth, getTradeHistory);
router.get('/portfolio', auth, getPortfolio);

module.exports = router;