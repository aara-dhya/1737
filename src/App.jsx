import React, { useState } from 'react';

import AuthScreen from './components/AuthScreen';
import ConfigDashboard from './components/ConfigDashboard';
import Phase1Viewer from './components/Phase1Viewer';
import Phase2Viewer from './components/Phase2Viewer';
import Phase3Backtester from './components/Phase3Backtester';
import LiveExecution from './components/LiveExecution';
import TerminalConsole from './components/TerminalConsole';
import { useTheme } from './context/ThemeContext';

import initialData from '../data/pipeline_results.json';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [pipelineData, setPipelineData] = useState(null); // Null until pipeline runs
  const { mode, isDark, toggleMode, theme } = useTheme();

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`h-screen w-screen ${theme.bg} ${theme.text} font-mono flex flex-col overflow-hidden p-2 select-none border-2 ${theme.border}`}>
      {/* Top ncurses Title & System Telemetry Header */}
      <header className={`${theme.headerBg} ${theme.headerText} px-3 py-1 font-bold flex flex-col md:flex-row justify-between items-start md:items-center text-xs uppercase shrink-0`}>
        <div className="flex items-center space-x-2 font-extrabold text-sm">
          <span>┌─[ ncurses v5.9 ]</span>
          <span>QUANT TERMINAL :: HFT ML PIPELINE</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-bold">
          <span>ENGINE: [ POLARS ]</span>
          <span>TAKER FRICTION: [ $0.004 ]</span>
          <span>NET PnL: [ {pipelineData?.backtest_metrics?.sniper?.net_profit ? `+$${pipelineData.backtest_metrics.sniper.net_profit.toFixed(2)}` : 'N/A'} ]</span>
        </div>
      </header>

      {/* Function Keys Navigation Bar */}
      <nav className={`${theme.bg} border-b ${theme.border} py-1.5 px-2 flex space-x-2 shrink-0 overflow-x-auto`}>
        <button
          onClick={() => setActiveTab('config')}
          className={`ncurses-btn text-xs font-bold ${activeTab === 'config' ? theme.btnActive : theme.text}`}
        >
          [ F0: SETUP ]
        </button>
        
        <button
          onClick={() => setActiveTab('phase1')}
          disabled={!pipelineData}
          className={`ncurses-btn text-xs font-bold ${activeTab === 'phase1' ? theme.btnActive : theme.text} ${!pipelineData ? 'opacity-50' : ''}`}
        >
          [ F1: DATA ]
        </button>

        <button
          onClick={() => setActiveTab('phase2')}
          disabled={!pipelineData}
          className={`ncurses-btn text-xs font-bold ${activeTab === 'phase2' ? theme.btnActive : theme.text} ${!pipelineData ? 'opacity-50' : ''}`}
        >
          [ F2: MODEL ]
        </button>

        <button
          onClick={() => setActiveTab('phase3')}
          disabled={!pipelineData}
          className={`ncurses-btn text-xs font-bold ${activeTab === 'phase3' ? theme.btnActive : theme.text} ${!pipelineData ? 'opacity-50' : ''}`}
        >
          [ F3: BACKTEST ]
        </button>
        
        <button
          onClick={() => setActiveTab('live')}
          disabled={!pipelineData}
          className={`ncurses-btn text-xs font-bold ${activeTab === 'live' ? theme.btnActive : theme.text} ${!pipelineData ? 'opacity-50' : ''}`}
        >
          [ F4: LIVE TRADING ]
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`ncurses-btn text-xs font-bold ${activeTab === 'terminal' ? theme.btnActive : theme.text}`}
        >
          [ F5: TERMINAL ]
        </button>

        {/* Mode Toggle Button */}
        <button
          onClick={toggleMode}
          className={`ncurses-btn text-xs font-bold ml-auto ${theme.btnActive} animate-pulse`}
          title="Click to toggle Light/Dark Mode"
        >
          [ 🌗 F6: MODE ({mode.toUpperCase()}) ]
        </button>
      </nav>

      {/* Main Viewport Content Area */}
      <main className={`flex-1 overflow-auto p-2 ${theme.bg}`}>
        {activeTab === 'config' && (
          <ConfigDashboard 
            onRunPipeline={() => {
              setPipelineData(initialData);
              setActiveTab('phase1');
            }} 
          />
        )}

        {activeTab === 'phase1' && pipelineData && (
          <Phase1Viewer datasetSummary={pipelineData?.dataset_summary} />
        )}

        {activeTab === 'phase2' && pipelineData && (
          <Phase2Viewer 
            datasetSummary={pipelineData?.dataset_summary}
            featureImportances={pipelineData?.feature_importances}
            classificationReport={pipelineData?.classification_report}
          />
        )}

        {activeTab === 'phase3' && pipelineData && (
          <Phase3Backtester 
            backtestMetrics={pipelineData?.backtest_metrics}
            pnlSeries={pipelineData?.pnl_series}
            tradeLogs={pipelineData?.trade_logs}
          />
        )}
        
        {activeTab === 'live' && pipelineData && (
          <LiveExecution />
        )}

        {activeTab === 'terminal' && (
          <TerminalConsole onRunPipeline={() => setPipelineData(initialData)} />
        )}
      </main>

      {/* Bottom ncurses Status Bar */}
      <footer className={`${theme.headerBg} ${theme.headerText} px-2 py-0.5 font-bold flex justify-between items-center text-[11px] uppercase shrink-0`}>
        <div>
          &lt;F0&gt; SETUP &bull; &lt;F1&gt; DATA &bull; &lt;F2&gt; MODEL &bull; &lt;F3&gt; BACKTEST &bull; &lt;F4&gt; LIVE &bull; &lt;F5&gt; SHELL &bull; &lt;F6&gt; MODE
        </div>
        <div className="font-mono text-[10px]">
          [ TUI MODE: {mode.toUpperCase()} ]
        </div>
      </footer>
    </div>
  );
}
