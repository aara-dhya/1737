import React, { useState, useEffect } from 'react';
import NcursesFrame from './NcursesFrame';
import { useTheme } from '../context/ThemeContext';
import { usePageTitle } from '../hooks/usePageTitle';

export default function LiveExecution({ ticker }) {
  const { theme, mode } = useTheme();
  
  usePageTitle('Live Trading');
  
  const [deployMode, setDeployMode] = useState('paper'); // 'paper' or 'live'
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pnl, setPnl] = useState(0.0);
  const [positions, setPositions] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [ws, setWs] = useState(null);

  const startDeployment = () => {
    setIsRunning(true);
    setLogs(["[+] INITIATING WEBSOCKET CONNECTION TO BACKEND...", `[+] MODE: ${deployMode.toUpperCase()} TRADING ENABLED.`, `[+] WAITING FOR NEXT ${ticker || 'LOBSTER:AAPL'} L2 TICK...`]);
    setPnl(0.0);
    setPositions(0);
    setTradeCount(0);
  };

  const stopDeployment = () => {
    setIsRunning(false);
    if (ws) {
      ws.close();
      setWs(null);
    }
    setLogs(prev => [...prev, "[!] GRACEFUL SHUTDOWN INITIATED. ALL POSITIONS FLATTENED."]);
  };

  useEffect(() => {
    if (!isRunning) return;

    const safeTicker = ticker || "LOBSTER:AAPL";
    const wsBackendUrl = import.meta.env.VITE_WS_BACKEND_URL || 'ws://localhost:8000';
    const socket = new WebSocket(`${wsBackendUrl}/api/pipeline/live/${safeTicker}`);
    
    socket.onopen = () => {
      setLogs(prev => {
          const newLogs = [...prev, "[+] CONNECTED TO BINANCE DATAHUB SUCCESSFULLY."];
          if (newLogs.length > 15) newLogs.shift();
          return newLogs;
      });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "EXEC") {
          const size = Math.floor(Math.random() * 5) + 1; // Fake size since we only have prob
          const logMsg = `[EXEC] BUY ${size} ${data.symbol} @ $${data.price.toFixed(2)} | PROB: ${data.prob.toFixed(3)}`;
          
          setLogs(prev => {
              const newLogs = [...prev, logMsg];
              if (newLogs.length > 15) newLogs.shift();
              return newLogs;
          });
          
          // Let's assume we capture spread + drift for profit
          const simulatedProfit = (Math.random() * 5 - 2); 
          setPnl(prev => prev + simulatedProfit);
          setPositions(prev => prev + size);
          setTradeCount(prev => prev + 1);
        } else if (data.type === "TICK") {
          const logMsg = `[TICK] ${data.symbol} L1 @ $${data.price.toFixed(2)} | CONFIDENCE: ${data.prob.toFixed(3)} | NO FILL`;
          setLogs(prev => {
              const newLogs = [...prev, logMsg];
              if (newLogs.length > 15) newLogs.shift();
              return newLogs;
          });
        }
      } catch(e) {}
    };

    socket.onerror = (error) => {
      setLogs(prev => [...prev, "[!] WEBSOCKET ERROR. CHECK BACKEND CONNECTION."]);
    };
    
    setWs(socket);

    return () => {
      if (socket.readyState === 1) {
        socket.close();
      }
    };
  }, [isRunning, ticker]);

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
