// src/controllers/stockController.js
const stockService = require('../services/stockService');
const realtimePriceService = require('../services/realtimePriceService');

// Helper function for error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ message });
};

// Controller functions
const searchStocks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = await stockService.searchStocks(query);
    res.json(results);
  } catch (error) {
    handleError(res, error, 'Error searching stocks');
  }
};

const getStockPrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ message: 'Stock symbol is required' });
    }

    const stockData = await stockService.getStockPrice(symbol);
    res.json(stockData);
  } catch (error) {
    handleError(res, error, 'Error fetching stock price');
  }
};

const getMultipleStockPrices = async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ message: 'Stock symbols are required' });
    }

    const symbolArray = symbols.split(',');
    const results = await Promise.all(
      symbolArray.map(symbol => stockService.getStockPrice(symbol.trim()))
    );
    
    res.json(results);
  } catch (error) {
    handleError(res, error, 'Error fetching stock prices');
  }
};

// Add to your stockController.js
const getPopularStocks = async (req, res) => {
  try {
    const stocks = await realtimePriceService.getPopularStocks();
    res.json(stocks);
  } catch (error) {
    console.error('Error getting popular stocks:', error);
    res.status(500).json({ 
      message: error.message || 'Error getting popular stocks' 
    });
  }
};

// Add to exports
module.exports = {
  searchStocks,
  getStockPrice,
  getMultipleStockPrices,
  getPopularStocks
};