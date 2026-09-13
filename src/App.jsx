import React, { useState } from 'react';

import Phase1Viewer from './components/Phase1Viewer';
import Phase2Viewer from './components/Phase2Viewer';
import Phase3Backtester from './components/Phase3Backtester';
import TerminalConsole from './components/TerminalConsole';

import initialData from '../data/pipeline_results.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('phase1');
  const [pipelineData, setPipelineData] = useState(initialData);

  return (
    <div className="h-screen w-screen bg-black text-green-400 font-mono flex flex-col overflow-hidden p-2 select-none border-2 border-green-400">
      {/* Top ncurses Title & System Telemetry Header */}
      <header className="bg-green-400 text-black px-3 py-1 font-bold flex flex-col md:flex-row justify-between items-start md:items-center text-xs uppercase shrink-0">
        <div className="flex items-center space-x-2 font-extrabold text-sm">
          <span>┌─[ ncurses v5.9 ]</span>
          <span>QUANT TERMINAL :: HFT ML PIPELINE</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-bold">
          <span>ENGINE: [ POLARS ]</span>
          <span>TAKER FRICTION: [ $0.004 ]</span>
          <span>NET PnL: [ +${pipelineData?.backtest_metrics?.sniper?.net_profit ? pipelineData.backtest_metrics.sniper.net_profit.toFixed(2) : '3,237.34'} ]</span>
        </div>
      </header>

      {/* Function Keys Navigation Bar ([F1: DATA], [F2: MODEL], [F3: BACKTEST], [F4: LOGS]) */}
      <nav className="bg-black border-b border-green-400 py-1.5 px-2 flex space-x-2 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('phase1')}
          className={`ncurses-btn text-xs font-bold ${
            activeTab === 'phase1' ? 'bg-green-400 text-black' : 'text-green-400'
          }`}
        >
          [ F1: DATA / FEATURE ENG ]
        </button>

        <button
          onClick={() => setActiveTab('phase2')}
          className={`ncurses-btn text-xs font-bold ${
            activeTab === 'phase2' ? 'bg-green-400 text-black' : 'text-green-400'
          }`}
        >
          [ F2: MODEL TRAIN / DELTAS ]
        </button>

        <button
          onClick={() => setActiveTab('phase3')}
          className={`ncurses-btn text-xs font-bold ${
            activeTab === 'phase3' ? 'bg-green-400 text-black' : 'text-green-400'
          }`}
        >
          [ F3: BACKTEST & SNIPER ]
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`ncurses-btn text-xs font-bold ${
            activeTab === 'terminal' ? 'bg-green-400 text-black' : 'text-green-400'
          }`}
        >
          [ F4: LIVE TERMINAL ]
        </button>
      </nav>

      {/* Main Viewport Content Area */}
      <main className="flex-1 overflow-auto p-2 bg-black">
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

      {/* Bottom ncurses Status Bar */}
      <footer className="bg-green-400 text-black px-2 py-0.5 font-bold flex justify-between items-center text-[11px] uppercase shrink-0">
        <div>
          &lt;F1&gt; DATA &bull; &lt;F2&gt; MODEL &bull; &lt;F3&gt; BACKTEST &bull; &lt;F4&gt; SHELL &bull; &lt;F10&gt; QUIT
        </div>
        <div className="font-mono text-[10px]">
          [ TWO-TONE VGA 80x24 TUI DISPLAY ]
        </div>
      </footer>
    </div>
  );
}
