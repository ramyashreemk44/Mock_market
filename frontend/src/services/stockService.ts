import { fetchApi } from '../utils/api';

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: string;
}

export interface StockSearch {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

class StockService {
  private baseUrl = 'https://mock-market-qs3j.onrender.com/api';

  // Search stocks
  async searchStocks(query: string): Promise<StockSearch[]> {
    const response = await fetchApi<StockSearch[]>(
      `${this.baseUrl}/stocks/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data!;
  }

  // Get real-time price
  async getStockPrice(symbol: string): Promise<StockPrice> {
    const response = await fetchApi<StockPrice>(
      `${this.baseUrl}/stocks/price/${symbol}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data!;
  }

  // Get multiple stock prices
  async getMultipleStockPrices(symbols: string[]): Promise<StockPrice[]> {
    const response = await fetchApi<StockPrice[]>(
      `${this.baseUrl}/stocks/prices?symbols=${symbols.join(',')}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data!;
  }
}

export const stockService = new StockService();