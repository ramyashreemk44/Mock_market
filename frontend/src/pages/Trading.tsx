import React, { useState, useEffect } from 'react';
import { tradingService, StockSearch, StockPrice } from '../services/tradingService';
import { Search, ArrowUpRight, ArrowDownRight, History, Wallet } from 'lucide-react';
import OrderPreviewModal from '../components/OrderPreviewModal';
import StockCard from '../components/StockCard';



const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  executedAt: string;
}

export default function Trading() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearch[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockSearch | null>(null);
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [shares, setShares] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [popularStocks, setPopularStocks] = useState<any[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);

  // Search stocks as user types
  useEffect(() => {
    const searchStocks = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const results = await tradingService.searchStocks(searchQuery);
        setSearchResults(results);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search stocks');
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Fetch stock price when stock is selected
  useEffect(() => {
    const getPrice = async () => {
      if (!selectedStock) return;

      try {
        const price = await tradingService.getStockPrice(selectedStock.symbol);
        setStockPrice(price);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock price');
      }
    };

    getPrice();
    const interval = setInterval(getPrice, 10000); // Update price every 10 seconds
    return () => clearInterval(interval);
  }, [selectedStock]);

  // Load recent trades
  useEffect(() => {
    const fetchRecentTrades = async () => {
      try {
        const response = await fetch('https://mock-market-qs3j.onrender.com/api/trades/history', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setRecentTrades(data.trades?.slice(0, 5) || []);
      } catch (err) {
        console.error('Error fetching trade history:', err);
      }
    };

    fetchRecentTrades();
  }, [successMessage]); // Refresh after successful trade

  useEffect(() => {
    const fetchPopularStocks = async () => {
      try {
        setIsLoadingPopular(true);
        const response = await fetch('https://mock-market-qs3j.onrender.com/api/stocks/popular', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const stocks = await response.json();
        setPopularStocks(stocks);
      } catch (err) {
        console.error('Error fetching popular stocks:', err);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    fetchPopularStocks();
  }, []);

  const handleTrade = () => {
    if (!selectedStock || !shares || !stockPrice) return;
    setShowOrderPreview(true);
  };

  const executeOrder = async () => {
    if (!selectedStock || !shares) return;

    try {
      setIsLoading(true);
      const result = await tradingService.executeTrade(tradeType, {
        symbol: selectedStock.symbol,
        shares: Number(shares)
      });
      setSuccessMessage(result.message);
      setShares('');
      setShowOrderPreview(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trade failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setShares(value);
      setError(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Trade Stocks</h2>

            {/* Search Box */}
            <div className="relative mb-6">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Search stocks by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      onClick={() => {
                        setSelectedStock(result);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <div className="font-medium">{result.symbol}</div>
                      <div className="text-sm text-gray-500">{result.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Stocks */}
            {!selectedStock && !searchQuery && (
              <div>
                <h3 className="text-lg font-medium mb-4">Popular Stocks</h3>
                {isLoadingPopular ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-50 p-4 rounded-lg">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popularStocks.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={async () => {
                          try {
                            const results = await tradingService.searchStocks(stock.symbol);
                            if (results.length > 0) {
                              setSelectedStock(results[0]);
                            }
                          } catch (err) {
                            console.error('Error fetching stock details:', err);
                          }
                        }}
                        className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{stock.symbol}</h4>
                            <div className={`flex items-center text-sm ${
                              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stock.change >= 0 ? (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                              )}
                              {stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {formatCurrency(stock.price)}
                            </div>
                            <div className={`text-sm ${
                              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(stock.change)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* Selected Stock */}
            {selectedStock && stockPrice && (
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{selectedStock.symbol}</h3>
                    <p className="text-gray-500">{selectedStock.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {formatCurrency(stockPrice.price)}
                    </div>
                    <div className={`flex items-center justify-end ${
                      stockPrice.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stockPrice.change >= 0 ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                      <span>
                        {formatCurrency(stockPrice.change)} ({stockPrice.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trade Form */}
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                        tradeType === 'BUY'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setTradeType('BUY')}
                    >
                      Buy
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                        tradeType === 'SELL'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setTradeType('SELL')}
                    >
                      Sell
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Shares
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={shares}
                      onChange={handleSharesChange}
                      placeholder="Enter number of shares"
                    />
                  </div>

                  {shares && (
                    <div className="text-right text-gray-600">
                      Total: {formatCurrency(Number(shares) * stockPrice.price)}
                    </div>
                  )}

                  <button
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                      tradeType === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                    } hover:opacity-90 disabled:opacity-50`}
                    onClick={handleTrade}
                    disabled={isLoading || !shares || Number(shares) <= 0}
                  >
                    {isLoading ? 'Processing...' : `${tradeType} ${selectedStock.symbol}`}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                {successMessage}
              </div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Trades</h2>
              <History className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentTrades.length === 0 ? (
                <p className="text-gray-500 text-center">No recent trades</p>
              ) : (
                recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type}
                      </span>
                      <div className="mt-1">
                        <span className="font-medium">{trade.symbol}</span>
                        <span className="text-sm text-gray-500"> • {trade.shares} shares</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(trade.total)}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(trade.executedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Preview Modal */}
      {selectedStock && stockPrice && showOrderPreview && (
        <OrderPreviewModal
          isOpen={showOrderPreview}
          onClose={() => setShowOrderPreview(false)}
          onConfirm={executeOrder}
          type={tradeType}
          symbol={selectedStock.symbol}
          shares={Number(shares)}
          price={stockPrice.price}
          total={Number(shares) * stockPrice.price}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}