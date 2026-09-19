import React, { useState } from 'react';
import NcursesFrame from './NcursesFrame';
import { useTheme } from '../context/ThemeContext';

export default function ConfigDashboard({ onRunPipeline }) {
  const { theme, mode } = useTheme();
  
  const [ticker, setTicker] = useState('LOBSTER:AAPL');
  const [dateRange, setDateRange] = useState('2024-01-01 / 2024-01-31');
  const [maxDepth, setMaxDepth] = useState(10);
  const [estimators, setEstimators] = useState(50);
  const [apiKey, setApiKey] = useState('sk_quant_12345');
  const [loading, setLoading] = useState(false);

  const handleRun = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRunPipeline();
    }, 1200);
  };

  return (
    <div className={`space-y-4 font-mono text-xs ${theme.text} p-2`}>
      <NcursesFrame title="STEP 1: STRATEGY & FEED CONFIGURATION" headerExtra="[ SETUP ]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
          
          {/* Data Feed Section */}
          <div className={`border border-dashed ${theme.borderMuted} p-4 space-y-4`}>
            <div className={`font-bold ${theme.headerText} ${theme.headerBg} px-2 py-1 uppercase inline-block`}>
              DATA FEED SETTINGS
            </div>
            
            <div>
              <label className="block mb-1 font-bold">EXCHANGE & TICKER:</label>
              <input 
                type="text" 
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className={`w-full bg-transparent border ${theme.borderMuted} p-2 focus:outline-none focus:border-${mode === 'light' ? 'black' : 'white'} ${theme.text}`}
              />
            </div>

            <div>
              <label className="block mb-1 font-bold">DATE RANGE:</label>
              <input 
                type="text" 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`w-full bg-transparent border ${theme.borderMuted} p-2 focus:outline-none focus:border-${mode === 'light' ? 'black' : 'white'} ${theme.text}`}
              />
            </div>

            <div>
              <label className="block mb-1 font-bold">INSTITUTIONAL API KEY:</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`w-full bg-transparent border ${theme.borderMuted} p-2 focus:outline-none focus:border-${mode === 'light' ? 'black' : 'white'} ${theme.text}`}
              />
            </div>
          </div>

          {/* Model Section */}
          <div className={`border border-dashed ${theme.borderMuted} p-4 space-y-4`}>
            <div className={`font-bold ${theme.headerText} ${theme.headerBg} px-2 py-1 uppercase inline-block`}>
              MODEL HYPERPARAMETERS
            </div>
            
            <div>
              <label className="block mb-1 font-bold">MAX DEPTH (TREES):</label>
              <input 
                type="number" 
                value={maxDepth}
                onChange={(e) => setMaxDepth(e.target.value)}
                className={`w-full bg-transparent border ${theme.borderMuted} p-2 focus:outline-none focus:border-${mode === 'light' ? 'black' : 'white'} ${theme.text}`}
              />
            </div>

            <div>
              <label className="block mb-1 font-bold">N ESTIMATORS:</label>
              <input 
                type="number" 
                value={estimators}
                onChange={(e) => setEstimators(e.target.value)}
                className={`w-full bg-transparent border ${theme.borderMuted} p-2 focus:outline-none focus:border-${mode === 'light' ? 'black' : 'white'} ${theme.text}`}
              />
            </div>
            
            <div className={`text-[10px] ${theme.textMuted} pt-2 border-t ${theme.borderMuted} mt-4`}>
              WARNING: Increasing max depth above 15 may cause overfitting on Level-10 order book data. High-Frequency models should prioritize generalizability.
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-dashed border-gray-500 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className={`text-[11px] ${theme.textMuted}`}>
            Ensure all API limits are respected before initializing Celery worker.
          </div>
          <button 
            onClick={handleRun}
            disabled={loading}
            className={`ncurses-btn text-sm font-bold px-6 py-2 ${theme.btnClass} ${loading ? 'opacity-50 animate-pulse' : ''}`}
          >
            {loading ? '[ INITIALIZING WORKER... ]' : '[ EXECUTE PIPELINE & BACKTEST ]'}
          </button>
        </div>
      </NcursesFrame>
    </div>
  );
}
