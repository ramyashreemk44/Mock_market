const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  holdings: [{
    symbol: {
      type: String,
      required: true
    },
    shares: {
      type: Number,
      required: true,
      min: 0
    },
    averageBuyPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Add some helper methods
portfolioSchema.methods.addHolding = function(symbol, shares, price) {
  const existingHolding = this.holdings.find(h => h.symbol === symbol);
  
  if (existingHolding) {
    const totalShares = existingHolding.shares + shares;
    const totalCost = (existingHolding.shares * existingHolding.averageBuyPrice) + (shares * price);
    existingHolding.averageBuyPrice = totalCost / totalShares;
    existingHolding.shares = totalShares;
  } else {
    this.holdings.push({
      symbol,
      shares,
      averageBuyPrice: price
    });
  }
  
  this.lastUpdated = new Date();
};

portfolioSchema.methods.removeShares = function(symbol, shares) {
  const holdingIndex = this.holdings.findIndex(h => h.symbol === symbol);
  if (holdingIndex === -1) {
    throw new Error('Symbol not found in portfolio');
  }
  
  const holding = this.holdings[holdingIndex];
  if (holding.shares < shares) {
    throw new Error('Insufficient shares');
  }
  
  holding.shares -= shares;
  
  // Remove the holding if no shares left
  if (holding.shares === 0) {
    this.holdings.splice(holdingIndex, 1);
  }
  
  this.lastUpdated = new Date();
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;