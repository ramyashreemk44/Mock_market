import { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

export interface Position {
  symbol: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PortfolioData {
  overview: {
    totalValue: number;
    marketValue: number;
    cashBalance: number;
    unrealizedGain: number;
    unrealizedGainPercent: number;
    dayChange: number;
    dayChangePercent: number;
  };
  positions: Position[];
  lastUpdated: string;
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetchApi<PortfolioData>('https://mock-market-qs3j.onrender.com/api/portfolio/snapshot', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data) setData(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 60000);
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error, refresh: fetchPortfolioData };
}