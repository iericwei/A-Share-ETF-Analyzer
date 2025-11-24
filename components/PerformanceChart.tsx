import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { RefreshCw, Calendar } from 'lucide-react';
import { ETFData, ChartDataPoint } from '../types';

interface PerformanceChartProps {
  etfs: ETFData[];
  onRefresh: () => void;
  isRefreshing: boolean;
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  etfs, 
  onRefresh, 
  isRefreshing,
  startDate,
  endDate,
  onDateChange
}) => {
  const [mode, setMode] = useState<'percentage' | 'price'>('price');

  const chartData = useMemo(() => {
    if (etfs.length === 0) return [];

    // Map all dates to ensure alignment
    const allDates = Array.from(new Set<string>(etfs.flatMap(e => e.history.map(h => h.date)))).sort();

    return allDates.map(date => {
      const point: ChartDataPoint = { date };
      etfs.forEach(etf => {
        const dayData = etf.history.find(h => h.date === date);
        if (dayData) {
          if (mode === 'percentage') {
            // Calculate percentage change relative to the first available data point for this ETF
            const firstPoint = etf.history[0]?.close || 1;
            const change = ((dayData.close - firstPoint) / firstPoint) * 100;
            point[etf.id] = parseFloat(change.toFixed(2));
          } else {
            point[etf.id] = dayData.close;
          }
        }
      });
      return point;
    });
  }, [etfs, mode]);

  const handleDateInput = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      if (value > endDate) return; // Prevent start after end
      onDateChange(value, endDate);
    } else {
      if (value < startDate) return; // Prevent end before start
      onDateChange(startDate, value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
           <h2 className="text-lg font-bold text-slate-800">走势对比</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Controls */}
          <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => handleDateInput('start', e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm text-slate-700 focus:ring-0 p-1 cursor-pointer font-mono w-28 sm:w-auto"
            />
            <span className="text-slate-400 px-1">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => handleDateInput('end', e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm text-slate-700 focus:ring-0 p-1 cursor-pointer font-mono w-28 sm:w-auto"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('percentage')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                mode === 'percentage' 
                  ? 'bg-white text-accent shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              涨跌幅 (%)
            </button>
            <button
              onClick={() => setMode('price')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                mode === 'price' 
                  ? 'bg-white text-accent shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              净值 (元)
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-slate-400 hover:text-accent bg-slate-50 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            title="刷新数据"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {etfs.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-gray-300 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-lg font-medium">暂无数据</p>
          <p className="text-sm">请在上方添加 ETF 代码开始分析</p>
        </div>
      ) : (
        <>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => mode === 'percentage' ? `${value}%` : `¥${value}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                  labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => {
                    return [
                      mode === 'percentage' ? `${value.toFixed(2)}%` : `¥${value.toFixed(3)}`,
                      name
                    ];
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => {
                    return <span className="text-sm font-medium text-slate-700 ml-1">{value}</span>;
                  }}
                />
                {mode === 'percentage' && (
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                )}
                {etfs.map((etf) => (
                  <Line
                    key={etf.id}
                    type="monotone"
                    dataKey={etf.id}
                    name={`${etf.name} (${etf.code})`}
                    stroke={etf.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls
                    animationDuration={1000}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">
            * 数据由 AI 模型通过 Google Search 实时抓取，可能会因网络波动或来源限制产生延迟。
          </div>
        </>
      )}
    </div>
  );
};
