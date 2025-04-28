import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import QuickTradeModal from '../components/QuickTradeModal';
import { Position } from '../hooks/usePortfolio';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: portfolioData, isLoading, error, refresh } = usePortfolio();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isQuickTradeOpen, setIsQuickTradeOpen] = useState(false);

  const handleQuickTrade = (position: Position) => {
    setSelectedPosition(position);
    setIsQuickTradeOpen(true);
  };

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

  if (!portfolioData) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-600">No portfolio data available</div>
      </div>
    );
  }

  const { overview, positions } = portfolioData;

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Portfolio Value Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(overview.totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Day's Change Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Day's Change</p>
              <p className={`text-2xl font-bold flex items-center gap-2 ${
                overview.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {overview.dayChange >= 0 ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
                {formatCurrency(overview.dayChange)} ({formatPercentage(overview.dayChangePercent)})
              </p>
            </div>
          </div>
        </div>

        {/* Holdings Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Holdings</p>
              <p className="text-2xl font-bold">{positions.length}</p>
            </div>
            <BarChart2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Cash Balance Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cash Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(overview.cashBalance)}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <button
              onClick={() => navigate('/trading')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Go to Trading
            </button>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/watchlist')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="font-medium">Manage Watchlist</span>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="font-medium">View Portfolio Analysis</span>
              <BarChart2 className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Gain/Loss</span>
              <span className={overview.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(overview.unrealizedGain)} ({formatPercentage(overview.unrealizedGainPercent)})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Market Value</span>
              <span className="font-medium">{formatCurrency(overview.marketValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Active Positions</h2>
        </div>
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions.map((position) => (
                <tr key={position.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    {position.symbol}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {position.shares}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(position.averageCost)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(position.currentPrice)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(position.marketValue)}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right ${
                    position.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(position.unrealizedGain)} ({formatPercentage(position.unrealizedGainPercent)})
                  </td>
                  <td className={`px-6 py-4 text-sm text-right ${
                    position.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(position.dayChange)} ({formatPercentage(position.dayChangePercent)})
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <button
                      onClick={() => handleQuickTrade(position)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Trade Modal */}
      {selectedPosition && (
        <QuickTradeModal
          isOpen={isQuickTradeOpen}
          onClose={() => {
            setIsQuickTradeOpen(false);
            setSelectedPosition(null);
          }}
          position={selectedPosition}
          onTradeComplete={() => {
            refresh();
            setIsQuickTradeOpen(false);
            setSelectedPosition(null);
          }}
        />
      )}
    </div>
  );
}