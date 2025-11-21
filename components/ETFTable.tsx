import React from 'react';
import { ETFData } from '../types';
import { ArrowUp, ArrowDown, Minus, ExternalLink } from 'lucide-react';

interface ETFTableProps {
  etfs: ETFData[];
}

export const ETFTable: React.FC<ETFTableProps> = ({ etfs }) => {
  if (etfs.length === 0) return null;

  // Aggregate all unique sources
  const uniqueSources = Array.from(
    new Map(
      etfs.flatMap(e => e.sources || []).map(s => [s.uri, s])
    ).values()
  ).slice(0, 5); // Limit to top 5 sources to avoid clutter

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">数据概览</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">标的名称</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">最新价</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">60日涨跌幅</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">最高价 (60日)</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">最低价 (60日)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {etfs.map((etf) => {
              const history = etf.history;
              const latest = history[history.length - 1];
              const start = history[0];
              
              const latestPrice = latest?.close || 0;
              const startPrice = start?.close || 1;
              
              const change = latestPrice - startPrice;
              const changePercent = (change / startPrice) * 100;
              
              const maxPrice = Math.max(...history.map(h => h.close));
              const minPrice = Math.min(...history.map(h => h.close));

              return (
                <tr key={etf.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" 
                        style={{ backgroundColor: etf.color }}
                      />
                      <span>{etf.name}</span>
                      <span className="text-slate-400 font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {etf.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">
                    ¥{latestPrice.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium">
                    <div className={`inline-flex items-center justify-end gap-1 ${
                      changePercent > 0 ? 'text-red-600' : changePercent < 0 ? 'text-green-600' : 'text-slate-500'
                    }`}>
                      {changePercent > 0 ? <ArrowUp className="w-3.5 h-3.5" /> : changePercent < 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {Math.abs(changePercent).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-500">
                    ¥{maxPrice.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-500">
                    ¥{minPrice.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {uniqueSources.length > 0 && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>数据来源:</span>
            {uniqueSources.map((source, index) => (
              <a 
                key={index} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-slate-600 hover:underline transition-colors"
              >
                {source.title}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};