import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { tradingService, StockPrice } from '../services/tradingService';

interface StockCardProps {
  symbol: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export default function StockCard({ symbol }: StockCardProps) {
  const [stockData, setStockData] = useState<StockPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const data = await tradingService.getStockPrice(symbol);
        setStockData(data);
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!stockData) return null;

  return (
    <div className="flex justify-between items-center">
      <div>
        <h4 className="font-medium text-lg">{symbol}</h4>
        <div className={`flex items-center text-sm ${
          stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {stockData.change >= 0 ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          {stockData.changePercent.toFixed(2)}%
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold">{formatCurrency(stockData.price)}</div>
        <div className={`text-sm ${
          stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatCurrency(stockData.change)}
        </div>
      </div>
    </div>
  );
}