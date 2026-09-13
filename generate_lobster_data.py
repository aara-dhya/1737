import os
import numpy as np
import polars as pl

def generate_synthetic_lobster_data(output_path="data/AAPL_LOBSTER.csv", num_ticks=10000, seed=42):
    """
    Generates a realistic 10-level Limit Order Book (LOB) snapshot dataset in LOBSTER format.
    Prices are represented as integers multiplied by 10,000 (e.g. 150.00 -> 1500000).
    """
    np.random.seed(seed)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Initial mid price: $175.00 -> 1750000
    base_price = 175.00
    time_stamp = 34200.0  # 9:30 AM in seconds from midnight

    # Generate synthetic price path with auto-regressive micro-structure trends
    returns = np.random.normal(0.00002, 0.0008, num_ticks)
    # Add a mean-reverting / trending signal to make tick prediction learnable
    trend = np.sin(np.linspace(0, 12 * np.pi, num_ticks)) * 0.0005
    combined_returns = returns + trend
    
    price_path = base_price * np.exp(np.cumsum(combined_returns))
    
    data = {}
    times = []
    
    current_time = time_stamp
    for i in range(num_ticks):
        current_time += np.random.exponential(0.05) + 0.001
        times.append(round(current_time, 4))
    
    data["time"] = times

    for level in range(1, 11):
        half_spread = 0.01 * level
        
        # Micro-structure imbalance simulation correlated with future returns
        future_idx = min(i + 20, num_ticks - 1)
        
        # Calculate level bid and ask prices in integer format (* 10,000)
        ask_prices = []
        bid_prices = []
        ask_vols = []
        bid_vols = []

        for i in range(num_ticks):
            mid = price_path[i]
            # Imbalance at level 1 signal
            fut_ret = (price_path[min(i + 20, num_ticks - 1)] - mid)
            
            ask_p = int(round((mid + half_spread + np.random.choice([0, 0.01])) * 10000.0))
            bid_p = int(round((mid - half_spread - np.random.choice([0, 0.01])) * 10000.0))
            
            if bid_p >= ask_p:
                bid_p = ask_p - 100  # 1 cent separation

            # Volume imbalance correlated with return direction
            base_vol = 100 * level
            if fut_ret > 0.05:
                bid_v = int(base_vol * np.random.uniform(1.8, 3.5))
                ask_v = int(base_vol * np.random.uniform(0.4, 1.2))
            elif fut_ret < -0.05:
                bid_v = int(base_vol * np.random.uniform(0.4, 1.2))
                ask_v = int(base_vol * np.random.uniform(1.8, 3.5))
            else:
                bid_v = int(base_vol * np.random.uniform(0.8, 1.5))
                ask_v = int(base_vol * np.random.uniform(0.8, 1.5))

            ask_prices.append(ask_p)
            bid_prices.append(bid_p)
            ask_vols.append(ask_v)
            bid_vols.append(bid_v)

        data[f"Ask_Price_{level}"] = ask_prices
        data[f"Ask_Volume_{level}"] = ask_vols
        data[f"Bid_Price_{level}"] = bid_prices
        data[f"Bid_Volume_{level}"] = bid_vols

    df = pl.DataFrame(data)
    df.write_csv(output_path)
    print(f"[+] Successfully generated LOBSTER dataset at '{output_path}' with {df.height} ticks.")
    return df

if __name__ == "__main__":
    generate_synthetic_lobster_data()
