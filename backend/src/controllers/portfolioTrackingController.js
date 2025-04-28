const portfolioAnalyticsService = require('../services/portfolioAnalyticsService');
const realtimePriceService = require('../services/realtimePriceService');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

const portfolioTrackingController = {
  async getPortfolioSnapshot(req, res) {
    try {
      const userId = req.user._id;
      
      // Get user and portfolio data
      const user = await User.findById(userId);
      const portfolio = await Portfolio.findOne({ userId });

      if (!user || !portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      // Get real-time prices for all holdings
      const symbols = portfolio.holdings.map(h => h.symbol);
      let prices = [];
      
      try {
        prices = await realtimePriceService.getMultipleRealTimePrices(symbols);
      } catch (error) {
        console.error('Error getting price data:', error);
        // Continue with empty prices array if there's an error
      }

      // Calculate positions even if we don't have all prices
      const positions = portfolio.holdings.map(holding => {
        const currentPrice = prices.find(p => p.symbol === holding.symbol)?.price || holding.averageBuyPrice;
        const marketValue = holding.shares * currentPrice;
        const costBasis = holding.shares * holding.averageBuyPrice;
        const unrealizedGain = marketValue - costBasis;
        const priceData = prices.find(p => p.symbol === holding.symbol);
        
        return {
          symbol: holding.symbol,
          shares: holding.shares,
          averageCost: holding.averageBuyPrice,
          currentPrice: currentPrice,
          marketValue: marketValue,
          costBasis: costBasis,
          unrealizedGain: unrealizedGain,
          unrealizedGainPercent: ((unrealizedGain / costBasis) * 100),
          dayChange: priceData?.change * holding.shares || 0,
          dayChangePercent: priceData?.changePercent || 0
        };
      });

      // Calculate portfolio totals
      const totals = positions.reduce((acc, pos) => ({
        marketValue: acc.marketValue + pos.marketValue,
        costBasis: acc.costBasis + pos.costBasis,
        unrealizedGain: acc.unrealizedGain + pos.unrealizedGain,
        dayChange: acc.dayChange + pos.dayChange
      }), { marketValue: 0, costBasis: 0, unrealizedGain: 0, dayChange: 0 });

      // Add cash balance to total value
      const totalValue = totals.marketValue + user.balance;

      res.json({
        overview: {
          totalValue: totalValue,
          marketValue: totals.marketValue,
          cashBalance: user.balance,
          unrealizedGain: totals.unrealizedGain,
          unrealizedGainPercent: totals.costBasis ? (totals.unrealizedGain / totals.costBasis) * 100 : 0,
          dayChange: totals.dayChange,
          dayChangePercent: totals.marketValue ? (totals.dayChange / totals.marketValue) * 100 : 0
        },
        positions,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Error getting portfolio snapshot:', error);
      res.status(500).json({ 
        message: error.message || 'Error getting portfolio snapshot' 
      });
    }
  }
};

module.exports = portfolioTrackingController;