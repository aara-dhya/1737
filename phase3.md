## Project Context
You have successfully engineered order book features, implemented momentum deltas, and trained a Random Forest classifier in Polars and Scikit-Learn without look-ahead bias. 

This file governs Phase 3: Vectorized Backtesting, Institutional Transaction Costs, and Strategy Optimization (Sniper Mode). High classification accuracy does not guarantee profitability. You must simulate realistic market conditions to validate the model's economic viability.

## 1. The Theoretical Baseline Backtest (The Zero-Fee Illusion)
Before optimizing, we must prove the model's baseline predictions are unprofitable under real-world friction. 

1.  **Map Predictions:** Append the raw `1`, `-1`, and `0` predictions from the `.predict()` function in Phase 2 onto the `df_test` Polars DataFrame as a new column named `Prediction`.
2.  **Calculate Trade Logic (Vectorized):**
    *   Create a `Trade_Profit` column.
    *   Multiply the `Prediction` array by the actual price delta: `(Future_Mid_Price - Mid_Price_Dollars)`.
    *   *Logic check:* A `-1` prediction (Short) multiplied by a negative price drop yields a positive dollar profit. A `0` prediction yields `$0`.
3.  **Calculate Cumulative Bankroll:** Create a `Cumulative_Profit` column using `.cum_sum()` on `Trade_Profit`.
4.  **Introduce Institutional Friction:** Create a `Net_Trade_Profit` column. A standard HFT taker fee is `$0.002` per share. Every executed trade requires a round-trip (entry and exit).
    *   Define `friction_per_trade = 0.004`.
    *   Subtract `friction_per_trade` from `Trade_Profit` *only* on rows where `Prediction != 0`.
5.  **Calculate Net Bankroll:** Create `Cumulative_Net_Profit` using `.cum_sum()` on `Net_Trade_Profit`. Print the Baseline Total Trades, Gross Profit, Total Fees Paid, and Net Profit. The Net Profit will be deeply negative due to over-trading.

## 2. Strategy Optimization: Sniper Mode
To transition the strategy to net-positive profitability, you must implement a "Sniper Mode" that filters out low-conviction signals. The AI must only pay the taker fee when it has a high statistical probability of success.

1.  **Extract Probabilities:** Do not use `.predict()`. Instead, use `rf_model.predict_proba(X_test)` to extract the raw confidence array.
    *   Column index `0` represents the probability of a Down (`-1`) move.
    *   Column index `2` represents the probability of an Up (`1`) move.
2.  **Define Threshold:** Set a strict confidence threshold of `0.50` (50% certainty).
3.  **Construct Disciplined Array:** Initialize an array of zeros (defaulting to Flat/No-Trade).
    *   Update index to `1` where `prob_up > threshold`.
    *   Update index to `-1` where `prob_down > threshold`.
4.  **Inject and Re-run:** Append this new array to `df_test` as `Disciplined_Prediction`.

## 3. The Institutional Backtest (Sniper Run)
Re-run the exact vectorized PnL and friction calculations from Section 1, but this time use the `Disciplined_Prediction` column.

1.  **Calculate Disciplined Metrics:**
    *   `Disciplined_Trade_Profit`
    *   `Disciplined_Net_Profit` (subtracting the `$0.004` friction only when a trade executes).
2.  **Final Output Requirements:** 
    *   Print the chosen Threshold.
    *   Print the new `Total Trades Executed`. Explicitly show the reduction (e.g., "Down from X").
    *   Print the new `Total Fees Paid`.
    *   Print the final `Net Profit`. This number must now be positive, proving the effectiveness of probability thresholds in overcoming exchange friction.

## 4. Version Control
*   You must adhere strictly to the Conventional Commits specification.
*   When this phase is implemented, the commit message must be formatted exactly as: `feat(backtest): implement probability thresholds to filter low-confidence trades and achieve positive net pnl`