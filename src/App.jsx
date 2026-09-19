import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

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
  const [pipelineData, setPipelineData] = useState(null); // Null until pipeline runs
  const { mode, isDark, toggleMode, theme } = useTheme();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect logic for unauthenticated users
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect authenticated users from root/login to home
  if (isAuthenticated && (location.pathname === '/' || location.pathname === '/login')) {
    return <Navigate to="/home/setup" replace />;
  }

  const MainLayout = ({ children }) => {
    // Determine active tab from URL path
    const activeTab = location.pathname.split('/').pop();
    
    return (
      <div className={`h-screen w-screen ${theme.bg} ${theme.text} font-mono flex flex-col overflow-hidden p-2 select-none border-2 ${theme.border}`}>
        {/* Top ncurses Title & System Telemetry Header */}
        <header className={`${theme.headerBg} ${theme.headerText} px-3 py-1 font-bold flex flex-col md:flex-row justify-between items-start md:items-center text-xs uppercase shrink-0`}>
          <div className="flex items-center space-x-2 font-extrabold text-sm">
            <span>┌─[ QuantShell ]</span>
            <span>HFT ML PIPELINE</span>
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
            onClick={() => navigate('/home/setup')}
            className={`ncurses-btn text-xs font-bold ${activeTab === 'setup' ? theme.btnActive : theme.btnClass}`}
          >
            [ F0: SETUP ]
          </button>
          
          <button
            onClick={() => navigate('/home/data')}
            disabled={!pipelineData}
            className={`ncurses-btn text-xs font-bold ${activeTab === 'data' ? theme.btnActive : theme.btnClass} ${!pipelineData ? 'opacity-50' : ''}`}
          >
            [ F1: DATA ]
          </button>

          <button
            onClick={() => navigate('/home/model')}
            disabled={!pipelineData}
            className={`ncurses-btn text-xs font-bold ${activeTab === 'model' ? theme.btnActive : theme.btnClass} ${!pipelineData ? 'opacity-50' : ''}`}
          >
            [ F2: MODEL ]
          </button>

          <button
            onClick={() => navigate('/home/backtest')}
            disabled={!pipelineData}
            className={`ncurses-btn text-xs font-bold ${activeTab === 'backtest' ? theme.btnActive : theme.btnClass} ${!pipelineData ? 'opacity-50' : ''}`}
          >
            [ F3: BACKTEST ]
          </button>
          
          <button
            onClick={() => navigate('/home/live')}
            disabled={!pipelineData}
            className={`ncurses-btn text-xs font-bold ${activeTab === 'live' ? theme.btnActive : theme.btnClass} ${!pipelineData ? 'opacity-50' : ''}`}
          >
            [ F4: LIVE TRADING ]
          </button>

          <button
            onClick={() => navigate('/home/terminal')}
            className={`ncurses-btn text-xs font-bold ${activeTab === 'terminal' ? theme.btnActive : theme.btnClass}`}
          >
            [ F5: TERMINAL ]
          </button>

          {/* Mode Toggle Button */}
          <button
            onClick={toggleMode}
            className={`ncurses-btn text-xs font-bold ml-auto ${theme.btnActive}`}
            title="Click to toggle Light/Dark Mode"
          >
            [ 🌗 F6: MODE ({mode.toUpperCase()}) ]
          </button>
        </nav>

        {/* Main Viewport Content Area */}
        <main className={`flex-1 overflow-auto p-2 ${theme.bg}`}>
          {children}
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
  };

  return (
    <Routes>
      <Route path="/login" element={<AuthScreen onLogin={() => setIsAuthenticated(true)} />} />
      
      <Route path="/home/setup" element={
        <MainLayout>
          <ConfigDashboard onRunPipeline={() => { setPipelineData(initialData); navigate('/home/data'); }} />
        </MainLayout>
      } />
      
      <Route path="/home/data" element={
        <MainLayout>
          {pipelineData ? <Phase1Viewer datasetSummary={pipelineData.dataset_summary} /> : <Navigate to="/home/setup" replace />}
        </MainLayout>
      } />
      
      <Route path="/home/model" element={
        <MainLayout>
          {pipelineData ? <Phase2Viewer datasetSummary={pipelineData.dataset_summary} featureImportances={pipelineData.feature_importances} classificationReport={pipelineData.classification_report} /> : <Navigate to="/home/setup" replace />}
        </MainLayout>
      } />
      
      <Route path="/home/backtest" element={
        <MainLayout>
          {pipelineData ? <Phase3Backtester backtestMetrics={pipelineData.backtest_metrics} pnlSeries={pipelineData.pnl_series} tradeLogs={pipelineData.trade_logs} /> : <Navigate to="/home/setup" replace />}
        </MainLayout>
      } />
      
      <Route path="/home/live" element={
        <MainLayout>
          {pipelineData ? <LiveExecution /> : <Navigate to="/home/setup" replace />}
        </MainLayout>
      } />
      
      <Route path="/home/terminal" element={
        <MainLayout>
          <TerminalConsole onRunPipeline={() => setPipelineData(initialData)} />
        </MainLayout>
      } />
    </Routes>
  );
}
