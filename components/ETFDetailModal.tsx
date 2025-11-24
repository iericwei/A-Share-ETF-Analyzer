import React from 'react';
import { X, Calendar, User, Building2, DollarSign, Activity } from 'lucide-react';
import { ETFData } from '../types';

interface ETFDetailModalProps {
  etf: ETFData | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

export const ETFDetailModal: React.FC<ETFDetailModalProps> = ({ etf, isOpen, isLoading, onClose }) => {
  if (!isOpen || !etf) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div 
                className="w-3 h-8 rounded-full" 
                style={{ backgroundColor: etf.color }}
              />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{etf.name}</h2>
              <p className="text-sm text-slate-500 font-mono">{etf.code}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 animate-pulse">正在搜索基金详情...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  基金简介
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {etf.profile?.description || "暂无简介"}
                </p>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> 基金经理
                  </div>
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {etf.profile?.manager || "--"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> 基金规模
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {etf.profile?.fundSize || "--"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> 基金公司
                  </div>
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {etf.profile?.company || "--"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 成立日期
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {etf.profile?.launchDate || "--"}
                  </div>
                </div>
              </div>

              {etf.profile?.trackingIndex && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">跟踪指数: </span>
                  <span className="text-sm font-medium text-slate-700 ml-1">{etf.profile.trackingIndex}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};