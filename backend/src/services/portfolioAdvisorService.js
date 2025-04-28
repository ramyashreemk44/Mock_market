// src/services/portfolioAdvisorService.js
const Portfolio = require('../models/Portfolio');
const realtimePriceService = require('../services/realtimePriceService');

const portfolioAdvisorService = {
  async analyzePortfolio(userId) {
    try {
      const portfolio = await Portfolio.findOne({ userId })
        .populate('userId', 'balance');

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      const analysis = {
        alerts: [],
        recommendations: [],
        riskMetrics: {},
        diversification: {}
      };

      // Get real-time data for holdings
      const symbols = portfolio.holdings.map(h => h.symbol);
      const prices = await realtimePriceService.getMultipleRealTimePrices(symbols);

      // Calculate portfolio metrics
      const totalValue = portfolio.holdings.reduce((sum, holding) => {
        const price = prices.find(p => p.symbol === holding.symbol).price;
        return sum + (holding.shares * price);
      }, 0) + portfolio.userId.balance;

      // Check cash position
      const cashPercentage = (portfolio.userId.balance / totalValue) * 100;
      if (cashPercentage > 50) {
        analysis.alerts.push({
          type: 'High Cash Position',
          message: `Your portfolio is ${cashPercentage.toFixed(1)}% in cash. Consider investing more to maximize returns.`,
          severity: 'medium'
        });
      }

      // Check diversification
      if (portfolio.holdings.length === 1) {
        analysis.alerts.push({
          type: 'Diversification Warning',
          message: 'Your portfolio is concentrated in a single stock. Consider diversifying across multiple stocks.',
          severity: 'high'
        });
      }

      // Calculate position sizes
      portfolio.holdings.forEach(holding => {
        const price = prices.find(p => p.symbol === holding.symbol).price;
        const positionSize = (holding.shares * price / totalValue) * 100;
        
        if (positionSize > 20) {
          analysis.alerts.push({
            type: 'Large Position',
            message: `${holding.symbol} represents ${positionSize.toFixed(1)}% of your portfolio. Consider rebalancing.`,
            severity: 'medium'
          });
        }
      });

      // Basic recommendations
      if (portfolio.holdings.length === 0) {
        analysis.recommendations.push({
          type: 'Getting Started',
          message: 'Consider starting with a diversified portfolio of 3-5 stocks across different sectors.'
        });
      } else if (portfolio.holdings.length < 3) {
        analysis.recommendations.push({
          type: 'Diversification',
          message: 'Add more stocks to your portfolio to reduce risk through diversification.'
        });
      }

      // Risk metrics
      analysis.riskMetrics = {
        cashPercentage: cashPercentage.toFixed(1) + '%',
        stockExposure: (100 - cashPercentage).toFixed(1) + '%',
        numberOfPositions: portfolio.holdings.length,
        largestPosition: portfolio.holdings.length > 0 ? 
          portfolio.holdings[0].symbol : 'None'
      };

      // Diversification metrics
      analysis.diversification = {
        stockCount: portfolio.holdings.length,
        sectorExposure: 'Technology: 100%', // Simplified for demo
        recommendedStockCount: '8-12 stocks'
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      throw error;
    }
  }
};

module.exports = portfolioAdvisorService;