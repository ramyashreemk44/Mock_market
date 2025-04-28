import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle,
  Info,
  Target,
  TrendingUp
} from 'lucide-react';
import { fetchApi } from '../utils/api';
import PerformanceChart from '../components/PerformanceChart';

interface PerformanceData {
  timestamp: string;
  value: number;
  dayChange: number;
  dayChangePercent: number;
}

interface PerformanceResponse {
    history: {
      timestamp: string;
      totalValue: number;
      metrics: {
        dayChange: number;
        dayChangePercent: number;
      };
    }[];
    performanceMetrics?: {
      startValue: number;
      endValue: number;
      totalReturn: number;
      periodHighValue: number;
      periodLowValue: number;
      volatility: number;
    };
  }
  
  interface AnalysisResponse {
    alerts: {
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }[];
    recommendations: {
      type: string;
      message: string;
    }[];
    riskMetrics: {
      cashPercentage: string;
      stockExposure: string;
      numberOfPositions: number;
      largestPosition: string;
    };
    diversification: {
      stockCount: number;
      sectorExposure: string;
      recommendedStockCount: string;
    };
  }

export default function Analysis() {
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both performance and analysis data
        const [perfResponse, analysisResponse] = await Promise.all([
          fetchApi<PerformanceResponse>(
            `https://mock-market-qs3j.onrender.com/api/portfolio/performance?period=${timeRange}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          ),
          fetchApi<AnalysisResponse>(
            'https://mock-market-qs3j.onrender.com/api/portfolio/analysis',
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          )
        ]);

        if (perfResponse.error) throw new Error(perfResponse.error.message);
        if (analysisResponse.error) throw new Error(analysisResponse.error.message);

        if (perfResponse.data) {
          const formattedData = perfResponse.data.history.map(item => ({
            timestamp: item.timestamp,
            value: item.totalValue,
            dayChange: item.metrics.dayChange,
            dayChangePercent: item.metrics.dayChangePercent
          }));
          setPerformanceData(formattedData);
        }

        if (analysisResponse.data) {
          setAnalysisData(analysisResponse.data);
        }

        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        console.error('Error fetching analysis data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Portfolio Performance</h2>
          <div className="flex gap-2">
            {(['1W', '1M', '3M', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <PerformanceChart 
          data={performanceData}
          timeRange={timeRange}
          isLoading={isLoading}
        />
      </div>

      {/* Risk Analysis and Metrics */}
      {analysisData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Alerts */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Risk Alerts
              </h3>
              <div className="space-y-4">
                {analysisData.alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg ${
                      alert.severity === 'high' 
                        ? 'bg-red-50 border-l-4 border-red-400' 
                        : 'bg-yellow-50 border-l-4 border-yellow-400'
                    }`}
                  >
                    <div className="font-medium">{alert.type}</div>
                    <div className="text-sm mt-1">{alert.message}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-500" />
                Recommendations
              </h3>
              <div className="space-y-4">
                {analysisData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium">{rec.type}</div>
                    <div className="text-sm text-gray-600 mt-1">{rec.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Metrics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                Portfolio Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Cash Allocation</div>
                    <div className="text-lg font-medium mt-1">
                      {analysisData.riskMetrics.cashPercentage}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Stock Exposure</div>
                    <div className="text-lg font-medium mt-1">
                      {analysisData.riskMetrics.stockExposure}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Positions</div>
                  <div className="text-lg font-medium mt-1">
                    {analysisData.riskMetrics.numberOfPositions}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Largest Position</div>
                  <div className="text-lg font-medium mt-1">
                    {analysisData.riskMetrics.largestPosition}
                  </div>
                </div>
              </div>
            </div>

            {/* Diversification */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                Diversification
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Current Holdings</div>
                    <div className="text-lg font-medium mt-1">
                      {analysisData.diversification.stockCount} stocks
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Recommended</div>
                    <div className="text-lg font-medium mt-1">
                      {analysisData.diversification.recommendedStockCount}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Sector Exposure</div>
                  <div className="text-base mt-1">
                    {analysisData.diversification.sectorExposure}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}