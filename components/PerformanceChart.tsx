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
import { ETFData, ChartDataPoint } from '../types';

interface PerformanceChartProps {
  etfs: ETFData[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ etfs }) => {
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

  if (etfs.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p className="text-lg font-medium">暂无数据</p>
        <p className="text-sm">请在上方添加 ETF 代码开始分析</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">走势对比 (近60天)</h2>
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
      </div>

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
        * 数据由 AI 模型生成，仅供演示参考，不构成投资建议。
      </div>
    </div>
  );
};