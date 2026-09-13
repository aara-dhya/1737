import React from 'react';
import { Cpu, TrendingUp, BarChart2, ShieldAlert, CheckCircle, Split } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function Phase2Viewer({ datasetSummary, featureImportances, classificationReport }) {
  const features = featureImportances || [
    { feature: 'Deep_Imbalance_Ratio', importance: 0.4617 },
    { feature: 'Imbalance_Ratio', importance: 0.4277 },
    { feature: 'Micro_Price_Delta_10', importance: 0.0874 },
    { feature: 'Deep_Imbalance_Delta_10', importance: 0.0170 },
    { feature: 'Micro_Price_Dollars', importance: 0.0055 },
    { feature: 'Spread_Dollars', importance: 0.0007 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-brutal shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black border-2 border-pastel">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-pastel text-black font-bold px-2 py-0.5 text-xs uppercase">PHASE 02</span>
            <h2 className="text-xl font-bold text-white tracking-wider">MOMENTUM DELTAS & CHRONOLOGICAL RANDOM FOREST</h2>
          </div>
          <p className="text-muted-gray text-xs mt-1">
            TIME-SERIES 10-TICK DELTAS &bull; NO LOOK-AHEAD DATA LEAKAGE &bull; 80% MORNING TRAIN / 20% AFTERNOON TEST
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono border border-zinc-800 p-2 bg-zinc-950">
          <div>
            <div className="text-muted-gray">ESTIMATORS</div>
            <div className="text-pastel font-bold">50 TREES</div>
          </div>
          <div className="border-r border-zinc-800 h-6"></div>
          <div>
            <div className="text-muted-gray">MAX DEPTH</div>
            <div className="text-white font-bold">10</div>
          </div>
          <div className="border-r border-zinc-800 h-6"></div>
          <div>
            <div className="text-muted-gray">RANDOM STATE</div>
            <div className="text-pastel font-bold">42</div>
          </div>
        </div>
      </div>

      {/* Chronological Split & Deltas Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deltas Explanation Card */}
        <div className="card-brutal border border-zinc-800">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-pastel" />
            <h3 className="font-bold text-white text-sm uppercase">1. Time-Series Momentum Deltas</h3>
          </div>
          <p className="text-xs text-muted-gray mb-4">
            Order book velocity is highly predictive. Backward 10-tick shifts measure order book acceleration.
          </p>
          <div className="space-y-2 font-mono text-xs">
            <div className="bg-zinc-950 border border-zinc-800 p-3">
              <span className="text-pastel font-bold block mb-1">Micro_Price_Delta_10</span>
              <code className="text-zinc-400">Micro_Price_Dollars - Micro_Price_Dollars.shift(10)</code>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-3">
              <span className="text-pastel font-bold block mb-1">Deep_Imbalance_Delta_10</span>
              <code className="text-zinc-400">Deep_Imbalance_Ratio - Deep_Imbalance_Ratio.shift(10)</code>
            </div>
          </div>
        </div>

        {/* Chronological Split Guarantee */}
        <div className="card-brutal border border-zinc-800">
          <div className="flex items-center space-x-2 mb-3">
            <Split className="w-4 h-4 text-pastel" />
            <h3 className="font-bold text-white text-sm uppercase">2. Strict Chronological Split</h3>
          </div>
          <p className="text-xs text-muted-gray mb-4">
            No random shuffle! Random shuffling financial time-series causes look-ahead bias and data leakage.
          </p>

          <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white">Training Set (Morning/Mid-day):</span>
              <span className="text-pastel font-bold">80% ({datasetSummary?.phase2_train_rows || 7976} rows)</span>
            </div>
            <div className="w-full bg-zinc-800 h-2">
              <div className="bg-pastel h-2 w-[80%]"></div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-white">Testing Set (Afternoon Unseen):</span>
              <span className="text-zinc-400 font-bold">20% ({datasetSummary?.phase2_test_rows || 1994} rows)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importances Chart & Classification Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Chart */}
        <div className="card-brutal border border-pastel">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-pastel" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Model Feature Importance Hierarchy
              </h3>
            </div>
            <span className="text-xs text-pastel font-mono font-bold">Scikit-Learn RFC</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={features} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis type="number" stroke="#A0A0A0" tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                <YAxis dataKey="feature" type="category" stroke="#FFFFFF" tick={{ fontSize: 11, fontFamily: 'monospace' }} width={140} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', border: '1px solid #77DD77', borderRadius: '0px', color: '#FFFFFF' }} 
                  formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'Importance']}
                />
                <Bar dataKey="importance" fill="#77DD77">
                  {features.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#77DD77' : index === 1 ? '#61D095' : index < 4 ? '#38A368' : '#225533'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 text-xs font-mono text-muted-gray">
            <span className="text-pastel font-bold">INSIGHT:</span> Order book depth imbalance (<code className="text-white">Deep_Imbalance_Ratio</code> & <code className="text-white">Imbalance_Ratio</code>) accounts for over 85% of total predictive power.
          </div>
        </div>

        {/* Classification Report Console */}
        <div className="card-brutal border border-zinc-800">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-pastel" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Classification Report (Afternoon Test Set)
              </h3>
            </div>
            <span className="text-xs bg-pastel text-black px-2 py-0.5 font-bold">100% ACCURACY</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-pastel overflow-x-auto">
            <pre className="whitespace-pre">{classificationReport || `              precision    recall  f1-score   support

   Down (-1)       1.00      0.99      1.00      1088
    Flat (0)       0.00      0.00      0.00         0
      Up (1)       0.99      1.00      1.00       906

    accuracy                           1.00      1994
   macro avg       0.66      0.66      0.66      1994
weighted avg       1.00      1.00      1.00      1994`}</pre>
          </div>

          <div className="mt-4 flex items-center space-x-2 text-xs text-pastel font-mono">
            <CheckCircle className="w-4 h-4 text-pastel" />
            <span>MODEL WEIGHTS EXTRACTED & READY FOR PHASE 3 BACKTESTING</span>
          </div>
        </div>
      </div>
    </div>
  );
}
