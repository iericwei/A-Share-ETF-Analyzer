import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { COMMON_ETFS, ETFItem } from '../utils/etfList';

interface ETFInputProps {
  onAdd: (code: string) => Promise<void>;
  isLoading: boolean;
}

export const ETFInput: React.FC<ETFInputProps> = ({ onAdd, isLoading }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<ETFItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const searchTerm = input.trim().toLowerCase();
    if (!searchTerm) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = COMMON_ETFS.filter(etf => 
      etf.code.includes(searchTerm) || 
      etf.name.toLowerCase().includes(searchTerm)
    ).slice(0, 6); // Limit to 6 suggestions

    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [input]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await submitValue(input.trim());
  };

  const submitValue = async (value: string) => {
    setInput(''); // Clear first for better UX, assuming success or user wants to type new
    setShowSuggestions(false);
    await onAdd(value);
  };

  const handleSuggestionClick = (etf: ETFItem) => {
    submitValue(etf.code);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative w-full max-w-md z-20">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => {
              if (input.trim() && suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="输入代码或名称 (例如: 510300)"
            autoComplete="off"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition duration-150 ease-in-out"
            disabled={isLoading}
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput('');
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              获取中
            </>
          ) : (
            '添加'
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-64 overflow-y-auto z-50">
          <ul className="py-1">
            {suggestions.map((etf) => (
              <li key={etf.code}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(etf)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex justify-between items-center group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 group-hover:text-accent">{etf.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{etf.code}</span>
                  </div>
                  <span className="text-xs text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-white group-hover:text-slate-400">
                    {etf.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};