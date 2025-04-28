// src/controllers/tradeController.js
const tradeService = require('../services/tradeService');
const Portfolio = require('../models/Portfolio');
const portfolioService = require('../services/portfolioService');


const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ 
    message: error.message || message 
  });
};

const tradeController = {
  // Buy stocks
  buyStock: async (req, res) => {
    try {
      const { symbol, shares } = req.body;
      const userId = req.user._id;

      if (!symbol || !shares || shares <= 0) {
        return res.status(400).json({ 
          message: 'Valid symbol and shares required' 
        });
      }

      const result = await tradeService.buyStock(userId, symbol, shares);
      res.json({
        message: 'Purchase successful',
        trade: result.trade,
        newBalance: result.newBalance
      });
    } catch (error) {
      handleError(res, error, 'Error executing buy order');
    }
  },

  // Sell stocks
  sellStock: async (req, res) => {
    try {
      const { symbol, shares } = req.body;
      const userId = req.user._id;

      if (!symbol || !shares || shares <= 0) {
        return res.status(400).json({ 
          message: 'Valid symbol and shares required' 
        });
      }

      const result = await tradeService.sellStock(userId, symbol, shares);
      res.json({
        message: 'Sale successful',
        trade: result.trade,
        newBalance: result.newBalance
      });
    } catch (error) {
      handleError(res, error, 'Error executing sell order');
    }
  },

  // Get trade history
  getTradeHistory: async (req, res) => {
    try {
      const userId = req.user._id;
      const trades = await tradeService.getTradeHistory(userId);
      res.json(trades);
    } catch (error) {
      handleError(res, error, 'Error fetching trade history');
    }
  },

  // Get current portfolio
  getPortfolio: async (req, res) => {
    try {
      const userId = req.user._id;
      const portfolioData = await portfolioService.getPortfolioWithMetrics(userId);
      res.json(portfolioData);
    } catch (error) {
      handleError(res, error, 'Error fetching portfolio');
    }
  }
};

module.exports = tradeController;