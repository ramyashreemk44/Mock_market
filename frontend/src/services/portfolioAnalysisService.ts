import { fetchApi } from '../utils/api';

export interface PortfolioMetrics {
  totalValue: number;
  cashBalance: number;
  investedAmount: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface TradeHistory {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  executedAt: string;
}

export interface PerformanceData {
  timestamp: string;
  value: number;
}

const getPortfolioAnalysis = async () => {
  const response = await fetchApi<{
    metrics: PortfolioMetrics;
    performance: PerformanceData[];
    trades: TradeHistory[];
  }>('https://mock-market-qs3j.onrender.com/api/portfolio/analysis', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (response.error) throw new Error(response.error.message);
  return response.data!;
};

const getTradeHistory = async () => {
  const response = await fetchApi<{
    trades: TradeHistory[];
  }>('https://mock-market-qs3j.onrender.com/api/trades/history', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (response.error) throw new Error(response.error.message);
  return response.data!;
};

export const portfolioAnalysisService = {
  getPortfolioAnalysis,
  getTradeHistory
};