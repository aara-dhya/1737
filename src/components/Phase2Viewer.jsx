import React from 'react';
import NcursesFrame from './NcursesFrame';

export default function Phase2Viewer({ datasetSummary, featureImportances, classificationReport }) {
  const features = featureImportances || [
    { feature: 'Deep_Imbalance_Ratio', importance: 0.4617 },
    { feature: 'Imbalance_Ratio', importance: 0.4277 },
    { feature: 'Micro_Price_Delta_10', importance: 0.0874 },
    { feature: 'Deep_Imbalance_Delta_10', importance: 0.0170 },
    { feature: 'Micro_Price_Dollars', importance: 0.0055 },
    { feature: 'Spread_Dollars', importance: 0.0007 }
  ];

  // Helper function to render ASCII progress bar (e.g. [██████████░░░░░░░░░░])
  const renderAsciiBar = (percentage, width = 20) => {
    const filledLength = Math.round(width * percentage);
    const emptyLength = width - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `[${filled}${empty}]`;
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner Frame */}
      <NcursesFrame title="PHASE 02: TIME-SERIES MOMENTUM DELTAS & RANDOM FOREST" headerExtra="MODEL: [ TRAINED ]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <div className="text-green-400 font-bold">
              10-TICK BACKWARD SHIFTS &bull; STRICT CHRONOLOGICAL TRAIN/TEST SPLIT &bull; SCIKIT-LEARN RFC
            </div>
            <div className="text-green-600 text-[11px]">
              PREVENTS DATA LEAKAGE / LOOK-AHEAD BIAS &bull; NO RANDOM SHUFFLING FINISHED
            </div>
          </div>
          <div className="border border-green-400 px-3 py-1 bg-black text-[11px]">
            ESTIMATORS: <span className="font-bold text-green-400">50</span> | MAX DEPTH: <span className="font-bold">10</span> | SEED: <span className="font-bold">42</span>
          </div>
        </div>
      </NcursesFrame>

      {/* Grid: Deltas & Chronological Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deltas Explanation */}
        <NcursesFrame title="SECTION 2.1: TIME-SERIES MOMENTUM DELTAS">
          <p className="text-green-600 mb-3 text-[11px]">
            Calculated backward 10-tick shifts to measure acceleration of order book state.
          </p>
          <div className="space-y-2">
            <div className="border border-green-400 p-2 bg-black">
              <div className="font-bold text-green-400">[ Micro_Price_Delta_10 ]</div>
              <code className="text-green-600 text-[11px]">Micro_Price_Dollars - Micro_Price_Dollars.shift(10)</code>
            </div>
            <div className="border border-green-400 p-2 bg-black">
              <div className="font-bold text-green-400">[ Deep_Imbalance_Delta_10 ]</div>
              <code className="text-green-600 text-[11px]">Deep_Imbalance_Ratio - Deep_Imbalance_Ratio.shift(10)</code>
            </div>
          </div>
        </NcursesFrame>

        {/* Chronological Split Diagram */}
        <NcursesFrame title="SECTION 2.2: STRICT CHRONOLOGICAL SPLIT">
          <p className="text-green-600 mb-3 text-[11px]">
            Strict 80% Morning / Mid-day training set and 20% Afternoon unseen test set.
          </p>
          <div className="border border-green-400 p-3 bg-black space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span>TRAIN SET (MORNING 80%):</span>
              <span className="font-bold">{datasetSummary?.phase2_train_rows || 7976} ROWS</span>
            </div>
            <div className="text-green-400 font-bold tracking-tighter overflow-hidden whitespace-nowrap">
              {renderAsciiBar(0.8, 30)} 80%
            </div>
            <div className="flex justify-between items-center text-[11px] pt-1">
              <span>TEST SET (AFTERNOON 20%):</span>
              <span className="font-bold">{datasetSummary?.phase2_test_rows || 1994} ROWS</span>
            </div>
            <div className="text-green-600 font-bold tracking-tighter overflow-hidden whitespace-nowrap">
              {renderAsciiBar(0.2, 30)} 20%
            </div>
          </div>
        </NcursesFrame>
      </div>

      {/* Grid: Feature Importances & Classification Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Feature Importances ASCII Bar List */}
        <NcursesFrame title="MODEL FEATURE IMPORTANCE HIERARCHY (SORTED DESCENDING)">
          <div className="space-y-3 font-mono text-xs">
            {features.map((item, idx) => (
              <div key={idx} className="border-b border-green-900 pb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-green-400">#{idx + 1} {item.feature}</span>
                  <span className="font-bold">{(item.importance * 100).toFixed(2)}%</span>
                </div>
                <div className="text-green-400 tracking-wider">
                  {renderAsciiBar(item.importance, 28)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-green-600">
            * Order book depth imbalance features account for &gt;85% total predictive power.
          </div>
        </NcursesFrame>

        {/* Classification Report Box */}
        <NcursesFrame title="SCIKIT-LEARN CLASSIFICATION REPORT (AFTERNOON TEST SET)">
          <div className="border border-green-400 p-3 bg-black text-green-400 font-mono overflow-x-auto">
            <pre className="text-xs whitespace-pre">{classificationReport || `              precision    recall  f1-score   support

   Down (-1)       1.00      0.99      1.00      1088
    Flat (0)       0.00      0.00      0.00         0
      Up (1)       0.99      1.00      1.00       906

    accuracy                           1.00      1994
   macro avg       0.66      0.66      0.66      1994
weighted avg       1.00      1.00      1.00      1994`}</pre>
          </div>
          <div className="mt-3 border border-green-400 p-2 text-[11px] text-green-400 text-center font-bold uppercase">
            [ STATUS: MODEL FITTED & VECTORIZED BACKTEST READY ]
          </div>
        </NcursesFrame>
      </div>
    </div>
  );
}
