// src/routes/charts.js
const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');
const auth = require('../middleware/auth');

router.get('/stock/:symbol', auth, chartController.getStockChart);
router.get('/portfolio', auth, chartController.getPortfolioChart);
router.get('/composition', auth, chartController.getPortfolioComposition);

module.exports = router;