// src/services/portfolioService.js
const Portfolio = require('../models/Portfolio');
const stockService = require('./stockService');

const portfolioService = {
  async calculatePortfolioValue(portfolio) {
    let totalValue = 0;
    const holdingsWithCurrentPrice = [];

    // Calculate current value for each holding
    for (const holding of portfolio.holdings) {
      try {
        const stockData = await stockService.getStockPrice(holding.symbol);
        const currentValue = stockData.price * holding.shares;
        const profit = (stockData.price - holding.averageBuyPrice) * holding.shares;
        const profitPercentage = ((stockData.price - holding.averageBuyPrice) / holding.averageBuyPrice) * 100;

        holdingsWithCurrentPrice.push({
          symbol: holding.symbol,
          shares: holding.shares,
          averageBuyPrice: holding.averageBuyPrice,
          currentPrice: stockData.price,
          currentValue,
          profit,
          profitPercentage: profitPercentage.toFixed(2)
        });

        totalValue += currentValue;
      } catch (error) {
        console.error(`Error fetching price for ${holding.symbol}:`, error);
      }
    }

    return {
      totalValue,
      holdings: holdingsWithCurrentPrice
    };
  },

  async getPortfolioWithMetrics(userId) {
    try {
      const portfolio = await Portfolio.findOne({ userId })
        .populate('userId', 'name email balance');

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      const { totalValue, holdings } = await this.calculatePortfolioValue(portfolio);

      // Calculate portfolio metrics
      const totalInvested = holdings.reduce((sum, holding) => 
        sum + (holding.averageBuyPrice * holding.shares), 0);
      
      const totalProfit = holdings.reduce((sum, holding) => 
        sum + parseFloat(holding.profit), 0);

      const portfolioPerformance = totalInvested > 0 
        ? ((totalValue - totalInvested) / totalInvested * 100).toFixed(2)
        : 0;

      return {
        accountValue: {
          totalValue: totalValue.toFixed(2),
          cashBalance: portfolio.userId.balance.toFixed(2),
          totalAccountValue: (totalValue + portfolio.userId.balance).toFixed(2)
        },
        performance: {
          totalInvested: totalInvested.toFixed(2),
          totalProfit: totalProfit.toFixed(2),
          portfolioPerformance: `${portfolioPerformance}%`
        },
        holdings: holdings.map(holding => ({
          symbol: holding.symbol,
          shares: holding.shares,
          averageBuyPrice: holding.averageBuyPrice.toFixed(2),
          currentPrice: holding.currentPrice.toFixed(2),
          currentValue: holding.currentValue.toFixed(2),
          profit: holding.profit.toFixed(2),
          profitPercentage: `${holding.profitPercentage}%`
        })),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error calculating portfolio metrics:', error);
      throw error;
    }
  }
};

module.exports = portfolioService;