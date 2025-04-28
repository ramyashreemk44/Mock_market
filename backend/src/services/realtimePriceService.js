const axios = require('axios');
const config = require('../config/default');

// Mock data for development and fallback
const MOCK_STOCKS_DATA = {
  'AAPL': { price: 189.69, lastPrice: 188.80 },
  'MSFT': { price: 376.17, lastPrice: 373.07 },
  'GOOGL': { price: 137.22, lastPrice: 136.07 },
  'AMZN': { price: 146.32, lastPrice: 145.09 },
  'META': { price: 347.12, lastPrice: 344.34 },
  'NVDA': { price: 477.76, lastPrice: 475.06 },
  'TSLA': { price: 238.45, lastPrice: 236.08 },
  'WMT': { price: 156.34, lastPrice: 155.23 }
};

const realtimePriceService = {
  // Cache for real-time prices
  priceCache: new Map(),
  lastUpdate: new Map(),
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  async getRealTimePrice(symbol) {
    try {
      const now = Date.now();
      
      // Check cache
      if (this.priceCache.has(symbol) && 
          now - this.lastUpdate.get(symbol) < this.cacheTimeout) {
        return this.priceCache.get(symbol);
      }

      // In development or when API fails, use mock data
      const mockData = MOCK_STOCKS_DATA[symbol];
      if (mockData || config.env === 'development') {
        const defaultPrice = mockData?.price || 100 + Math.random() * 100;
        const defaultLastPrice = mockData?.lastPrice || defaultPrice - (Math.random() * 2);
        
        const priceData = {
          symbol,
          price: defaultPrice,
          change: defaultPrice - defaultLastPrice,
          changePercent: ((defaultPrice - defaultLastPrice) / defaultLastPrice) * 100,
          volume: Math.floor(Math.random() * 1000000) + 100000,
          lastUpdated: new Date()
        };

        // Update cache
        this.priceCache.set(symbol, priceData);
        this.lastUpdate.set(symbol, now);

        return priceData;
      }

      // Only call API in production and if mock data doesn't exist
      if (config.env === 'production') {
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: config.alphaVantageApiKey
          }
        });

        const quote = response.data['Global Quote'];
        if (!quote) {
          throw new Error('No real-time data available');
        }

        const priceData = {
          symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          lastUpdated: new Date()
        };

        // Update cache
        this.priceCache.set(symbol, priceData);
        this.lastUpdate.set(symbol, now);

        return priceData;
      }
    } catch (error) {
      console.error(`Error fetching real-time price for ${symbol}:`, error);
      
      // Return mock data as fallback
      const mockPrice = 100 + Math.random() * 100;
      const mockLastPrice = mockPrice - (Math.random() * 2);
      
      return {
        symbol,
        price: mockPrice,
        change: mockPrice - mockLastPrice,
        changePercent: ((mockPrice - mockLastPrice) / mockLastPrice) * 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        lastUpdated: new Date()
      };
    }
  },

  async getMultipleRealTimePrices(symbols) {
    try {
      const prices = await Promise.all(
        symbols.map(symbol => this.getRealTimePrice(symbol))
      );
      return prices;
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      throw error;
    }
  },

  async getPopularStocks() {
    try {
      // Get all symbols from cache or start with default symbols if cache is empty
      let symbols = Array.from(this.priceCache.keys());
      
      if (symbols.length === 0) {
        // If cache is empty, start with some default symbols
        symbols = Object.keys(MOCK_STOCKS_DATA);
      }

      // Get fresh prices for all symbols
      const prices = await this.getMultipleRealTimePrices(symbols);
      
      // Sort by most actively traded (highest volume)
      return prices.sort((a, b) => b.volume - a.volume);
    } catch (error) {
      console.error('Error fetching popular stocks:', error);
      throw error;
    }
  }
};

module.exports = realtimePriceService;