// src/controllers/watchlistController.js
const watchlistService = require('../services/watchlistService');

const watchlistController = {
  getWatchlist: async (req, res) => {
    try {
      const userId = req.user._id;
      const watchlist = await watchlistService.getWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ 
        message: error.message || 'Error fetching watchlist' 
      });
    }
  },

  addToWatchlist: async (req, res) => {
    try {
      const userId = req.user._id;
      const { symbol, alertAbove, alertBelow } = req.body;

      if (!symbol) {
        return res.status(400).json({ message: 'Symbol is required' });
      }

      const watchlist = await watchlistService.addToWatchlist(userId, {
        symbol,
        alertAbove,
        alertBelow
      });

      res.json(watchlist);
    } catch (error) {
      res.status(error.message === 'Stock already in watchlist' ? 400 : 500)
        .json({ message: error.message || 'Error adding to watchlist' });
    }
  },

  removeFromWatchlist: async (req, res) => {
    try {
      const userId = req.user._id;
      const { symbol } = req.params;

      await watchlistService.removeFromWatchlist(userId, symbol);
      res.json({ message: 'Stock removed from watchlist' });
    } catch (error) {
      res.status(500).json({ 
        message: error.message || 'Error removing from watchlist' 
      });
    }
  },

  updateAlerts: async (req, res) => {
    try {
      const userId = req.user._id;
      const { symbol } = req.params;
      const { alertAbove, alertBelow } = req.body;

      const watchlist = await watchlistService.updateAlerts(userId, symbol, {
        alertAbove,
        alertBelow
      });

      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ 
        message: error.message || 'Error updating alerts' 
      });
    }
  }
};

module.exports = watchlistController;