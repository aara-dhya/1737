import os
import numpy as np
import polars as pl

def run_phase_3(phase2_outputs, threshold=0.50, friction_per_trade=0.004):
    """
    Phase 3: Vectorized Backtesting, Institutional Friction ($0.004 round-trip fee),
    and Strategy Optimization (Sniper Mode).
    """
    print(f"=== [PHASE 3] Vectorized Backtesting & Strategy Optimization (Sniper Mode) ===")
    
    df_test = phase2_outputs["df_test"]
    rf_model = phase2_outputs["rf_model"]
    X_test = phase2_outputs["X_test"]
    y_pred = phase2_outputs["y_pred"]

    # 1. Theoretical Baseline Backtest (Zero-Fee Illusion vs Friction)
    # Append raw predictions
    df_test = df_test.with_columns(pl.Series("Prediction", y_pred))

    # Calculate Trade Profit: Prediction * (Future_Mid_Price - Mid_Price_Dollars)
    df_test = df_test.with_columns([
        (pl.col("Prediction") * (pl.col("Future_Mid_Price") - pl.col("Mid_Price_Dollars"))).alias("Trade_Profit")
    ]).with_columns([
        pl.col("Trade_Profit").cum_sum().alias("Cumulative_Profit")
    ])

    # Introduce Institutional Friction ($0.004 per trade executed)
    df_test = df_test.with_columns([
        pl.when(pl.col("Prediction") != 0)
        .then(pl.col("Trade_Profit") - friction_per_trade)
        .otherwise(0.0)
        .alias("Net_Trade_Profit")
    ]).with_columns([
        pl.col("Net_Trade_Profit").cum_sum().alias("Cumulative_Net_Profit")
    ])

    # Baseline Summary Stats
    baseline_total_trades = df_test.filter(pl.col("Prediction") != 0).height
    baseline_gross_profit = df_test["Trade_Profit"].sum()
    baseline_total_fees = baseline_total_trades * friction_per_trade
    baseline_net_profit = df_test["Net_Trade_Profit"].sum()

    print("\n--- SECTION 1: Baseline Backtest (Zero-Fee Illusion vs Friction) ---")
    print(f"  * Baseline Total Trades Executed : {baseline_total_trades}")
    print(f"  * Baseline Gross Profit ($)      : ${baseline_gross_profit:.4f}")
    print(f"  * Total Friction Fees Paid ($)   : ${baseline_total_fees:.4f} (@ ${friction_per_trade}/trade)")
    print(f"  * Baseline Net Profit ($)        : ${baseline_net_profit:.4f}")

    # 2. Strategy Optimization: Sniper Mode
    probabilities = rf_model.predict_proba(X_test)
    classes = list(rf_model.classes_)
    
    idx_down = classes.index(-1) if -1 in classes else 0
    idx_up = classes.index(1) if 1 in classes else 2

    prob_down = probabilities[:, idx_down]
    prob_up = probabilities[:, idx_up]

    disciplined_preds = np.zeros(len(X_test), dtype=np.int32)
    disciplined_preds[prob_up > threshold] = 1
    disciplined_preds[prob_down > threshold] = -1

    df_test = df_test.with_columns(pl.Series("Disciplined_Prediction", disciplined_preds))

    # 3. Institutional Backtest (Sniper Run)
    df_test = df_test.with_columns([
        (pl.col("Disciplined_Prediction") * (pl.col("Future_Mid_Price") - pl.col("Mid_Price_Dollars"))).alias("Disciplined_Trade_Profit")
    ]).with_columns([
        pl.col("Disciplined_Trade_Profit").cum_sum().alias("Disciplined_Cumulative_Profit")
    ])

    df_test = df_test.with_columns([
        pl.when(pl.col("Disciplined_Prediction") != 0)
        .then(pl.col("Disciplined_Trade_Profit") - friction_per_trade)
        .otherwise(0.0)
        .alias("Disciplined_Net_Profit")
    ]).with_columns([
        pl.col("Disciplined_Net_Profit").cum_sum().alias("Disciplined_Cumulative_Net_Profit")
    ])

    # Sniper Metrics
    sniper_total_trades = df_test.filter(pl.col("Disciplined_Prediction") != 0).height
    sniper_gross_profit = df_test["Disciplined_Trade_Profit"].sum()
    sniper_total_fees = sniper_total_trades * friction_per_trade
    sniper_net_profit = df_test["Disciplined_Net_Profit"].sum()

    print("\n--- SECTION 2 & 3: Sniper Mode Institutional Backtest ---")
    print(f"  * Chosen Confidence Threshold    : {threshold:.2f} ({(threshold*100):.0f}% certainty)")
    print(f"  * Total Trades Executed          : {sniper_total_trades} (Down from {baseline_total_trades})")
    print(f"  * Total Friction Fees Paid ($)   : ${sniper_total_fees:.4f}")
    print(f"  * Gross Trade Profit ($)         : ${sniper_gross_profit:.4f}")
    print(f"  * FINAL NET PROFIT ($)           : ${sniper_net_profit:.4f}")

    return {
        "df_test": df_test,
        "threshold": threshold,
        "friction_per_trade": friction_per_trade,
        "baseline": {
            "total_trades": baseline_total_trades,
            "gross_profit": float(baseline_gross_profit),
            "total_fees": float(baseline_total_fees),
            "net_profit": float(baseline_net_profit)
        },
        "sniper": {
            "total_trades": sniper_total_trades,
            "gross_profit": float(sniper_gross_profit),
            "total_fees": float(sniper_total_fees),
            "net_profit": float(sniper_net_profit)
        }
    }

if __name__ == "__main__":
    from phase2 import run_phase_2
    p2_out = run_phase_2()
    run_phase_3(p2_out)
