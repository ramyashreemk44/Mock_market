// src/controllers/portfolioController.js
const portfolioAnalyticsService = require('../services/portfolioAnalyticsService');

const portfolioController = {
  // Get portfolio performance
  getPerformance: async (req, res) => {
    try {
      const userId = req.user._id;
      const { period } = req.query || '1m';
      
      const performance = await portfolioAnalyticsService.getPerformanceHistory(userId, period);
      res.json(performance);
    } catch (error) {
      console.error('Error getting portfolio performance:', error);
      res.status(500).json({ 
        message: error.message || 'Error getting portfolio performance' 
      });
    }
  },

  // Take a manual snapshot
  takeSnapshot: async (req, res) => {
    try {
      const userId = req.user._id;
      const snapshot = await portfolioAnalyticsService.takeSnapshot(userId);
      res.json(snapshot);
    } catch (error) {
      console.error('Error taking portfolio snapshot:', error);
      res.status(500).json({ 
        message: error.message || 'Error taking portfolio snapshot' 
      });
    }
  }
};

module.exports = portfolioController;