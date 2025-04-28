const axios = require('axios');
const config = require('../config/default');

// Mock data for stock search
const MOCK_SEARCH_RESULTS = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Common Stock', region: 'United States' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Common Stock', region: 'United States' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Common Stock', region: 'United States' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Common Stock', region: 'United States' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Common Stock', region: 'United States' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Common Stock', region: 'United States' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Common Stock', region: 'United States' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'Common Stock', region: 'United States' }
];

const cache = {
  data: new Map(),
  timeout: 60000, // 1 minute cache

  isValid: (symbol) => {
    const cached = cache.data.get(symbol);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < cache.timeout;
  },

  get: (symbol) => cache.data.get(symbol)?.data,

  set: (symbol, data) => {
    cache.data.set(symbol, {
      data,
      timestamp: Date.now()
    });
  }
};

const stockService = {
  async searchStocks(query) {
    try {
      // In development or when API fails, use mock data
      console.log('Searching stocks for:', query);
      console.log('config.env:',config.env);
      console.log('config.alphaVantageApiKey:',config.alphaVantageApiKey);
      if (config.env === 'development') {
        const results = MOCK_SEARCH_RESULTS.filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
        );
        return results;
      }

      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: config.alphaVantageApiKey
        }
      });
      console.log('Search results:', response.data);
      
      if (!response.data.bestMatches) {
        return MOCK_SEARCH_RESULTS.filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      return response.data.bestMatches.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region']
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      // Return filtered mock results as fallback
      return MOCK_SEARCH_RESULTS.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  async getStockPrice(symbol) {
    try {
      // Check cache first
      if (cache.isValid(symbol)) {
        return cache.get(symbol);
      }

      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: config.alphaVantageApiKey
        }
      });

      const quote = response.data['Global Quote'];
      if (!quote) {
        // Return mock data if API fails
        const mockPrice = 100 + Math.random() * 100;
        const stockData = {
          symbol,
          price: mockPrice,
          change: mockPrice * 0.01,
          changePercent: 1.0,
          volume: Math.floor(Math.random() * 1000000),
          lastUpdated: new Date()
        };
        cache.set(symbol, stockData);
        return stockData;
      }

      const stockData = {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        lastUpdated: new Date()
      };

      cache.set(symbol, stockData);
      return stockData;
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      // Return mock data as fallback
      const mockPrice = 100 + Math.random() * 100;
      return {
        symbol,
        price: mockPrice,
        change: mockPrice * 0.01,
        changePercent: 1.0,
        volume: Math.floor(Math.random() * 1000000),
        lastUpdated: new Date()
      };
    }
  }
};

module.exports = stockService;