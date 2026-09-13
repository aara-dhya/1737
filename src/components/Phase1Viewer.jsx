import React, { useState } from 'react';
import { Database, ArrowRight, Layers, DollarSign, Activity, HelpCircle } from 'lucide-react';

export default function Phase1Viewer({ datasetSummary }) {
  const [activeTab, setActiveTab] = useState('features');

  // Sample LOBSTER raw vs scaled preview rows
  const sampleLOBRows = [
    { time: 34200.012, raw_ask_1: 1750500, ask_1: 175.05, raw_bid_1: 1750300, bid_1: 175.03, spread: 0.02, micro: 175.041, imbalance: 0.25, deep_imbalance: 0.18, target: 1 },
    { time: 34200.065, raw_ask_1: 1750600, ask_1: 175.06, raw_bid_1: 1750400, bid_1: 175.04, spread: 0.02, micro: 175.049, imbalance: -0.15, deep_imbalance: -0.05, target: 1 },
    { time: 34200.118, raw_ask_1: 1750800, ask_1: 175.08, raw_bid_1: 1750600, bid_1: 175.06, spread: 0.02, micro: 175.072, imbalance: 0.40, deep_imbalance: 0.32, target: 1 },
    { time: 34200.180, raw_ask_1: 1750700, ask_1: 175.07, raw_bid_1: 1750500, bid_1: 175.05, spread: 0.02, micro: 175.055, imbalance: -0.30, deep_imbalance: -0.22, target: -1 },
    { time: 34200.235, raw_ask_1: 1750500, ask_1: 175.05, raw_bid_1: 1750300, bid_1: 175.03, spread: 0.02, micro: 175.038, imbalance: -0.50, deep_imbalance: -0.45, target: -1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-brutal shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black border-2 border-pastel">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-pastel text-black font-bold px-2 py-0.5 text-xs uppercase">PHASE 01</span>
            <h2 className="text-xl font-bold text-white tracking-wider">DATA INGESTION & MICRO-STRUCTURE ENGINEERING</h2>
          </div>
          <p className="text-muted-gray text-xs mt-1">
            VECTORIZED POLARS PROCESSING &bull; LOBSTER 10-LEVEL DEPTH &bull; 20-TICK TARGET HORIZON
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono border border-zinc-800 p-2 bg-zinc-950">
          <div>
            <div className="text-muted-gray">SYMBOL</div>
            <div className="text-pastel font-bold">{datasetSummary?.symbol || 'AAPL'}</div>
          </div>
          <div className="border-r border-zinc-800 h-6"></div>
          <div>
            <div className="text-muted-gray">PARQUET ROWS</div>
            <div className="text-white font-bold">{datasetSummary?.phase1_parquet_rows || 9980}</div>
          </div>
          <div className="border-r border-zinc-800 h-6"></div>
          <div>
            <div className="text-muted-gray">STATUS</div>
            <div className="text-pastel font-bold flex items-center">
              <span className="w-2 h-2 bg-pastel rounded-none inline-block mr-1"></span> EXPORTED
            </div>
          </div>
        </div>
      </div>

      {/* Feature Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Formula Card 1 */}
        <div className="card-brutal border border-zinc-800 hover:border-pastel transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-pastel font-bold uppercase">Metric #01</span>
            <Activity className="w-4 h-4 text-pastel" />
          </div>
          <h3 className="font-bold text-white mb-1">Spread_Dollars</h3>
          <p className="text-xs text-muted-gray mb-3">Immediate cost of taking liquidity at Level 1.</p>
          <div className="bg-zinc-950 border border-zinc-800 p-2 text-xs font-mono text-pastel">
            Ask_Price_1 - Bid_Price_1
          </div>
        </div>

        {/* Formula Card 2 */}
        <div className="card-brutal border border-zinc-800 hover:border-pastel transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-pastel font-bold uppercase">Metric #02</span>
            <DollarSign className="w-4 h-4 text-pastel" />
          </div>
          <h3 className="font-bold text-white mb-1">Micro_Price_Dollars</h3>
          <p className="text-xs text-muted-gray mb-3">Volume-weighted front-line mid-price.</p>
          <div className="bg-zinc-950 border border-zinc-800 p-2 text-xs font-mono text-pastel truncate">
            (BidP1*AskV1 + AskP1*BidV1) / (BidV1 + AskV1)
          </div>
        </div>

        {/* Formula Card 3 */}
        <div className="card-brutal border border-zinc-800 hover:border-pastel transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-pastel font-bold uppercase">Metric #03</span>
            <Layers className="w-4 h-4 text-pastel" />
          </div>
          <h3 className="font-bold text-white mb-1">Imbalance_Ratio</h3>
          <p className="text-xs text-muted-gray mb-3">Normalized front-line volume pressure.</p>
          <div className="bg-zinc-950 border border-zinc-800 p-2 text-xs font-mono text-pastel truncate">
            (BidV1 - AskV1) / (BidV1 + AskV1)
          </div>
        </div>

        {/* Formula Card 4 */}
        <div className="card-brutal border border-zinc-800 hover:border-pastel transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-pastel font-bold uppercase">Metric #04</span>
            <Database className="w-4 h-4 text-pastel" />
          </div>
          <h3 className="font-bold text-white mb-1">Deep_Imbalance_Ratio</h3>
          <p className="text-xs text-muted-gray mb-3">Macro health across all 10 order book levels.</p>
          <div className="bg-zinc-950 border border-zinc-800 p-2 text-xs font-mono text-pastel truncate">
            (Sum(BidV1..10) - Sum(AskV1..10)) / Total
          </div>
        </div>
      </div>

      {/* LOB Data Table Section */}
      <div className="card-brutal border border-pastel">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-pastel" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              LOBSTER Data Normalization & Feature Output Matrix
            </h3>
          </div>
          <span className="text-xs text-muted-gray font-mono">Pre-processed: Prices / 10,000.0</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-pastel border-b border-zinc-800">
                <th className="p-2 border-r border-zinc-800">TIME (SEC)</th>
                <th className="p-2 border-r border-zinc-800">RAW ASK 1</th>
                <th className="p-2 border-r border-zinc-800">ASK 1 ($)</th>
                <th className="p-2 border-r border-zinc-800">RAW BID 1</th>
                <th className="p-2 border-r border-zinc-800">BID 1 ($)</th>
                <th className="p-2 border-r border-zinc-800">SPREAD ($)</th>
                <th className="p-2 border-r border-zinc-800">MICRO PRICE ($)</th>
                <th className="p-2 border-r border-zinc-800">L1 IMBALANCE</th>
                <th className="p-2 border-r border-zinc-800">DEEP IMBALANCE</th>
                <th className="p-2 text-center">TARGET (20-TICK)</th>
              </tr>
            </thead>
            <tbody>
              {sampleLOBRows.map((row, idx) => (
                <tr key={idx} className="border-b border-zinc-900 hover:bg-zinc-950 transition-colors">
                  <td className="p-2 border-r border-zinc-900 text-zinc-400">{row.time.toFixed(3)}</td>
                  <td className="p-2 border-r border-zinc-900 text-zinc-500">{row.raw_ask_1}</td>
                  <td className="p-2 border-r border-zinc-900 text-red-400 font-bold">${row.ask_1.toFixed(2)}</td>
                  <td className="p-2 border-r border-zinc-900 text-zinc-500">{row.raw_bid_1}</td>
                  <td className="p-2 border-r border-zinc-900 text-pastel font-bold">${row.bid_1.toFixed(2)}</td>
                  <td className="p-2 border-r border-zinc-900 text-white">${row.spread.toFixed(2)}</td>
                  <td className="p-2 border-r border-zinc-900 text-pastel">${row.micro.toFixed(3)}</td>
                  <td className="p-2 border-r border-zinc-900">
                    <span className={row.imbalance >= 0 ? "text-pastel" : "text-red-400"}>
                      {row.imbalance > 0 ? `+${row.imbalance.toFixed(2)}` : row.imbalance.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-2 border-r border-zinc-900">
                    <span className={row.deep_imbalance >= 0 ? "text-pastel" : "text-red-400"}>
                      {row.deep_imbalance > 0 ? `+${row.deep_imbalance.toFixed(2)}` : row.deep_imbalance.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-2 text-center font-bold">
                    {row.target === 1 ? (
                      <span className="bg-pastel text-black px-2 py-0.5 text-[10px]">UP (+1)</span>
                    ) : (
                      <span className="bg-red-500 text-black px-2 py-0.5 text-[10px]">DOWN (-1)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 flex items-start space-x-2 text-xs text-muted-gray">
          <HelpCircle className="w-4 h-4 text-pastel shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">POLARS EXPORT VERIFICATION:</strong> Target direction is generated by looking 20 ticks into the future via <code className="text-pastel font-mono">pl.col().shift(-20)</code>. 20 trailing null rows were sanitized with <code className="text-pastel font-mono">.drop_nulls()</code> before writing to <code className="text-white">data/AAPL_engineered_features.parquet</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
