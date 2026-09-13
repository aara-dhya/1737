import os
import polars as pl
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

def run_phase_2(parquet_path="data/AAPL_engineered_features.parquet"):
    """
    Phase 2: Time-Series Momentum Engineering, Strict Chronological Splitting,
    and Predictive Modeling using Scikit-Learn.
    """
    print(f"=== [PHASE 2] Time-Series Momentum Engineering & Model Training ===")
    
    if not os.path.exists(parquet_path):
        raise FileNotFoundError(f"Parquet file '{parquet_path}' does not exist. Run Phase 1 first.")

    # 1. Ingestion & Momentum Engineering
    df = pl.read_parquet(parquet_path)
    print(f"[+] Loaded Parquet dataset: {df.height} rows.")

    # Calculate Deltas (shift 10 ticks backward)
    df = df.with_columns([
        (pl.col("Micro_Price_Dollars") - pl.col("Micro_Price_Dollars").shift(10)).alias("Micro_Price_Delta_10"),
        (pl.col("Deep_Imbalance_Ratio") - pl.col("Deep_Imbalance_Ratio").shift(10)).alias("Deep_Imbalance_Delta_10"),
    ])

    # Sanitization: drop_nulls() immediately after feature creation
    initial_rows = df.height
    df = df.drop_nulls()
    print(f"[+] Dropped {initial_rows - df.height} null rows introduced by 10-tick backward shift.")

    # 2. Strict Chronological Train/Test Split (80% Train, 20% Test)
    split_idx = int(df.height * 0.8)
    df_train = df.head(split_idx)
    df_test = df.tail(df.height - split_idx)
    print(f"[+] Chronological Split -> Train (80%): {df_train.height} rows | Test (20%): {df_test.height} rows.")

    # 3. Data Matrix Preparation
    feature_cols = [
        "Spread_Dollars",
        "Micro_Price_Dollars",
        "Imbalance_Ratio",
        "Deep_Imbalance_Ratio",
        "Micro_Price_Delta_10",
        "Deep_Imbalance_Delta_10"
    ]
    target_col = "Target_Direction"

    X_train = df_train.select(feature_cols).to_numpy()
    y_train = df_train.select(target_col).to_numpy().flatten()

    X_test = df_test.select(feature_cols).to_numpy()
    y_test = df_test.select(target_col).to_numpy().flatten()

    # 4. Model Training & Extraction
    rf_model = RandomForestClassifier(
        n_estimators=50,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    print("[+] Training RandomForestClassifier (n_estimators=50, max_depth=10, random_state=42)...")
    rf_model.fit(X_train, y_train)

    # Baseline Predictions on test set
    y_pred = rf_model.predict(X_test)

    # Classification Report
    target_names = ["Down (-1)", "Flat (0)", "Up (1)"]
    labels = [-1, 0, 1]
    print("\n--- Classification Report (Afternoon Test Set) ---")
    report_str = classification_report(y_test, y_pred, labels=labels, target_names=target_names, zero_division=0)
    print(report_str)

    # Feature Importances Extraction
    importances = rf_model.feature_importances_
    sorted_indices = np.argsort(importances)[::-1]

    print("--- Feature Importances (Descending) ---")
    sorted_features = []
    for idx in sorted_indices:
        fname = feature_cols[idx]
        fimp = importances[idx]
        print(f"  * {fname:24s}: {fimp:.4f} ({fimp * 100:.2f}%)")
        sorted_features.append({"feature": fname, "importance": float(fimp)})

    return {
        "df": df,
        "df_train": df_train,
        "df_test": df_test,
        "rf_model": rf_model,
        "feature_cols": feature_cols,
        "X_train": X_train,
        "y_train": y_train,
        "X_test": X_test,
        "y_test": y_test,
        "y_pred": y_pred,
        "sorted_features": sorted_features,
        "report_str": report_str
    }

if __name__ == "__main__":
    run_phase_2()
