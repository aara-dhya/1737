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
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
    # Binance kline format:
    # [ Open time, Open, High, Low, Close, Volume, Close time, Quote asset volume, Number of trades, Taker buy base asset volume, Taker buy quote asset volume, Ignore ]
    
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
