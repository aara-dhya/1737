## Project Context

You are an expert quantitative developer building an institutional-grade, High-Frequency Trading (HFT) machine learning pipeline. The project is processed in Python, strictly utilizing `polars` for memory-efficient, vectorized data engineering. Do not use `pandas` under any circumstances.

  

This file governs Phase 1: Data Ingestion, Micro-Structure Feature Engineering, and Tick-Time Target Creation.

  

## 1. Input Data Specification

The data originates from the LOBSTER database for a specific equity (e.g., AAPL).

  

- **Format:** CSV.
    
      
    
- **Structure:** Limit Order Book (LOB) snapshot data containing exactly 10 levels of market depth.
    
      
    
- **Column Naming Convention:** Assume columns follow a pattern of `Ask_Price_1`, `Ask_Volume_1`, `Bid_Price_1`, `Bid_Volume_1`, continuing down to Level 10 (`Ask_Price_10`, etc.). Time is typically provided as a continuous float representing seconds from midnight (e.g., `time`).
    
      
    
- **Crucial Pre-processing:** LOBSTER stores prices as integers multiplied by 10,000. Your first step upon loading the CSV via `polars.read_csv()` must be to divide all price columns by 10,000.0 to convert them to standard dollar values. Keep volume columns as integers.
    
      
    

## 2. Feature Engineering Requirements

Construct the following order book features using Polars' `.with_columns()` API. Ensure all calculations are vectorized.

  

- **Spread_Dollars:** The immediate cost of taking liquidity.
    
      
    - _Formula:_ `Ask_Price_1 - Bid_Price_1`
        
          
        
- **Micro_Price_Dollars:** The volume-weighted mid-price at Level 1. This is a superior baseline compared to the standard mid-price because it respects the imbalance of front-line liquidity.
    
      
    - _Formula:_ `(Bid_Price_1 * Ask_Volume_1 + Ask_Price_1 * Bid_Volume_1) / (Bid_Volume_1 + Ask_Volume_1)`
        
          
        
- **Imbalance_Ratio:** The normalized Level 1 order book imbalance. Indicates immediate front-line buying or selling pressure.
    
      
    - _Formula:_ `(Bid_Volume_1 - Ask_Volume_1) / (Bid_Volume_1 + Ask_Volume_1)`
        
          
        
- **Deep_Imbalance_Ratio:** The macroeconomic health of the order book.
    
      
    - _Logic:_ First, sum all bid volumes (`Bid_Volume_1` through `Bid_Volume_10`) into a `Total_Bid_Volume` temporary column. Sum all ask volumes into a `Total_Ask_Volume` temporary column.
        
          
        
    - _Formula:_ `(Total_Bid_Volume - Total_Ask_Volume) / (Total_Bid_Volume + Total_Ask_Volume)`
        
          
        

## 3. Tick-Time Target Engineering

In HFT, clock-time prediction (e.g., "predict 1 second ahead") introduces severe noise due to variable market activity. We use "Tick Time" (event-based forecasting).

  

1. **Define Horizon:** Set a prediction horizon of 20 ticks (events).
    
      
    
2. **Generate Future Price:** Create a column named `Future_Mid_Price`. Generate this by calculating the standard mid-price `(Ask_Price_1 + Bid_Price_1) / 2` and shifting it backward by 20 rows using `polars.col().shift(-20)`.
    
      
    
3. **Label Generation:** Create a column named `Target_Direction` mapped as a 32-bit integer:
    
      
    - Use `polars.when().then().otherwise()` logic.
        
          
        
    - If `Future_Mid_Price` > Current Mid-Price: Output `1` (Up).
        
          
        
    - If `Future_Mid_Price` < Current Mid-Price: Output `-1` (Down).
        
          
        
    - Otherwise: Output `0` (Flat).
        
          
        
4. **Sanitization:** The `shift(-20)` operation will create 20 null values at the very end of the DataFrame. You must call `.drop_nulls()` to remove these trailing edges before export.
    
      
    

## 4. Output standard & MLOps

- Select only the necessary engineered columns plus the time column to keep the dataset lean.
    
      
    
- **Export:** Write the finalized Polars DataFrame to disk using `.write_parquet("data/AAPL_engineered_features.parquet")`. Do not use CSV for the output.
    
      
    
- **Version Control:** You must adhere strictly to the Conventional Commits specification. When this phase is implemented, the commit message must be formatted as: `feat(data): engineer tick-time features and export to parquet`.