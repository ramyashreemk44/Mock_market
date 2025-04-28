const cron = require('node-cron');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Watchlist = require('../models/Watchlist');  // Add this import
const emailService = require('./emailService');
const stockService = require('./stockService');

class NotificationScheduler {
  constructor() {
    // Schedule daily portfolio summary at market close (4 PM EST)
    cron.schedule('0 16 * * 1-5', () => {
      this.sendDailySummaries();
    });

    // Check price alerts every 5 minutes during market hours
    cron.schedule('*/5 9-16 * * 1-5', () => {
      this.checkPriceAlerts();
    });
  }

  async sendDailySummaries() {
    try {
      const users = await User.find();
      
      for (const user of users) {
        const portfolio = await Portfolio.findOne({ userId: user._id });
        if (!portfolio) continue;

        const holdings = await Promise.all(portfolio.holdings.map(async holding => {
          const stockData = await stockService.getStockPrice(holding.symbol);
          const marketValue = holding.shares * stockData.price;
          const gainLoss = marketValue - (holding.shares * holding.averageBuyPrice);

          return {
            symbol: holding.symbol,
            shares: holding.shares,
            currentPrice: stockData.price,
            marketValue,
            gainLoss,
            gainLossPercent: ((gainLoss / (holding.shares * holding.averageBuyPrice)) * 100).toFixed(2)
          };
        }));

        const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0) + user.balance;
        const previousValue = totalValue; // You would typically get this from historical data

        await emailService.sendPortfolioSummary(user.email, {
          totalValue,
          cashBalance: user.balance,
          dayChange: totalValue - previousValue,
          dayChangePercent: (((totalValue - previousValue) / previousValue) * 100).toFixed(2),
          holdings
        });
      }
    } catch (error) {
      console.error('Error sending daily summaries:', error);
    }
  }

  async checkPriceAlerts() {
    try {
      // Get all watchlists with their user info
      const watchlists = await Watchlist.find().populate('userId', 'email');
      
      for (const watchlist of watchlists) {
        // Only check stocks that have alerts set
        const stocksWithAlerts = watchlist.stocks.filter(stock => 
          stock.alertPrice?.above || stock.alertPrice?.below
        );

        for (const stock of stocksWithAlerts) {
          try {
            const stockData = await stockService.getStockPrice(stock.symbol);
            const currentPrice = stockData.price;

            // Check if price is above alert threshold
            if (stock.alertPrice?.above && currentPrice >= stock.alertPrice.above) {
              await emailService.sendPriceAlert(watchlist.userId.email, {
                symbol: stock.symbol,
                currentPrice,
                alertType: 'Above Target',
                targetPrice: stock.alertPrice.above
              });

              // Optionally remove the alert after triggering
              stock.alertPrice.above = null;
              await watchlist.save();
            }

            // Check if price is below alert threshold
            if (stock.alertPrice?.below && currentPrice <= stock.alertPrice.below) {
              await emailService.sendPriceAlert(watchlist.userId.email, {
                symbol: stock.symbol,
                currentPrice,
                alertType: 'Below Target',
                targetPrice: stock.alertPrice.below
              });

              // Optionally remove the alert after triggering
              stock.alertPrice.below = null;
              await watchlist.save();
            }
          } catch (error) {
            console.error(`Error checking price for ${stock.symbol}:`, error);
            continue; // Continue with next stock if one fails
          }
        }
      }
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }
}

// Export a singleton instance
module.exports = new NotificationScheduler();