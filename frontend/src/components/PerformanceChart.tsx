import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

export interface PerformanceData {
  timestamp: string;
  value: number;
  dayChange: number;
  dayChangePercent: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  timeRange: string;
  isLoading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

export default function PerformanceChart({ data, timeRange, isLoading }: PerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        No performance data available for the selected time range
      </div>
    );
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const valueBuffer = (maxValue - minValue) * 0.1;

  return (
    <div data-testid="performance-chart" className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            minTickGap={50}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            domain={[minValue - valueBuffer, maxValue + valueBuffer]}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Starting Value</div>
          <div className="text-lg font-medium">{formatCurrency(data[0].value)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Current Value</div>
          <div className="text-lg font-medium">
            {formatCurrency(data[data.length - 1].value)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Period Change</div>
          <div className={`text-lg font-medium ${
            data[data.length - 1].value - data[0].value >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {formatCurrency(data[data.length - 1].value - data[0].value)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Change %</div>
          <div className={`text-lg font-medium ${
            ((data[data.length - 1].value - data[0].value) / data[0].value) * 100 >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {(((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}