// src/services/watchlistService.js
const Watchlist = require('../models/Watchlist');
const stockService = require('./stockService');

const watchlistService = {
  async getWatchlist(userId) {
    try {
      let watchlist = await Watchlist.findOne({ userId });
      
      if (!watchlist) {
        watchlist = await Watchlist.create({ userId, stocks: [] });
      }

      // Get current prices for all watched stocks
      const watchlistData = await Promise.all(
        watchlist.stocks.map(async (stock) => {
          try {
            const stockData = await stockService.getStockPrice(stock.symbol);
            return {
              symbol: stock.symbol,
              currentPrice: stockData.price,
              change: stockData.change,
              changePercent: stockData.changePercent,
              alertPrice: stock.alertPrice,
              addedAt: stock.addedAt
            };
          } catch (error) {
            console.error(`Error fetching price for ${stock.symbol}:`, error);
            return {
              symbol: stock.symbol,
              error: 'Unable to fetch current price',
              alertPrice: stock.alertPrice,
              addedAt: stock.addedAt
            };
          }
        })
      );

      return watchlistData;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },

  async addToWatchlist(userId, { symbol, alertAbove, alertBelow }) {
    try {
      // Verify the stock exists
      await stockService.getStockPrice(symbol);

      let watchlist = await Watchlist.findOne({ userId });
      if (!watchlist) {
        watchlist = new Watchlist({ userId, stocks: [] });
      }

      // Check if stock is already in watchlist
      const stockIndex = watchlist.stocks.findIndex(s => s.symbol === symbol);
      if (stockIndex !== -1) {
        throw new Error('Stock already in watchlist');
      }

      watchlist.stocks.push({
        symbol,
        alertPrice: {
          above: alertAbove,
          below: alertBelow
        }
      });

      await watchlist.save();
      return watchlist;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },

  async removeFromWatchlist(userId, symbol) {
    try {
      const watchlist = await Watchlist.findOne({ userId });
      if (!watchlist) {
        throw new Error('Watchlist not found');
      }

      watchlist.stocks = watchlist.stocks.filter(stock => stock.symbol !== symbol);
      await watchlist.save();
      return watchlist;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },

  async updateAlerts(userId, symbol, { alertAbove, alertBelow }) {
    try {
      const watchlist = await Watchlist.findOne({ userId });
      if (!watchlist) {
        throw new Error('Watchlist not found');
      }

      const stock = watchlist.stocks.find(s => s.symbol === symbol);
      if (!stock) {
        throw new Error('Stock not found in watchlist');
      }

      stock.alertPrice = {
        above: alertAbove,
        below: alertBelow
      };

      await watchlist.save();
      return watchlist;
    } catch (error) {
      console.error('Error updating alerts:', error);
      throw error;
    }
  }
};

module.exports = watchlistService;