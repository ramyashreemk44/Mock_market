import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistService, WatchlistItem } from '../services/watchlistService';
import { tradingService } from '../services/tradingService';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Bell,
  Trash2,
  ArrowRight
} from 'lucide-react';

function Watchlist() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAlerts, setEditingAlerts] = useState<string | null>(null);
  const [alertAbove, setAlertAbove] = useState<string>('');
  const [alertBelow, setAlertBelow] = useState<string>('');

  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      const data = await watchlistService.getWatchlist();
      setWatchlist(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Search stocks
  useEffect(() => {
    const searchStocks = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await tradingService.searchStocks(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      }
    };

    const debounce = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleAddToWatchlist = async (symbol: string) => {
    try {
      await watchlistService.addToWatchlist(symbol);
      setSearchQuery('');
      setSearchResults([]);
      fetchWatchlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    if (window.confirm(`Remove ${symbol} from watchlist?`)) {
      try {
        await watchlistService.removeFromWatchlist(symbol);
        fetchWatchlist();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove from watchlist');
      }
    }
  };

  const handleUpdateAlerts = async (symbol: string) => {
    try {
      await watchlistService.updateAlerts(
        symbol,
        alertAbove ? Number(alertAbove) : undefined,
        alertBelow ? Number(alertBelow) : undefined
      );
      setEditingAlerts(null);
      fetchWatchlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alerts');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Add to Watchlist */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Search stocks to add to watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          
          {/* Search Results */}
          {searchResults.length > 0 && searchQuery && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
              {searchResults.map((result) => (
                <button
                  key={result.symbol}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  onClick={() => handleAddToWatchlist(result.symbol)}
                >
                  <div className="font-medium">{result.symbol}</div>
                  <div className="text-sm text-gray-500">{result.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Watchlist */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Watchlist</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Your watchlist is empty. Use the search box above to add stocks.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {watchlist.map((item) => (
              <div key={item.symbol} className="p-4">
                <div className="flex items-start justify-between">
                  {/* Stock Info */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{item.symbol}</h3>
                      <div className={`flex items-center gap-1 ${
                        item.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change >= 0 ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                        <span className="font-medium">
                          ${item.currentPrice.toLocaleString()} ({item.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    {/* Alerts */}
                    {editingAlerts === item.symbol ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-4">
                          <div>
                            <label className="block text-sm text-gray-600">Alert Above ($)</label>
                            <input
                              type="number"
                              className="mt-1 block w-32 px-3 py-1 border rounded-md"
                              value={alertAbove}
                              onChange={(e) => setAlertAbove(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600">Alert Below ($)</label>
                            <input
                              type="number"
                              className="mt-1 block w-32 px-3 py-1 border rounded-md"
                              value={alertBelow}
                              onChange={(e) => setAlertBelow(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
                            onClick={() => handleUpdateAlerts(item.symbol)}
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md"
                            onClick={() => setEditingAlerts(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-gray-500">
                        {item.alertPrice?.above && `Alert above: $${item.alertPrice.above}`}
                        {item.alertPrice?.above && item.alertPrice?.below && ' | '}
                        {item.alertPrice?.below && `Alert below: $${item.alertPrice.below}`}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600"
                      onClick={() => setEditingAlerts(item.symbol)}
                    >
                      <Bell className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600"
                      onClick={() => handleRemoveFromWatchlist(item.symbol)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-green-600"
                      onClick={() => navigate(`/trading?symbol=${item.symbol}`)}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default Watchlist;