import React from 'react';
import NcursesFrame from './NcursesFrame';

export default function Phase1Viewer({ datasetSummary }) {
  const sampleLOBRows = [
    { time: 34200.012, raw_ask_1: 1750500, ask_1: 175.05, raw_bid_1: 1750300, bid_1: 175.03, spread: 0.02, micro: 175.041, imbalance: 0.25, deep_imbalance: 0.18, target: 1 },
    { time: 34200.065, raw_ask_1: 1750600, ask_1: 175.06, raw_bid_1: 1750400, bid_1: 175.04, spread: 0.02, micro: 175.049, imbalance: -0.15, deep_imbalance: -0.05, target: 1 },
    { time: 34200.118, raw_ask_1: 1750800, ask_1: 175.08, raw_bid_1: 1750600, bid_1: 175.06, spread: 0.02, micro: 175.072, imbalance: 0.40, deep_imbalance: 0.32, target: 1 },
    { time: 34200.180, raw_ask_1: 1750700, ask_1: 175.07, raw_bid_1: 1750500, bid_1: 175.05, spread: 0.02, micro: 175.055, imbalance: -0.30, deep_imbalance: -0.22, target: -1 },
    { time: 34200.235, raw_ask_1: 1750500, ask_1: 175.05, raw_bid_1: 1750300, bid_1: 175.03, spread: 0.02, micro: 175.038, imbalance: -0.50, deep_imbalance: -0.45, target: -1 },
    { time: 34200.290, raw_ask_1: 1750400, ask_1: 175.04, raw_bid_1: 1750200, bid_1: 175.02, spread: 0.02, micro: 175.028, imbalance: -0.60, deep_imbalance: -0.55, target: -1 },
  ];

  return (
    <div className="space-y-4 font-mono text-xs text-[#B984DF]">
      {/* Top Banner Frame */}
      <NcursesFrame title="PHASE 01: DATA INGESTION & MICRO-STRUCTURE ENGINEERING" headerExtra="STATUS: [ OK ]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <div className="text-[#B984DF] font-bold">
              POLARS VECTORIZED PIPELINE &bull; LOBSTER 10-LEVEL SNAPSHOT &bull; 20-TICK HORIZON
            </div>
            <div className="text-[#C095E4] text-[11px]">
              CRUCIAL PRE-PROCESSING: READ CSV ───► DIVIDE ALL PRICE COLS BY 10,000.0 ───► DROP SHIFT TRAILING NULLS
            </div>
          </div>
          <div className="border border-[#C095E4] px-3 py-1 bg-[#FFD1D4] text-[#B984DF] text-[11px]">
            SYMBOL: <span className="font-bold text-[#B984DF]">{datasetSummary?.symbol || 'AAPL'}</span> | PARQUET ROWS: <span className="font-bold">{datasetSummary?.phase1_parquet_rows || 9980}</span>
          </div>
        </div>
      </NcursesFrame>

      {/* Feature Formula Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <NcursesFrame title="FORMULA #1: SPREAD">
          <div className="text-[#B984DF] font-bold mb-1">[ Spread_Dollars ]</div>
          <p className="text-[#C095E4] text-[11px] mb-2">Immediate cost of taking liquidity.</p>
          <div className="border border-[#C095E4] p-1.5 bg-[#FFD1D4] text-[#B984DF] font-mono">
            Ask_Price_1 - Bid_Price_1
          </div>
        </NcursesFrame>

        <NcursesFrame title="FORMULA #2: MICRO PRICE">
          <div className="text-[#B984DF] font-bold mb-1">[ Micro_Price_Dollars ]</div>
          <p className="text-[#C095E4] text-[11px] mb-2">Volume-weighted front-line price.</p>
          <div className="border border-[#C095E4] p-1.5 bg-[#FFD1D4] text-[#B984DF] font-mono truncate">
            (BidP1*AskV1 + AskP1*BidV1) / Vol
          </div>
        </NcursesFrame>

        <NcursesFrame title="FORMULA #3: IMBALANCE">
          <div className="text-[#B984DF] font-bold mb-1">[ Imbalance_Ratio ]</div>
          <p className="text-[#C095E4] text-[11px] mb-2">Front-line buying/selling pressure.</p>
          <div className="border border-[#C095E4] p-1.5 bg-[#FFD1D4] text-[#B984DF] font-mono truncate">
            (BidV1 - AskV1) / (BidV1 + AskV1)
          </div>
        </NcursesFrame>

        <NcursesFrame title="FORMULA #4: DEEP IMBALANCE">
          <div className="text-[#B984DF] font-bold mb-1">[ Deep_Imbalance_Ratio ]</div>
          <p className="text-[#C095E4] text-[11px] mb-2">Macro health across 10 levels.</p>
          <div className="border border-[#C095E4] p-1.5 bg-[#FFD1D4] text-[#B984DF] font-mono truncate">
            (Sum(BidV1..10) - Sum(AskV1..10))/Tot
          </div>
        </NcursesFrame>
      </div>

      {/* ASCII LOB Data Table */}
      <NcursesFrame title="LOBSTER RAW DATA vs SCALED POLARS FEATURE MATRIX">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#B984DF] text-[#FCEDF2] font-bold border-b border-[#B984DF]">
                <th className="p-1 border-r border-[#C095E4]">TIME(S)</th>
                <th className="p-1 border-r border-[#C095E4]">RAW ASK1</th>
                <th className="p-1 border-r border-[#C095E4]">ASK1 ($)</th>
                <th className="p-1 border-r border-[#C095E4]">RAW BID1</th>
                <th className="p-1 border-r border-[#C095E4]">BID1 ($)</th>
                <th className="p-1 border-r border-[#C095E4]">SPREAD</th>
                <th className="p-1 border-r border-[#C095E4]">MICRO PRICE</th>
                <th className="p-1 border-r border-[#C095E4]">IMBALANCE</th>
                <th className="p-1 border-r border-[#C095E4]">DEEP IMBALANCE</th>
                <th className="p-1 text-center">TARGET (20-TICK)</th>
              </tr>
            </thead>
            <tbody>
              {sampleLOBRows.map((row, idx) => (
                <tr key={idx} className="border-b border-[#FFB7C5] hover:bg-[#FFA0C5] hover:text-[#FCEDF2] transition-none cursor-pointer">
                  <td className="p-1 border-r border-[#FFB7C5]">{row.time.toFixed(3)}</td>
                  <td className="p-1 border-r border-[#FFB7C5]">{row.raw_ask_1}</td>
                  <td className="p-1 border-r border-[#FFB7C5] font-bold">${row.ask_1.toFixed(2)}</td>
                  <td className="p-1 border-r border-[#FFB7C5]">{row.raw_bid_1}</td>
                  <td className="p-1 border-r border-[#FFB7C5] font-bold">${row.bid_1.toFixed(2)}</td>
                  <td className="p-1 border-r border-[#FFB7C5]">${row.spread.toFixed(2)}</td>
                  <td className="p-1 border-r border-[#FFB7C5]">${row.micro.toFixed(3)}</td>
                  <td className="p-1 border-r border-[#FFB7C5]">
                    {row.imbalance >= 0 ? `+${row.imbalance.toFixed(2)}` : row.imbalance.toFixed(2)}
                  </td>
                  <td className="p-1 border-r border-[#FFB7C5]">
                    {row.deep_imbalance >= 0 ? `+${row.deep_imbalance.toFixed(2)}` : row.deep_imbalance.toFixed(2)}
                  </td>
                  <td className="p-1 text-center font-bold">
                    {row.target === 1 ? '[ UP (+1) ]' : '[ DOWN (-1) ]'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 border-t border-[#FFB7C5] pt-2 text-[11px] text-[#C095E4]">
          <span className="font-bold text-[#B984DF]">VERIFICATION:</span> Vectorized target direction generated via <code className="bg-[#FFD1D4] text-[#B984DF] px-1">pl.col().shift(-20)</code>. Exported to <code className="text-[#B984DF]">data/AAPL_engineered_features.parquet</code>.
        </div>
      </NcursesFrame>
    </div>
  );
}
