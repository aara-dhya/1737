import os
import polars as pl

def run_phase_1(input_csv="data/AAPL_LOBSTER.csv", output_parquet="data/AAPL_engineered_features.parquet"):
    """
    Phase 1: Data Ingestion, Price Normalization, Micro-Structure Feature Engineering,
    and Tick-Time Target Creation using Polars.
    """
    print(f"=== [PHASE 1] Processing Data Ingestion & Micro-Structure Engineering ===")
    
    if not os.path.exists(input_csv):
        raise FileNotFoundError(f"Input file {input_csv} does not exist.")

    # 1. Data Ingestion
    df = pl.read_csv(input_csv)
    print(f"[+] Loaded raw dataset: {df.height} rows, {df.width} columns.")

    # Crucial Pre-processing: Divide all price columns by 10,000.0 to convert to standard dollar values
    price_cols = [c for c in df.columns if "Price" in c]
    df = df.with_columns([
        (pl.col(col) / 10000.0).alias(col) for col in price_cols
    ])
    print(f"[+] Scaled {len(price_cols)} price columns from LOBSTER integer format to standard dollar values.")

    # 2. Feature Engineering Requirements (Vectorized)
    # Temporary sums for Deep Imbalance
    bid_vol_cols = [f"Bid_Volume_{i}" for i in range(1, 11)]
    ask_vol_cols = [f"Ask_Volume_{i}" for i in range(1, 11)]

    df = df.with_columns([
        # Temporary total volumes
        pl.sum_horizontal(bid_vol_cols).alias("Total_Bid_Volume"),
        pl.sum_horizontal(ask_vol_cols).alias("Total_Ask_Volume"),
    ]).with_columns([
        # Spread_Dollars
        (pl.col("Ask_Price_1") - pl.col("Bid_Price_1")).alias("Spread_Dollars"),
        
        # Micro_Price_Dollars
        ((pl.col("Bid_Price_1") * pl.col("Ask_Volume_1") + pl.col("Ask_Price_1") * pl.col("Bid_Volume_1")) / 
         (pl.col("Bid_Volume_1") + pl.col("Ask_Volume_1"))).alias("Micro_Price_Dollars"),
        
        # Imbalance_Ratio
        ((pl.col("Bid_Volume_1") - pl.col("Ask_Volume_1")) / 
         (pl.col("Bid_Volume_1") + pl.col("Ask_Volume_1"))).alias("Imbalance_Ratio"),
        
        # Deep_Imbalance_Ratio
        ((pl.col("Total_Bid_Volume") - pl.col("Total_Ask_Volume")) / 
         (pl.col("Total_Bid_Volume") + pl.col("Total_Ask_Volume"))).alias("Deep_Imbalance_Ratio")
    ])

    # 3. Tick-Time Target Engineering
    mid_price = (pl.col("Ask_Price_1") + pl.col("Bid_Price_1")) / 2.0
    df = df.with_columns(mid_price.alias("Mid_Price_Dollars"))
    
    # Generate Future Price: 20 ticks look-ahead shift(-20)
    df = df.with_columns([
        pl.col("Mid_Price_Dollars").shift(-20).alias("Future_Mid_Price")
    ])

    # Label Generation
    df = df.with_columns([
        pl.when(pl.col("Future_Mid_Price") > pl.col("Mid_Price_Dollars"))
        .then(1)
        .when(pl.col("Future_Mid_Price") < pl.col("Mid_Price_Dollars"))
        .then(-1)
        .otherwise(0)
        .cast(pl.Int32)
        .alias("Target_Direction")
    ])

    # Sanitization: drop_nulls() for the trailing 20 rows created by shift(-20)
    initial_rows = df.height
    df = df.drop_nulls()
    sanitized_rows = df.height
    print(f"[+] Dropped {initial_rows - sanitized_rows} trailing edge null rows from 20-tick shift.")

    # 4. Output standard & MLOps: Write to parquet
    os.makedirs(os.path.dirname(output_parquet), exist_ok=True)
    df.write_parquet(output_parquet)
    print(f"[+] Saved finalized Polars DataFrame to '{output_parquet}' ({df.height} rows).")
    return df

if __name__ == "__main__":
    run_phase_1()
