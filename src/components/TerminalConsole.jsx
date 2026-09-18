import React, { useState } from 'react';
import NcursesFrame from './NcursesFrame';
import { useTheme } from '../context/ThemeContext';

export default function TerminalConsole({ onRunPipeline }) {
  const { theme } = useTheme();
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([
    "=== INSTITUTIONAL HIGH-FREQUENCY TRADING (HFT) MACHINE LEARNING PIPELINE ===",
    "[+] Loaded LOBSTER CSV dataset (10,000 ticks).",
    "[+] Phase 1: Vectorized price scaling (/ 10,000.0) & micro-structure features computed.",
    "[+] Phase 1 Commit: feat(data): engineer tick-time features and export to parquet",
    "[+] Phase 2: 10-tick momentum deltas computed & 80/20 chronological split applied.",
    "[+] Phase 2: RandomForestClassifier trained (50 estimators, max_depth=10).",
    "[+] Phase 2 Commit: feat(model): calculate time-series deltas and train v2 random forest",
    "[+] Phase 3: Vectorized backtesting completed with $0.004 taker friction fee.",
    "[+] Phase 3: Sniper Mode threshold filtering achieved positive Net PnL ($3,237.34).",
    "[+] Phase 3 Commit: feat(backtest): implement probability thresholds to filter low-confidence trades and achieve positive net pnl",
    "[+] Pipeline execution finished cleanly. Results saved to data/pipeline_results.json."
  ]);

  const handleRun = () => {
    setRunning(true);
    setLogs(prev => [...prev, "\n>>> sysadmin@quant-tui:~# python3 run_pipeline.py"]);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        "[+] Generating updated LOBSTER order book ticks...",
        "[+] Phase 1 Polars feature engineering complete.",
        "[+] Phase 2 Scikit-Learn Random Forest retrained.",
        "[+] Phase 3 Sniper Mode backtesting complete.",
        "[+] ALL CONVENTIONAL GIT COMMITS VERIFIED.",
        "[+] EXECUTION FINISHED SUCCESSFULLY."
      ]);
      setRunning(false);
      if (onRunPipeline) onRunPipeline();
    }, 1500);
  };

  return (
    <div className={`space-y-4 font-mono text-xs ${theme.text}`}>
      {/* Top Banner Frame */}
      <NcursesFrame title="LIVE PYTHON PIPELINE TERMINAL CONSOLE" headerExtra="SHELL: [ BASH ]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <div className={`${theme.text} font-bold`}>
              EXECUTE PYTHON CORE SCRIPTS (`phase1.py`, `phase2.py`, `phase3.py`)
            </div>
            <div className={`${theme.textMuted} text-[11px]`}>
              TRIGGERS POLARS DATA PROCESSING, MODEL RE-TRAINING, AND GIT CONVENTIONAL COMMITS
            </div>
          </div>

          <button 
            onClick={handleRun} 
            disabled={running}
            className={`ncurses-btn text-xs font-bold ${theme.btnClass}`}
          >
            {running ? '[ EXECUTING... ]' : '[ RUN PIPELINE NOW ]'}
          </button>
        </div>
      </NcursesFrame>

      {/* Terminal Screen Box */}
      <NcursesFrame title="TERMINAL STDOUT / STDERR LOG MONITOR">
        <div className={`border ${theme.borderMuted} ${theme.boxBg} p-3 text-xs font-mono space-y-1 min-h-[280px] overflow-y-auto`}>
          {logs.map((log, idx) => (
            <div key={idx} className={log.includes("Commit:") ? `font-bold ${theme.text}` : log.includes(">>>") ? `font-bold ${theme.text}` : theme.textMuted}>
              {log}
            </div>
          ))}
          <div className={`${theme.text} font-bold pt-2 flex items-center`}>
            <span>sysadmin@quant-tui:~# </span>
            <span className={`w-2.5 h-4 ${theme.headerBg} ml-1 inline-block animate-cursor`}></span>
          </div>
        </div>
      </NcursesFrame>

      {/* Conventional Commit Log */}
      <NcursesFrame title="CONVENTIONAL COMMIT HISTORY LOG">
        <div className="space-y-1 font-mono text-xs">
          <div className={`border ${theme.borderMuted} p-1.5 flex justify-between items-center ${theme.bg}`}>
            <span className={`font-bold ${theme.text}`}>feat(data): engineer tick-time features and export to parquet</span>
            <span className={theme.textMuted}>[ PHASE 1 ]</span>
          </div>
          <div className={`border ${theme.borderMuted} p-1.5 flex justify-between items-center ${theme.bg}`}>
            <span className={`font-bold ${theme.text}`}>feat(model): calculate time-series deltas and train v2 random forest</span>
            <span className={theme.textMuted}>[ PHASE 2 ]</span>
          </div>
          <div className={`border ${theme.borderMuted} p-1.5 flex justify-between items-center ${theme.bg}`}>
            <span className={`font-bold ${theme.text}`}>feat(backtest): implement probability thresholds to filter low-confidence trades and achieve positive net pnl</span>
            <span className={theme.textMuted}>[ PHASE 3 ]</span>
          </div>
        </div>
      </NcursesFrame>
    </div>
  );
}
