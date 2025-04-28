// src/services/portfolioAnalyticsService.js
const PortfolioHistory = require('../models/PortfolioHistory');
const Portfolio = require('../models/Portfolio');
const stockService = require('./stockService');

const portfolioAnalyticsService = {
  // Take a snapshot of current portfolio state
  async takeSnapshot(userId) {
    try {
      const portfolio = await Portfolio.findOne({ userId })
        .populate('userId', 'balance');
      
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      // Calculate current holdings value
      const holdingsSnapshot = await Promise.all(portfolio.holdings.map(async holding => {
        const stockData = await stockService.getStockPrice(holding.symbol);
        return {
          symbol: holding.symbol,
          shares: holding.shares,
          price: stockData.price,
          value: stockData.price * holding.shares
        };
      }));

      const totalValue = holdingsSnapshot.reduce((sum, holding) => sum + holding.value, 0);
      const cashBalance = portfolio.userId.balance;

      // Get previous day's snapshot for comparison
      const previousDay = await PortfolioHistory.findOne({
        userId,
        timestamp: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0) - 24*60*60*1000),
          $lt: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }).sort({ timestamp: -1 });

      // Calculate metrics
      const metrics = {
        dayChange: previousDay ? (totalValue + cashBalance) - 
          (previousDay.snapshot.totalValue + previousDay.snapshot.cashBalance) : 0,
        dayChangePercent: previousDay ? 
          (((totalValue + cashBalance) / (previousDay.snapshot.totalValue + previousDay.snapshot.cashBalance)) - 1) * 100 : 0,
        totalGain: totalValue - portfolio.holdings.reduce((sum, holding) => 
          sum + (holding.averageBuyPrice * holding.shares), 0),
        totalGainPercent: 0 // Will be calculated below
      };

      const totalInvested = portfolio.holdings.reduce((sum, holding) => 
        sum + (holding.averageBuyPrice * holding.shares), 0);
      
      metrics.totalGainPercent = totalInvested > 0 ? 
        (metrics.totalGain / totalInvested) * 100 : 0;

      // Create new history record
      const historyRecord = new PortfolioHistory({
        userId,
        snapshot: {
          totalValue,
          cashBalance,
          holdings: holdingsSnapshot,
          metrics
        }
      });

      await historyRecord.save();
      return historyRecord;
    } catch (error) {
      console.error('Error taking portfolio snapshot:', error);
      throw error;
    }
  },

  // Get portfolio performance over time
  async getPerformanceHistory(userId, period = '1m') {
    try {
      const endDate = new Date();
      let startDate = new Date();

      // Calculate start date based on period
      switch(period) {
        case '1d':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '1w':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '1m':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1); // Default to 1 month
      }

      const history = await PortfolioHistory.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate }
      }).sort({ timestamp: 1 });

      // Calculate performance metrics
      const performanceMetrics = {
        startValue: history[0]?.snapshot.totalValue + history[0]?.snapshot.cashBalance || 0,
        endValue: history[history.length-1]?.snapshot.totalValue + 
          history[history.length-1]?.snapshot.cashBalance || 0,
        periodHigh: 0,
        periodLow: Number.MAX_VALUE,
        volatility: 0
      };

      const dailyReturns = [];
      let previousValue = null;

      history.forEach(record => {
        const totalValue = record.snapshot.totalValue + record.snapshot.cashBalance;
        
        performanceMetrics.periodHigh = Math.max(performanceMetrics.periodHigh, totalValue);
        performanceMetrics.periodLow = Math.min(performanceMetrics.periodLow, totalValue);

        if (previousValue !== null) {
          dailyReturns.push((totalValue - previousValue) / previousValue);
        }
        previousValue = totalValue;
      });

      // Calculate volatility (standard deviation of daily returns)
      if (dailyReturns.length > 0) {
        const mean = dailyReturns.reduce((sum, return_) => sum + return_, 0) / dailyReturns.length;
        const squaredDiffs = dailyReturns.map(return_ => Math.pow(return_ - mean, 2));
        performanceMetrics.volatility = Math.sqrt(
          squaredDiffs.reduce((sum, diff) => sum + diff, 0) / dailyReturns.length
        );
      }

      return {
        history: history.map(record => ({
          timestamp: record.timestamp,
          totalValue: record.snapshot.totalValue + record.snapshot.cashBalance,
          metrics: record.snapshot.metrics
        })),
        performanceMetrics: {
          ...performanceMetrics,
          totalReturn: ((performanceMetrics.endValue / performanceMetrics.startValue) - 1) * 100,
          periodHighValue: performanceMetrics.periodHigh,
          periodLowValue: performanceMetrics.periodLow,
          volatility: performanceMetrics.volatility * 100
        }
      };
    } catch (error) {
      console.error('Error getting performance history:', error);
      throw error;
    }
  }
};

module.exports = portfolioAnalyticsService;