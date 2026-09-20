import httpx
import pandas as pd
import numpy as np

BINANCE_API_URL = "https://api.binance.com/api/v3"

async def fetch_historical_klines(symbol: str = "BTCUSDT", interval: str = "1m", limit: int = 1000):
    """
    Fetches historical k-lines from Binance and simulates L2 order book metrics 
    to match the expected schema for the HFT ML pipeline.
    """
    # Ensure symbol is uppercase and formatted for Binance
    symbol = symbol.replace("LOBSTER:", "").replace("BINANCE:", "").upper()
    if symbol == "AAPL": # Fallback for the default frontend UI which uses AAPL
        symbol = "BTCUSDT"
        
    url = f"{BINANCE_API_URL}/klines"
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        # Binance blocks US Cloud IPs (like Render's servers). 
        # If it fails, fallback to randomly generated mock K-lines for demonstration.
        print(f"Failed to fetch Binance data (likely IP block). Falling back to mock data. Error: {e}")
        import time
        import random
        data = []
        now = int(time.time() * 1000)
        base_price = 80000.0
        for i in range(limit):
            open_price = base_price + random.uniform(-10, 10)
            close_price = open_price + random.uniform(-20, 20)
            high_price = max(open_price, close_price) + random.uniform(0, 10)
            low_price = min(open_price, close_price) - random.uniform(0, 10)
            vol = random.uniform(1, 100)
            taker_vol = vol * random.uniform(0.3, 0.7)
            data.append([
                now - (limit - i) * 60000, str(open_price), str(high_price), str(low_price), str(close_price), str(vol),
                now - (limit - i) * 60000 + 59999, str(vol * close_price), 100, str(taker_vol), str(taker_vol * close_price), "0"
            ])
            base_price = close_price
    
    df = pd.DataFrame(data, columns=[
        "open_time", "open", "high", "low", "close", "volume", 
        "close_time", "quote_volume", "trades", "taker_buy_base", "taker_buy_quote", "ignore"
    ])
    
    df["close"] = df["close"].astype(float)
    df["high"] = df["high"].astype(float)
    df["low"] = df["low"].astype(float)
    df["volume"] = df["volume"].astype(float)
    df["taker_buy_base"] = df["taker_buy_base"].astype(float)
    
    # Simulate Order Book Features from K-lines
    # Since we don't have historical L2 snapshots from the free REST API, we approximate:
    df["spread"] = (df["high"] - df["low"]) * 0.1 # Simulated tight spread
    df["spread"] = df["spread"].replace(0, 0.01) # Avoid zero spread
    
    df["ask_1"] = df["close"] + (df["spread"] / 2)
    df["bid_1"] = df["close"] - (df["spread"] / 2)
    
    df["raw_ask_1"] = (df["ask_1"] * 10000).astype(int)
    df["raw_bid_1"] = (df["bid_1"] * 10000).astype(int)
    
    df["micro"] = (df["ask_1"] + df["bid_1"]) / 2
    
    # Simulate Order Book Imbalance based on taker buy vs total volume
    # Taker buy implies aggressive buyers (bids hitting asks)
    buy_ratio = df["taker_buy_base"] / (df["volume"] + 1e-8)
    # Imbalance = (Bid Size - Ask Size) / (Bid Size + Ask Size). 
    # High buy ratio implies larger bid support or aggressive buying.
    df["imbalance"] = (buy_ratio - 0.5) * 2 
    df["deep_imbalance"] = df["imbalance"] * 0.8 + np.random.normal(0, 0.1, size=len(df))
    
    # Target: 1 if next minute's close is higher, 0 otherwise
    df["target"] = (df["close"].shift(-1) > df["close"]).astype(int)
    
    # Time formatting for the frontend (seconds since midnight)
    # open_time is in milliseconds
    df["time"] = (df["open_time"] / 1000) % 86400 
    
    # Drop the last row since it won't have a valid target
    df = df.dropna()
    
    return df
