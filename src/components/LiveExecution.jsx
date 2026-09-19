import React, { useState, useEffect } from 'react';
import NcursesFrame from './NcursesFrame';
import { useTheme } from '../context/ThemeContext';
import { usePageTitle } from '../hooks/usePageTitle';

export default function LiveExecution() {
  const { theme, mode } = useTheme();
  
  usePageTitle('Live Trading');
  
  const [deployMode, setDeployMode] = useState('paper'); // 'paper' or 'live'
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pnl, setPnl] = useState(0.0);
  const [positions, setPositions] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);

  const startDeployment = () => {
    setIsRunning(true);
    setLogs(["[+] INITIATING WEBSOCKET CONNECTION TO BROKER...", `[+] MODE: ${deployMode.toUpperCase()} TRADING ENABLED.`, "[+] WAITING FOR NEXT LOBSTER TICK..."]);
    setPnl(0.0);
    setPositions(0);
    setTradeCount(0);
  };

  const stopDeployment = () => {
    setIsRunning(false);
    setLogs(prev => [...prev, "[!] GRACEFUL SHUTDOWN INITIATED. ALL POSITIONS FLATTENED."]);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.5;
      const size = Math.floor(Math.random() * 5) + 1;
      const price = (150 + Math.random() * 5).toFixed(2);
      const profit = (Math.random() * 10 - 4).toFixed(2); // mostly positive but some negative
      
      setTradeCount(prev => prev + 1);
      
      if (Math.random() > 0.3) {
        // Log a trade
        const logMsg = `[EXEC] ${isBuy ? 'BUY ' : 'SELL'} ${size} AAPL @ $${price} | LATENCY: ${(Math.random() * 2).toFixed(1)}ms`;
        setLogs(prev => {
            const newLogs = [...prev, logMsg];
            if (newLogs.length > 15) newLogs.shift();
            return newLogs;
        });
        
        setPnl(prev => prev + parseFloat(profit));
        setPositions(prev => isBuy ? prev + size : prev - size);
      } else {
        // Log a tick/skip
        const logMsg = `[TICK] AAPL $${price} | CONFIDENCE: ${(Math.random() * 0.4).toFixed(2)} | NO FILL`;
        setLogs(prev => {
            const newLogs = [...prev, logMsg];
            if (newLogs.length > 15) newLogs.shift();
            return newLogs;
        });
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className={`space-y-4 font-mono text-xs ${theme.text} p-2`}>
      <NcursesFrame title="STEP 4: LIVE STRATEGY DEPLOYMENT" headerExtra="[ EXECUTION ]">
        
        {/* Control Panel */}
        <div className={`border border-dashed ${theme.borderMuted} p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-4`}>
          <div className="flex items-center space-x-4">
            <span className="font-bold">EXECUTION MODE:</span>
            <select 
              value={deployMode} 
              onChange={(e) => setDeployMode(e.target.value)}
              disabled={isRunning}
              className={`bg-transparent border ${theme.borderMuted} p-1 focus:outline-none ${theme.text} font-bold`}
            >
              <option value="paper">PAPER TRADING (SIMULATION)</option>
              <option value="live">LIVE TRADING (REAL CAPITAL)</option>
            </select>
          </div>
          
          <button 
            onClick={isRunning ? stopDeployment : startDeployment}
            className={`ncurses-btn text-sm font-bold px-6 py-2 ${isRunning ? theme.btnActive : theme.btnClass}`}
          >
            {isRunning ? '[ HALT TRADING & FLATTEN ]' : '[ DEPLOY TO MARKET ]'}
          </button>
        </div>

        {/* Telemetry Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={`border border-dashed ${theme.borderMuted} p-3 text-center`}>
            <div className={`text-[10px] ${theme.textMuted} mb-1`}>REALIZED PnL</div>
            <div className={`text-lg font-bold ${pnl >= 0 ? theme.text : theme.textMuted}`}>
              ${pnl.toFixed(2)}
            </div>
          </div>
          
          <div className={`border border-dashed ${theme.borderMuted} p-3 text-center`}>
            <div className={`text-[10px] ${theme.textMuted} mb-1`}>NET EXPOSURE (SHARES)</div>
            <div className="text-lg font-bold">{positions}</div>
          </div>
          
          <div className={`border border-dashed ${theme.borderMuted} p-3 text-center`}>
            <div className={`text-[10px] ${theme.textMuted} mb-1`}>TOTAL TRADES</div>
            <div className="text-lg font-bold">{tradeCount}</div>
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className={`border border-solid ${theme.borderMuted} ${theme.boxBg} p-3 text-xs font-mono space-y-1 h-64 overflow-y-auto flex flex-col justify-end`}>
          {logs.length === 0 && <span className={theme.textMuted}>System idle. Configure mode and deploy.</span>}
          {logs.map((log, idx) => (
            <div key={idx} className={log.includes("EXEC") ? `font-bold ${theme.text}` : log.includes("HALT") ? `font-bold ${theme.text}` : theme.textMuted}>
              {log}
            </div>
          ))}
          {isRunning && (
            <div className={`${theme.text} font-bold pt-2 flex items-center`}>
              <span>[LISTENING ON WSS://ORDERBOOK...] </span>
              <span className={`w-2.5 h-4 ${theme.headerBg} ml-1 inline-block animate-cursor`}></span>
            </div>
          )}
        </div>
        
      </NcursesFrame>
    </div>
  );
}
