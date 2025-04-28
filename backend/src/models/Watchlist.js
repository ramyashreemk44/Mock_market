const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stocks: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    alertPrice: {
      above: Number,
      below: Number
    }
  }]
});

// Index for efficient querying
watchlistSchema.index({ userId: 1 });
watchlistSchema.index({ 'stocks.symbol': 1 });

// Ensure user can't add the same stock twice
watchlistSchema.methods.addStock = function(symbol) {
  if (this.stocks.some(s => s.symbol === symbol.toUpperCase())) {
    throw new Error('Stock already in watchlist');
  }
  this.stocks.push({ symbol: symbol.toUpperCase() });
};

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
module.exports = Watchlist;