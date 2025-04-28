// src/models/PortfolioHistory.js
const mongoose = require('mongoose');

const portfolioHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  snapshot: {
    totalValue: Number,
    cashBalance: Number,
    holdings: [{
      symbol: String,
      shares: Number,
      price: Number,
      value: Number
    }],
    metrics: {
      dayChange: Number,
      dayChangePercent: Number,
      totalGain: Number,
      totalGainPercent: Number
    }
  }
});

// Index for efficient querying
portfolioHistorySchema.index({ userId: 1, timestamp: -1 });

const PortfolioHistory = mongoose.model('PortfolioHistory', portfolioHistorySchema);
module.exports = PortfolioHistory;