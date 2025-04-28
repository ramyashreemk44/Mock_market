
import { X } from 'lucide-react';

interface OrderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'BUY' | 'SELL';
  symbol: string;
  shares: number;
  price: number;
  total: number;
  isLoading: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export default function OrderPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  symbol,
  shares,
  price,
  total,
  isLoading
}: OrderPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Confirm Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-600">Order Type</div>
              <div className={`font-medium ${
                type === 'BUY' ? 'text-green-600' : 'text-red-600'
              }`}>{type}</div>
              
              <div className="text-gray-600">Symbol</div>
              <div className="font-medium">{symbol}</div>
              
              <div className="text-gray-600">Shares</div>
              <div className="font-medium">{shares}</div>
              
              <div className="text-gray-600">Price per Share</div>
              <div className="font-medium">{formatCurrency(price)}</div>
              
              <div className="text-gray-600">Total</div>
              <div className="font-medium">{formatCurrency(total)}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-lg text-white font-medium ${
                type === 'BUY' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : `Confirm ${type}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}