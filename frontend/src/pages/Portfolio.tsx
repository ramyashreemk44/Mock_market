import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUp,
  ArrowDown,
  Clock 
} from 'lucide-react';
import { fetchApi } from '../utils/api';

interface Position {
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

interface PortfolioData {
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

function Portfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetchApi<PortfolioData>('https://mock-market-qs3j.onrender.com/api/portfolio/snapshot', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        setData(response.data!);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">No portfolio data available</div>
      </div>
    );
  }

  const { overview, positions } = data;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Value */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold">${overview.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Market Value */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Market Value</p>
              <p className="text-2xl font-bold">${overview.marketValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Day's Change */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Day's Change</p>
              <p className={`text-2xl font-bold flex items-center gap-2 ${
                overview.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {overview.dayChange >= 0 ? (
                  <ArrowUp className="h-5 w-5" />
                ) : (
                  <ArrowDown className="h-5 w-5" />
                )}
                ${Math.abs(overview.dayChange).toLocaleString()} ({overview.dayChangePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cash Balance</p>
              <p className="text-2xl font-bold">${overview.cashBalance.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Holdings</h2>
        </div>
        {positions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            You don't have any holdings yet. Start trading to build your portfolio!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shares</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Market Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gain/Loss</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Day Change</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((position) => (
                  <tr key={position.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{position.symbol}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{position.shares}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">${position.averageCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">${position.currentPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">${position.marketValue.toLocaleString()}</td>
                    <td className={`px-6 py-4 text-sm text-right ${
                      position.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${position.unrealizedGain.toLocaleString()} ({position.unrealizedGainPercent.toFixed(2)}%)
                    </td>
                    <td className={`px-6 py-4 text-sm text-right ${
                      position.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${position.dayChange.toLocaleString()} ({position.dayChangePercent.toFixed(2)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="text-right text-sm text-gray-500">
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}

export default Portfolio;