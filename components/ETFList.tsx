import React from 'react';
import { X } from 'lucide-react';
import { ETFData } from '../types';

interface ETFListProps {
  etfs: ETFData[];
  onRemove: (id: string) => void;
}

export const ETFList: React.FC<ETFListProps> = ({ etfs, onRemove }) => {
  if (etfs.length === 0) {
    return <div className="text-sm text-gray-400 mt-2 italic">暂无选中标的</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {etfs.map((etf) => (
        <div
          key={etf.id}
          className="inline-flex items-center pl-2 pr-1 py-1 rounded-md bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors group"
          style={{ borderLeftWidth: '4px', borderLeftColor: etf.color }}
        >
          <div className="flex items-baseline gap-1.5 mr-2 select-none">
            <span className="text-sm font-bold text-slate-700">{etf.name}</span>
            <span className="text-xs text-slate-400 font-mono">{etf.code}</span>
          </div>
          <button
            onClick={() => onRemove(etf.id)}
            className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
            title="移除"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};