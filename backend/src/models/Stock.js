const mongoose = require('mongoose');
const stockSchema = new mongoose.Schema({
    symbol: {
      type: String,
      required: true,
      unique: true
    },
    currentPrice: {
      type: Number,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    dailyHigh: Number,
    dailyLow: Number,
    volume: Number
  });

  module.exports = {
    User: mongoose.model('User', userSchema),
    Portfolio: mongoose.model('Portfolio', portfolioSchema),
    Trade: mongoose.model('Trade', tradeSchema),
    Stock: mongoose.model('Stock', stockSchema)
  };