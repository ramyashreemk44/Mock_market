// src/services/chartService.js
const axios = require('axios');
const config = require('../config/default');

const chartService = {
  // Get historical daily prices for a stock
  async getStockPriceHistory(symbol, period = '1m') {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          apikey: config.alphaVantageApiKey,
          outputsize: period === '1y' ? 'full' : 'compact'
        }
      });

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No price data available');
      }

      // Convert to array and format data
      const priceData = Object.entries(timeSeries).map(([date, data]) => ({
        date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'])
      }));

      // Sort by date ascending
      priceData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculate moving averages
      const ma50 = calculateMovingAverage(priceData, 50);
      const ma200 = calculateMovingAverage(priceData, 200);

      return {
        symbol,
        priceData,
        technicalIndicators: {
          ma50,
          ma200
        },
        summary: {
          latestPrice: priceData[priceData.length - 1].close,
          change: priceData[priceData.length - 1].close - priceData[priceData.length - 2].close,
          changePercent: ((priceData[priceData.length - 1].close - priceData[priceData.length - 2].close) / 
                         priceData[priceData.length - 2].close) * 100,
          periodHigh: Math.max(...priceData.map(d => d.high)),
          periodLow: Math.min(...priceData.map(d => d.low)),
          averageVolume: Math.round(priceData.reduce((sum, d) => sum + d.volume, 0) / priceData.length)
        }
      };
    } catch (error) {
      console.error(`Error fetching price history for ${symbol}:`, error);
      throw error;
    }
  }
};

// Helper function to calculate moving averages
function calculateMovingAverage(data, period) {
  return data.map((_, index) => {
    if (index < period - 1) return null;
    const slice = data.slice(index - period + 1, index + 1);
    const average = slice.reduce((sum, day) => sum + day.close, 0) / period;
    return {
      date: data[index].date,
      value: parseFloat(average.toFixed(2))
    };
  });
}

module.exports = chartService;