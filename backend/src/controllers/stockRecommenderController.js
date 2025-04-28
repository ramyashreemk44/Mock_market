// src/controllers/stockRecommenderController.js
const stockRecommenderService = require('../services/stockRecommenderService');
const Portfolio = require('../models/Portfolio');

const stockRecommenderController = {
  async getRecommendations(req, res) {
    try {
      const userId = req.user._id;
      const portfolio = await Portfolio.findOne({ userId })
        .populate('userId', 'balance');

      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      const { riskProfile } = req.query || 'moderate';
      const recommendations = await stockRecommenderService
        .getRecommendations(portfolio, riskProfile);

      res.json(recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ 
        message: error.message || 'Error generating recommendations' 
      });
    }
  }
};

module.exports = stockRecommenderController;