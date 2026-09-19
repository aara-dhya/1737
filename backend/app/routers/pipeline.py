import asyncio
import json
import logging
import websockets as ws_client
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from backend.app.services.ml_pipeline import run_pipeline, LIVE_MODELS
import pandas as pd

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])

class PipelineConfigRequest(BaseModel):
    ticker: str
    date_range: str
    max_depth: int
    n_estimators: int

@router.post("/run")
async def execute_pipeline(config: PipelineConfigRequest):
    """
    Executes the ML pipeline (downloads data, trains XGBoost, runs backtest).
    Returns the JSON payload for the frontend dashboard.
    """
    results = await run_pipeline(
        symbol=config.ticker, 
        max_depth=config.max_depth, 
        n_estimators=config.n_estimators
    )
    return results

@router.websocket("/live/{ticker}")
async def live_trading_ws(websocket: WebSocket, ticker: str):
    """
    WebSocket endpoint for the React frontend.
    Connects to Binance live order book stream, runs the trained ML model,
    and streams predictions and PnL updates down to React.
    """
    await websocket.accept()
    
    symbol = ticker.replace("LOBSTER:", "").replace("BINANCE:", "").upper()
    if symbol == "AAPL":
        symbol = "BTCUSDT"
        
    binance_symbol = symbol.lower()
    binance_ws_url = f"wss://stream.binance.com:9443/ws/{binance_symbol}@bookTicker"
    
    # Ensure model exists
    model = LIVE_MODELS.get(symbol)
    
    try:
        async with ws_client.connect(binance_ws_url) as binance_ws:
            while True:
                message = await binance_ws.recv()
                data = json.loads(message)
                
                # Binance @bookTicker format:
                # { "u":400900217, "s":"BNBUSDT", "b":"25.35190000", "B":"31.21000000", "a":"25.36520000", "A":"40.66000000" }
                best_bid = float(data.get("b", 0))
                best_ask = float(data.get("a", 0))
                
                if best_bid == 0 or best_ask == 0:
                    continue
                    
                micro = (best_bid + best_ask) / 2
                spread = best_ask - best_bid
                
                # Dummy imbalance/volume for live inference (in a real system we'd maintain state)
                imbalance = 0.1
                deep_imbalance = 0.05
                volume = 1.0
                
                # Predict
                prob = 0.0
                if model:
                    # Features: ["spread", "micro", "imbalance", "deep_imbalance", "volume"]
                    X_live = pd.DataFrame([[spread, micro, imbalance, deep_imbalance, volume]], 
                                          columns=["spread", "micro", "imbalance", "deep_imbalance", "volume"])
                    prob = float(model.predict_proba(X_live)[0][1])
                
                # Construct response for React
                # The React frontend expects: string logs or JSON
                # We will send JSON and let React format it.
                is_buy = prob > 0.60
                
                payload = {
                    "type": "EXEC" if is_buy else "TICK",
                    "price": best_ask if is_buy else micro,
                    "prob": prob,
                    "symbol": symbol
                }
                
                await websocket.send_json(payload)
                await asyncio.sleep(0.1) # Throttle to avoid overwhelming the frontend
                
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from live trading: {ticker}")
    except Exception as e:
        logger.error(f"Live trading error: {e}")
        try:
            await websocket.close()
        except:
            pass
