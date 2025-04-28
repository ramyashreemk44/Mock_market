// src/services/stockRecommenderService.js
const stockService = require('./stockService');

// Define sector classifications
const SECTOR_MAPPING = {
  TECH: ['AAPL', 'MSFT', 'GOOGL', 'META'],
  HEALTHCARE: ['JNJ', 'PFE', 'UNH'],
  FINANCE: ['JPM', 'BAC', 'V'],
  CONSUMER: ['AMZN', 'WMT', 'PG'],
  INDUSTRIAL: ['CAT', 'BA', 'HON'],
  ENERGY: ['XOM', 'CVX', 'COP']
};

const stockRecommenderService = {
  async getRecommendations(portfolio, riskProfile = 'moderate') {
    try {
      // Get current holdings
      const currentHoldings = new Set(portfolio.holdings.map(h => h.symbol));
      const currentSectors = new Set();
      
      // Identify sectors in current portfolio
      Object.entries(SECTOR_MAPPING).forEach(([sector, stocks]) => {
        if (stocks.some(stock => currentHoldings.has(stock))) {
          currentSectors.add(sector);
        }
      });

      // Generate recommendations
      const recommendations = {
        diversification: [],
        sectorBalance: [],
        riskManagement: []
      };

      // Recommend stocks from underrepresented sectors
      const underrepresentedSectors = Object.keys(SECTOR_MAPPING)
        .filter(sector => !currentSectors.has(sector));

      // Get some price data for recommendations
      const recommendedStocks = [];
      for (const sector of underrepresentedSectors) {
        const sectorStocks = SECTOR_MAPPING[sector];
        const randomStock = sectorStocks[Math.floor(Math.random() * sectorStocks.length)];
        try {
          const stockData = await stockService.getStockPrice(randomStock);
          recommendedStocks.push({
            symbol: randomStock,
            sector,
            price: stockData.price,
            reason: `Diversify into ${sector} sector`
          });
        } catch (error) {
          console.error(`Error fetching data for ${randomStock}:`, error);
        }
      }

      // Portfolio size based recommendations
      if (portfolio.holdings.length < 5) {
        recommendations.diversification.push({
          type: 'Portfolio Size',
          message: 'Your portfolio is under-diversified. Consider adding these stocks:',
          suggestions: recommendedStocks.slice(0, 3)
        });
      }

      // Sector balance recommendations
      if (currentSectors.size < 3) {
        recommendations.sectorBalance.push({
          type: 'Sector Diversity',
          message: 'Your portfolio lacks sector diversity. Consider these sectors:',
          sectors: underrepresentedSectors.map(sector => ({
            sector,
            suggestedStock: SECTOR_MAPPING[sector][0]
          }))
        });
      }

      // Risk management recommendations based on cash position
      const totalValue = portfolio.holdings.reduce((sum, holding) => 
        sum + (holding.shares * holding.averageBuyPrice), 0);
      
      const cashBalance = portfolio.userId.balance;
      const cashPercentage = (cashBalance / (totalValue + cashBalance)) * 100;

      if (cashPercentage > 50) {
        const investmentAmount = Math.floor(cashBalance * 0.4); // Recommend investing 40% of cash
        recommendations.riskManagement.push({
          type: 'Cash Management',
          message: `Consider investing $${investmentAmount.toLocaleString()} across these recommendations:`,
          suggestedAllocation: recommendedStocks.map(stock => ({
            symbol: stock.symbol,
            amount: Math.floor(investmentAmount / recommendedStocks.length),
            shares: Math.floor((investmentAmount / recommendedStocks.length) / stock.price)
          }))
        });
      }

      return {
        recommendations,
        stats: {
          currentHoldingsCount: portfolio.holdings.length,
          recommendedHoldingsCount: Math.max(8, portfolio.holdings.length + 3),
          currentSectors: Array.from(currentSectors),
          recommendedSectors: underrepresentedSectors,
          cashPercentage: cashPercentage.toFixed(1) + '%'
        }
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
};

module.exports = stockRecommenderService;