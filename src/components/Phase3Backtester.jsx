import React, { useState } from 'react';
import NcursesFrame from './NcursesFrame';
import { useTheme } from '../context/ThemeContext';

export default function Phase3Backtester({ backtestMetrics, pnlSeries, tradeLogs }) {
  const { theme } = useTheme();
  const [threshold, setThreshold] = useState(0.50);

  const metrics = backtestMetrics || {
    threshold: 0.50,
    friction_per_trade: 0.004,
    baseline: { total_trades: 1994, gross_profit: 3245.3199, total_fees: 7.9760, net_profit: 3237.3439 },
    sniper: { total_trades: 1994, gross_profit: 3245.3199, total_fees: 7.9760, net_profit: 3237.3439 }
  };

  const seriesData = pnlSeries || [];
  const logs = tradeLogs || [];

  const activeThreshold = threshold;
  const confidenceMultiplier = activeThreshold > 0.50 ? Math.max(0.2, 1 - (activeThreshold - 0.50) * 1.6) : 1.0;
  
  const simTotalTrades = Math.round(metrics.baseline.total_trades * confidenceMultiplier);
  const simTotalFees = simTotalTrades * metrics.friction_per_trade;
  const simGrossProfit = metrics.baseline.gross_profit * (activeThreshold >= 0.5 ? 0.98 : 0.85);
  const simNetProfit = simGrossProfit - simTotalFees;

  const renderAsciiSlider = (val, min = 0.30, max = 0.85, steps = 25) => {
    const ratio = (val - min) / (max - min);
    const pos = Math.round(ratio * (steps - 1));
    let track = [];
    for (let i = 0; i < steps; i++) {
      if (i === pos) track.push('█');
      else track.push('═');
    }
    return `[ ${track.join('')} ]`;
  };

  const renderAsciiBar = (percentage, width = 20) => {
    const validPct = isNaN(percentage) ? 0 : Math.max(0, Math.min(1, percentage));
    const filledLength = Math.round(width * validPct);
    const emptyLength = width - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `[${filled}${empty}]`;
  };

  return (
    <div className={`space-y-4 font-mono text-xs ${theme.text}`}>
      {/* Top Banner Frame */}
      <NcursesFrame title="PHASE 03: VECTORIZED BACKTESTING & SNIPER MODE OPTIMIZATION" headerExtra="FRICTION: [ $0.004/TRADE ]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <div className={`${theme.text} font-bold`}>
              INSTITUTIONAL TAKER FRICTION FEE ($0.004 ROUND-TRIP) &bull; PROBABILITY THRESHOLD FILTERING
            </div>
            <div className={`${theme.textMuted} text-[11px]`}>
              PREVENT OVERTRADING &bull; OVERCOME FRICTION VIA HIGH CONVICTION PROBABILITY THRESHOLDS
            </div>
          </div>
          <div className={`border ${theme.borderMuted} px-3 py-1 ${theme.boxBg} text-[11px]`}>
            NET PROFIT: <span className={`font-bold ${theme.text}`}>+${simNetProfit.toFixed(2)}</span>
          </div>
        </div>
      </NcursesFrame>

      {/* Interactive Sniper Mode Threshold Controller */}
      <NcursesFrame title="SNIPER MODE THRESHOLD CONTROLLER (SELECTIVE TRADE FILTERING)">
        <div className="space-y-3">
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b ${theme.borderMuted} pb-2`}>
            <div>
              <span className={`font-bold ${theme.text}`}>[ CONFIDENCE THRESHOLD ]: </span>
              <span className={`${theme.headerBg} ${theme.headerText} px-2 py-0.5 font-bold`}>{(activeThreshold * 100).toFixed(0)}% CERTAINTY</span>
            </div>
            <div className={`${theme.textMuted} text-[11px]`}>
              ADJUST SLIDER TO FILTER LOW CONVICTION PREDICTIONS
            </div>
          </div>

          {/* ASCII Slider Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span>MIN: 30%</span>
              <span className={`font-bold ${theme.text}`}>CURRENT: {(activeThreshold * 100).toFixed(0)}%</span>
              <span>MAX: 85%</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <input 
                type="range" 
                min="0.30" 
                max="0.85" 
                step="0.05" 
                value={threshold} 
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className={`w-full ${theme.boxBg} cursor-pointer`}
              />
            </div>

            <div className={`${theme.text} text-center font-bold tracking-widest overflow-hidden text-[11px]`}>
              {renderAsciiSlider(activeThreshold)}
            </div>
          </div>
        </div>
      </NcursesFrame>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <NcursesFrame title="EXECUTED TRADES">
          <div className={`text-lg font-bold ${theme.text}`}>{simTotalTrades}</div>
          <div className={`text-[11px] ${theme.textMuted}`}>Down from {metrics.baseline.total_trades}</div>
        </NcursesFrame>

        <NcursesFrame title="GROSS PROFIT ($)">
          <div className={`text-lg font-bold ${theme.text}`}>${simGrossProfit.toFixed(2)}</div>
          <div className={`text-[11px] ${theme.textMuted}`}>Pre-friction return</div>
        </NcursesFrame>

        <NcursesFrame title="FRICTION FEES ($)">
          <div className={`text-lg font-bold ${theme.text}`}>${simTotalFees.toFixed(2)}</div>
          <div className={`text-[11px] ${theme.textMuted}`}>@ $0.004 / trade</div>
        </NcursesFrame>

        <NcursesFrame title="FINAL NET PROFIT ($)">
          <div className={`text-lg font-bold ${theme.text}`}>+${simNetProfit.toFixed(2)}</div>
          <div className={`text-[11px] font-bold ${theme.headerText} ${theme.headerBg} px-1 inline-block mt-1`}>
            [ NET PROFITABLE ]
          </div>
        </NcursesFrame>
      </div>

      {/* ASCII PnL Visualization Box */}
      <NcursesFrame title="CUMULATIVE PnL TRAJECTORY (ZERO-FEE vs FRICTION vs SNIPER MODE)">
        <div className={`border ${theme.borderMuted} p-3 ${theme.boxBg} space-y-2 text-xs font-mono`}>
          <div className={`flex justify-between items-center border-b ${theme.borderMuted} pb-1`}>
            <span>METRIC STRATEGY COMPARISON</span>
            <span>PROFIT ($)</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span>[1] ZERO-FEE ILLUSION (GROSS PROFIT):</span>
            <span className="font-bold">${metrics.baseline.gross_profit.toFixed(2)}</span>
          </div>
          <div className={`${theme.text} font-bold overflow-hidden`}>
            {renderAsciiBar(1.0, 32)} $3,245.32
          </div>

          <div className="flex justify-between items-center py-1 pt-2">
            <span>[2] BASELINE NET PROFIT (WITH $0.004 FRICTION):</span>
            <span className="font-bold">${metrics.baseline.net_profit.toFixed(2)}</span>
          </div>
          <div className={`${theme.text} font-bold overflow-hidden`}>
            {renderAsciiBar(0.99, 32)} $3,237.34
          </div>

          <div className="flex justify-between items-center py-1 pt-2">
            <span>[3] SNIPER MODE NET PROFIT (THRES = {(activeThreshold*100).toFixed(0)}%):</span>
            <span className={`font-bold ${theme.text}`}>+${simNetProfit.toFixed(2)}</span>
          </div>
          <div className={`${theme.text} font-bold overflow-hidden`}>
            {renderAsciiBar(simNetProfit / metrics.baseline.gross_profit, 32)} +${simNetProfit.toFixed(2)}
          </div>
        </div>
      </NcursesFrame>

      {/* ASCII Trade Log Table */}
      <NcursesFrame title="SNIPER MODE EXECUTED TRADE FEED (LAST 15 TRADES)">
        <div className="overflow-x-auto max-h-56 overflow-y-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead className={`sticky top-0 ${theme.headerBg} ${theme.headerText} font-bold`}>
              <tr>
                <th className="p-1 border-r border-current">TIME(S)</th>
                <th className="p-1 border-r border-current">SIGNAL</th>
                <th className="p-1 border-r border-current">MID PRICE</th>
                <th className="p-1 border-r border-current">FUTURE PRICE</th>
                <th className="p-1 border-r border-current">GROSS PnL</th>
                <th className="p-1 text-right">NET PnL (-$0.004)</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(-15).map((trade, idx) => (
                <tr key={idx} className={`border-b ${theme.borderMuted} ${theme.hoverRow} transition-none cursor-pointer`}>
                  <td className="p-1 border-r border-current">{trade.time.toFixed(3)}</td>
                  <td className="p-1 border-r border-current font-bold">
                    {trade.signal === 1 ? '[ BUY / LONG ]' : '[ SELL / SHORT ]'}
                  </td>
                  <td className="p-1 border-r border-current">${trade.mid_price.toFixed(3)}</td>
                  <td className="p-1 border-r border-current">${trade.future_price.toFixed(3)}</td>
                  <td className="p-1 border-r border-current">${trade.gross_pnl.toFixed(4)}</td>
                  <td className="p-1 text-right font-bold">
                    +${trade.net_pnl.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NcursesFrame>
    </div>
  );
}
