import { fetchApi } from '../utils/api';

export interface Position {
  symbol: string;
  shares: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGain: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PortfolioData {
  overview: {
    totalValue: number;
    cashBalance: number;
    dayChange: number;
    dayChangePercent: number;
  };
  positions: Position[];
  lastUpdated: string;
}

const getPortfolioData = async (): Promise<PortfolioData> => {
  const response = await fetchApi<PortfolioData>('https://mock-market-qs3j.onrender.com/api/portfolio/snapshot', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data!;
};

export const portfolioService = {
  getPortfolioData,
};