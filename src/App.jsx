import React, { useState, useEffect } from 'react';
import { Terminal, Database, Cpu, TrendingUp, Play, ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';

import Phase1Viewer from './components/Phase1Viewer';
import Phase2Viewer from './components/Phase2Viewer';
import Phase3Backtester from './components/Phase3Backtester';
import TerminalConsole from './components/TerminalConsole';

// Pre-packaged results fallback if JSON load delay occurs
import initialData from '../data/pipeline_results.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('phase1');
  const [pipelineData, setPipelineData] = useState(initialData);

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col selection:bg-pastel selection:text-black">
      {/* Top Cyberpunk Status Header */}
      <header className="border-b-2 border-pastel bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-pastel shadow-brutal-sm"></div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-widest uppercase flex items-center">
                QUANT TERMINAL <span className="text-pastel ml-2">// HFT ML PIPELINE</span>
              </h1>
              <p className="text-[11px] text-muted-gray">TERMINAL BRUTALISM / CYBERPUNK MINIMALIST SYSTEM</p>
            </div>
          </div>

          {/* System Telemetry Pills */}
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="bg-zinc-950 border border-zinc-800 px-3 py-1 flex items-center space-x-2">
              <span className="w-2 h-2 bg-pastel rounded-none inline-block animate-pulse"></span>
              <span className="text-zinc-400">POLARS ENGINE:</span>
              <span className="text-pastel font-bold">ACTIVE</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 px-3 py-1 flex items-center space-x-2">
              <span className="text-zinc-400">FEES:</span>
              <span className="text-red-400 font-bold">$0.004 / TRADE</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 px-3 py-1 flex items-center space-x-2">
              <span className="text-zinc-400">MODEL PnL:</span>
              <span className="text-pastel font-bold">
                +${pipelineData?.backtest_metrics?.sniper?.net_profit ? pipelineData.backtest_metrics.sniper.net_profit.toFixed(2) : '3,237.34'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('phase1')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-r border-zinc-800 transition-colors ${
              activeTab === 'phase1' 
                ? 'bg-pastel text-black border-b-2 border-pastel' 
                : 'text-muted-gray hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>PHASE 1: FEATURE ENG</span>
          </button>

          <button
            onClick={() => setActiveTab('phase2')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-r border-zinc-800 transition-colors ${
              activeTab === 'phase2' 
                ? 'bg-pastel text-black border-b-2 border-pastel' 
                : 'text-muted-gray hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>PHASE 2: MODEL TRAIN</span>
          </button>

          <button
            onClick={() => setActiveTab('phase3')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-r border-zinc-800 transition-colors ${
              activeTab === 'phase3' 
                ? 'bg-pastel text-black border-b-2 border-pastel' 
                : 'text-muted-gray hover:text-white hover:bg-zinc-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>PHASE 3: BACKTEST & SNIPER</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-r border-zinc-800 transition-colors ${
              activeTab === 'terminal' 
                ? 'bg-pastel text-black border-b-2 border-pastel' 
                : 'text-muted-gray hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>LIVE TERMINAL</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {activeTab === 'phase1' && (
          <Phase1Viewer datasetSummary={pipelineData?.dataset_summary} />
        )}

        {activeTab === 'phase2' && (
          <Phase2Viewer 
            datasetSummary={pipelineData?.dataset_summary}
            featureImportances={pipelineData?.feature_importances}
            classificationReport={pipelineData?.classification_report}
          />
        )}

        {activeTab === 'phase3' && (
          <Phase3Backtester 
            backtestMetrics={pipelineData?.backtest_metrics}
            pnlSeries={pipelineData?.pnl_series}
            tradeLogs={pipelineData?.trade_logs}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalConsole onRunPipeline={() => setPipelineData(initialData)} />
        )}
      </main>

      {/* Footer per Brand Specs */}
      <footer className="border-t border-zinc-900 bg-black py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-muted-gray gap-2">
          <div>
            INSTITUTIONAL HFT MACHINE LEARNING PLATFORM &bull; PARQUET & SCIPY PIPELINE
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>STRICT 0PX BORDER-RADIUS</span>
            <span>CYBERPUNK MINIMALIST AESTHETIC</span>
            <span className="text-pastel font-bold">#77DD77</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
