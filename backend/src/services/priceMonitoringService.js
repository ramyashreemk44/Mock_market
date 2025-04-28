const { createNotification } = require('../utils/notificationUtils');
const Watchlist = require('../models/Watchlist');
const stockService = require('./stockService');

const checkPriceAlerts = async () => {
  try {
    // Get all watchlists with price alerts
    const watchlists = await Watchlist.find({
      'stocks.alertPrice': { $exists: true }
    }).populate('userId');

    for (const watchlist of watchlists) {
      for (const stock of watchlist.stocks) {
        if (!stock.alertPrice) continue;

        const currentPrice = await stockService.getStockPrice(stock.symbol);

        // Check upper price alert
        if (stock.alertPrice.above && currentPrice.price >= stock.alertPrice.above) {
          await createNotification(
            watchlist.userId,
            'PRICE_ALERT',
            `${stock.symbol} has reached your upper price target of $${stock.alertPrice.above}`,
            stock.symbol
          );
          // Optionally remove the alert after triggering
          stock.alertPrice.above = null;
        }

        // Check lower price alert
        if (stock.alertPrice.below && currentPrice.price <= stock.alertPrice.below) {
          await createNotification(
            watchlist.userId,
            'PRICE_ALERT',
            `${stock.symbol} has reached your lower price target of $${stock.alertPrice.below}`,
            stock.symbol
          );
          // Optionally remove the alert after triggering
          stock.alertPrice.below = null;
        }
      }
      
      if (watchlist.isModified()) {
        await watchlist.save();
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
};

// Schedule price alert checks
const startPriceMonitoring = () => {
  // Check every minute during market hours
  setInterval(checkPriceAlerts, 60000);
};

module.exports = { startPriceMonitoring };