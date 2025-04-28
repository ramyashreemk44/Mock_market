// src/controllers/portfolioAdvisorController.js
const portfolioAdvisorService = require('../services/portfolioAdvisorService');

const portfolioAdvisorController = {
  async getPortfolioAnalysis(req, res) {
    try {
      const userId = req.user._id;
      const analysis = await portfolioAdvisorService.analyzePortfolio(userId);
      res.json(analysis);
    } catch (error) {
      console.error('Error getting portfolio analysis:', error);
      res.status(500).json({ 
        message: error.message || 'Error analyzing portfolio' 
      });
    }
  }
};

module.exports = portfolioAdvisorController;