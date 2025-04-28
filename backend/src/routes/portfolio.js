// src/routes/portfolio.js
const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth');
const portfolioTrackingController = require('../controllers/portfolioTrackingController');
const portfolioAdvisorController = require('../controllers/portfolioAdvisorController');
const stockRecommenderController = require('../controllers/stockRecommenderController');


router.get('/performance', auth, portfolioController.getPerformance);
router.post('/snapshot', auth, portfolioController.takeSnapshot);
router.get('/snapshot', auth, portfolioTrackingController.getPortfolioSnapshot);
router.get('/analysis', auth, portfolioAdvisorController.getPortfolioAnalysis);
router.get('/recommendations', auth, stockRecommenderController.getRecommendations);


module.exports = router;