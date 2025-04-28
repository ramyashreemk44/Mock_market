// src/controllers/chartController.js
const chartService = require('../services/chartService');
const portfolioAnalyticsService = require('../services/portfolioAnalyticsService');

const chartController = {
  // Get stock price chart data
  getStockChart: async (req, res) => {
    try {
      const { symbol } = req.params;
      const { period } = req.query || '1m';

      const chartData = await chartService.getStockPriceHistory(symbol, period);
      res.json(chartData);
    } catch (error) {
      console.error('Error getting stock chart:', error);
      res.status(500).json({ 
        message: error.message || 'Error getting stock chart data' 
      });
    }
  },

  // Get portfolio value chart
  getPortfolioChart: async (req, res) => {
    try {
      const userId = req.user._id;
      const { period } = req.query || '1m';

      const performanceData = await portfolioAnalyticsService.getPerformanceHistory(userId, period);
      
      // Format data for chart
      const chartData = {
        portfolioValue: performanceData.history.map(point => ({
          date: point.timestamp,
          value: point.totalValue,
          dayChange: point.metrics.dayChange,
          dayChangePercent: point.metrics.dayChangePercent
        })),
        metrics: performanceData.performanceMetrics
      };

      res.json(chartData);
    } catch (error) {
      console.error('Error getting portfolio chart:', error);
      res.status(500).json({ 
        message: error.message || 'Error getting portfolio chart data' 
      });
    }
  },

  // Get portfolio composition chart
  getPortfolioComposition: async (req, res) => {
    try {
      const userId = req.user._id;
      const snapshot = await portfolioAnalyticsService.takeSnapshot(userId);

      // Calculate percentages for pie chart
      const total = snapshot.snapshot.totalValue + snapshot.snapshot.cashBalance;
      const composition = {
        holdings: snapshot.snapshot.holdings.map(holding => ({
          symbol: holding.symbol,
          value: holding.value,
          percentage: (holding.value / total) * 100
        })),
        cash: {
          value: snapshot.snapshot.cashBalance,
          percentage: (snapshot.snapshot.cashBalance / total) * 100
        }
      };

      res.json(composition);
    } catch (error) {
      console.error('Error getting portfolio composition:', error);
      res.status(500).json({ 
        message: error.message || 'Error getting portfolio composition' 
      });
    }
  }
};

module.exports = chartController;