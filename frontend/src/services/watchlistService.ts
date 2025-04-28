import { fetchApi } from '../utils/api';

export interface WatchlistItem {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  alertPrice?: {
    above?: number;
    below?: number;
  };
  addedAt: string;
}

const getWatchlist = async (): Promise<WatchlistItem[]> => {
  const response = await fetchApi<WatchlistItem[]>(
    'https://mock-market-qs3j.onrender.com/api/watchlist',
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );

  if (response.error) throw new Error(response.error.message);
  return response.data!;
};

const addToWatchlist = async (symbol: string, alertAbove?: number, alertBelow?: number) => {
  const response = await fetchApi<{ message: string }>(
    'https://mock-market-qs3j.onrender.com/api/watchlist/add',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ symbol, alertAbove, alertBelow })
    }
  );

  if (response.error) throw new Error(response.error.message);
  return response.data!;
};

const removeFromWatchlist = async (symbol: string) => {
  const response = await fetchApi<{ message: string }>(
    `https://mock-market-qs3j.onrender.com/api/watchlist/${symbol}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );

  if (response.error) throw new Error(response.error.message);
  return response.data!;
};

const updateAlerts = async (symbol: string, alertAbove?: number, alertBelow?: number) => {
  const response = await fetchApi<{ message: string }>(
    `https://mock-market-qs3j.onrender.com/api/watchlist/${symbol}/alerts`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ alertAbove, alertBelow })
    }
  );

  if (response.error) throw new Error(response.error.message);
  return response.data!;
};

export const watchlistService = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateAlerts
};