import React, { useState, useCallback } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { ETFInput } from './components/ETFInput';
import { ETFList } from './components/ETFList';
import { PerformanceChart } from './components/PerformanceChart';
import { ETFTable } from './components/ETFTable';
import { ETFDetailModal } from './components/ETFDetailModal';
import { fetchETFHistory, fetchETFProfile } from './services/geminiService';
import { ETFData } from './types';
import { getNextColor } from './utils/colors';

// Helper to get default dates
const getDefaultDates = () => {
  const today = new Date();
  const past = new Date(today);
  past.setDate(today.getDate() - 60);
  return {
    start: past.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0]
  };
};

const App: React.FC = () => {
  const defaultDates = getDefaultDates();
  const [dateRange, setDateRange] = useState<{start: string, end: string}>(defaultDates);
  
  const [etfs, setEtfs] = useState<ETFData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [selectedEtfId, setSelectedEtfId] = useState<string | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const handleAddETF = useCallback(async (codeOrName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if already exists
      const exists = etfs.some(
        e => e.code === codeOrName || e.name.includes(codeOrName)
      );
      if (exists) {
        throw new Error("该 ETF 已经在列表中");
      }

      // Use current date range
      const data = await fetchETFHistory(codeOrName, dateRange.start, dateRange.end);
      
      // Double check existence by returned code
      if (etfs.some(e => e.code === data.code)) {
        throw new Error(`ETF ${data.name} (${data.code}) 已经在列表中`);
      }

      const newETF: ETFData = {
        id: data.code, // Using code as ID
        code: data.code,
        name: data.name,
        history: data.history,
        color: getNextColor(etfs.map(e => e.color)),
        sources: data.sources
      };

      setEtfs(prev => [...prev, newETF]);
    } catch (err: any) {
      setError(err.message || "无法获取 ETF 数据，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  }, [etfs, dateRange]);

  // Centralized refresh logic that accepts an optional override for dates
  // This allows us to refresh with new dates before the state effectively updates in some scenarios,
  // or just refresh current state.
  const refreshData = async (targetStart: string, targetEnd: string) => {
    if (etfs.length === 0) return;
    setIsRefreshing(true);
    setError(null);
    
    try {
      const promises = etfs.map(async (currentEtf) => {
        try {
          // Use code for precise re-fetching with target dates
          const data = await fetchETFHistory(currentEtf.code, targetStart, targetEnd);
          return {
            ...currentEtf,
            history: data.history,
            sources: data.sources,
            name: data.name // Update name in case it was corrected
          };
        } catch (e) {
          console.error(`Failed to refresh ${currentEtf.name}`, e);
          // If refresh fails, keep old data
          return currentEtf;
        }
      });

      const updatedEtfs = await Promise.all(promises);
      setEtfs(updatedEtfs);
    } catch (err: any) {
      setError("刷新数据失败，请检查网络后重试");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshAll = useCallback(() => {
    refreshData(dateRange.start, dateRange.end);
  }, [etfs, dateRange]);

  const handleDateChange = useCallback((start: string, end: string) => {
    setDateRange({ start, end });
    // Trigger a refresh with the NEW dates immediately
    // We pass them explicitly because the setDateRange state update might not be reflected yet in the closure
    refreshData(start, end);
  }, [etfs]); // depend on etfs so we can refresh them

  const handleRemoveETF = useCallback((id: string) => {
    setEtfs(prev => prev.filter(e => e.id !== id));
    if (selectedEtfId === id) setSelectedEtfId(null);
  }, [selectedEtfId]);

  const handleSelectETF = useCallback(async (etf: ETFData) => {
    setSelectedEtfId(etf.id);
    
    // If profile is missing, fetch it
    if (!etf.profile) {
      setIsFetchingProfile(true);
      try {
        const profile = await fetchETFProfile(etf.code, etf.name);
        
        // Update etfs state with new profile to cache it
        setEtfs(prev => prev.map(item => 
          item.id === etf.id ? { ...item, profile } : item
        ));
      } catch (e) {
        console.error("Error fetching profile", e);
      } finally {
        setIsFetchingProfile(false);
      }
    }
  }, []);

  const selectedEtf = etfs.find(e => e.id === selectedEtfId) || null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-accent p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">A股 ETF 对比分析</h1>
                <p className="text-xs text-slate-500 hidden sm:block">基于 Gemini 实时搜索数据</p>
              </div>
            </div>
            <div className="text-sm text-slate-500 font-mono">
              API: Connected
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 space-y-6">
          {/* Control Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              管理投资组合
            </h2>
            
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-full md:w-auto">
                <ETFInput onAdd={handleAddETF} isLoading={isLoading} />
                {error && (
                  <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-md">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <span className="text-sm text-gray-400">已选标的:</span>
                <ETFList 
                  etfs={etfs} 
                  onRemove={handleRemoveETF} 
                  onSelect={handleSelectETF}
                />
              </div>
            </div>
          </div>

          {/* Visualization */}
          <PerformanceChart 
            etfs={etfs} 
            onRefresh={handleRefreshAll}
            isRefreshing={isRefreshing}
            startDate={dateRange.start}
            endDate={dateRange.end}
            onDateChange={handleDateChange}
          />

          {/* Data Table */}
          <ETFTable etfs={etfs} />
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">自由添加</h3>
            <p className="text-sm text-blue-700">
              支持输入中国 A 股市场的 ETF 代码（如 510300）或中文简称（如 沪深300）。
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-900 mb-2">灵活周期</h3>
            <p className="text-sm text-green-700">
              支持自定义分析的时间范围，既可查看短期波动，也可分析中期趋势。
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-900 mb-2">AI 驱动</h3>
            <p className="text-sm text-purple-700">
              结合 Gemini 模型与 Google 搜索，获取最新的市场行情数据，减少模拟误差。
            </p>
          </div>
        </div>
      </main>
      
      {/* Modal */}
      <ETFDetailModal 
        etf={selectedEtf}
        isOpen={!!selectedEtf}
        isLoading={isFetchingProfile}
        onClose={() => setSelectedEtfId(null)}
      />
    </div>
  );
};

export default App;
