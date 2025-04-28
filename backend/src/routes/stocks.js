// src/routes/stocks.js
const express = require('express');
const router = express.Router();
const { searchStocks, getStockPrice, getMultipleStockPrices, getPopularStocks } = require('../controllers/stockController');
const auth = require('../middleware/auth');

// Routes with clear, concise middleware
router.get('/search', auth, searchStocks);
router.get('/price/:symbol', auth, getStockPrice);
router.get('/prices', auth, getMultipleStockPrices);
router.get('/popular', auth, getPopularStocks);

module.exports = router;