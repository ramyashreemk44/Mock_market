import React, { useState } from 'react';
import { X } from 'lucide-react';
import { tradingService } from '../services/tradingService';

interface QuickTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: {
    symbol: string;
    shares: number;
    currentPrice: number;
    marketValue: number;
  };
  onTradeComplete: () => void;
}

export default function QuickTradeModal({ 
  isOpen, 
  onClose, 
  position, 
  onTradeComplete 
}: QuickTradeModalProps) {
  const [shares, setShares] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (type: 'BUY' | 'SELL') => {
    if (!shares || Number(shares) <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    if (type === 'SELL' && Number(shares) > position.shares) {
      setError(`You only have ${position.shares} shares available to sell`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await tradingService.executeTrade(type, {
        symbol: position.symbol,
        shares: Number(shares)
      });

      onTradeComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trade failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Quick Trade {position.symbol}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Current Position</p>
            <p className="font-medium">{position.shares} shares @ ${position.currentPrice.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Market Value: ${position.marketValue.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Shares
            </label>
            <input
              type="number"
              value={shares}
              onChange={(e) => {
                setShares(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number of shares"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleSubmit('BUY')}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Buy'}
            </button>
            <button
              onClick={() => handleSubmit('SELL')}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Sell'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}