const mongoose = require('mongoose');
const stockService = require('./stockService');
const emailService = require('./emailService');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Trade = require('../models/Trade');
const { createNotification } = require('../utils/notificationUtils');

// Helper function to format currency
const formatCurrency = (number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(number);
};

const tradeService = {
  // Execute buy order
  buyStock: async (userId, symbol, shares) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Input validation
      if (!symbol || !shares || shares <= 0) {
        throw new Error('Invalid input: Symbol and positive shares required');
      }

      // Get current stock price
      const stockData = await stockService.getStockPrice(symbol);
      const totalCost = stockData.price * shares;

      // Get user and check balance
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.balance < totalCost) {
        throw new Error(`Insufficient funds. Required: ${formatCurrency(totalCost)}, Available: ${formatCurrency(user.balance)}`);
      }

      // Update user balance
      user.balance -= totalCost;
      await user.save();

      // Update portfolio
      const portfolio = await Portfolio.findOne({ userId }).session(session);
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
      if (holdingIndex === -1) {
        // New position
        portfolio.holdings.push({
          symbol,
          shares,
          averageBuyPrice: stockData.price
        });
      } else {
        // Update existing position
        const holding = portfolio.holdings[holdingIndex];
        const totalShares = holding.shares + shares;
        const totalCost = (holding.shares * holding.averageBuyPrice) + (shares * stockData.price);
        holding.averageBuyPrice = totalCost / totalShares;
        holding.shares = totalShares;
      }

      await portfolio.save();

      // Record trade
      const trade = new Trade({
        userId,
        symbol,
        type: 'BUY',
        shares,
        price: stockData.price,
        total: totalCost
      });
      
      await trade.save({ session });

      // Commit transaction
      await session.commitTransaction();

      // After successful transaction, create notification
      await createNotification(
        userId,
        'TRADE_CONFIRMATION',
        `Successfully bought ${shares} shares of ${symbol} at ${formatCurrency(stockData.price)}`,
        symbol
      );

      return {
        trade,
        newBalance: user.balance,
        message: `Successfully bought ${shares} shares of ${symbol} at ${formatCurrency(stockData.price)} per share`
      };

    } catch (error) {
      // Only abort if transaction hasn't been committed
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
  },

  // Execute sell order
  sellStock: async (userId, symbol, shares) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Input validation
      if (!symbol || !shares || shares <= 0) {
        throw new Error('Invalid input: Symbol and positive shares required');
      }

      // Get current stock price
      const stockData = await stockService.getStockPrice(symbol);
      const totalValue = stockData.price * shares;

      // Get portfolio and check shares
      const portfolio = await Portfolio.findOne({ userId }).session(session);
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
      if (holdingIndex === -1) {
        throw new Error('Stock not found in portfolio');
      }

      const holding = portfolio.holdings[holdingIndex];
      if (holding.shares < shares) {
        throw new Error(`Insufficient shares. You only have ${holding.shares} shares available.`);
      }

      // Update portfolio
      if (holding.shares === shares) {
        portfolio.holdings.splice(holdingIndex, 1);
      } else {
        holding.shares -= shares;
      }
      await portfolio.save();

      // Update user balance
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      user.balance += totalValue;
      await user.save();

      // Record trade
      const trade = new Trade({
        userId,
        symbol,
        type: 'SELL',
        shares,
        price: stockData.price,
        total: totalValue
      });
      
      await trade.save({ session });

      // Commit transaction
      await session.commitTransaction();

      // After successful transaction, create notification
      await createNotification(
        userId,
        'TRADE_CONFIRMATION',
        `Successfully sold ${shares} shares of ${symbol} at ${formatCurrency(stockData.price)}`,
        symbol
      );

      return {
        trade,
        newBalance: user.balance,
        message: `Successfully sold ${shares} shares of ${symbol} at ${formatCurrency(stockData.price)} per share`
      };

    } catch (error) {
      // Only abort if transaction hasn't been committed
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
  },

  // Get trade history
  getTradeHistory: async (userId) => {
    try {
      const trades = await Trade.find({ userId })
        .sort({ executedAt: -1 })
        .limit(50);

      return {
        trades,
        metrics: {
          totalTrades: trades.length,
          buyTrades: trades.filter(t => t.type === 'BUY').length,
          sellTrades: trades.filter(t => t.type === 'SELL').length,
          totalVolume: trades.reduce((sum, t) => sum + t.total, 0)
        }
      };
    } catch (error) {
      console.error('Error fetching trade history:', error);
      throw error;
    }
  }
};

module.exports = tradeService;