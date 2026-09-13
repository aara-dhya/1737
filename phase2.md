## Project Context

You are continuing the development of an institutional-grade, High-Frequency Trading (HFT) machine learning pipeline. In Phase 1, we generated static micro-structure features and tick-time targets.

  

This file governs Phase 2: Time-Series Momentum Engineering, Strict Chronological Splitting, and Predictive Modeling using Scikit-Learn.

  

## 1. Data Ingestion & Momentum Engineering (The Deltas)

In market micro-structure, the velocity of the order book is often more predictive than its static state. We must engineer Time-Series Deltas to give the AI a sense of momentum.

  

1. **Ingestion:** Load the dataset engineered in Phase 1 using `polars.read_parquet("data/AAPL_engineered_features.parquet")`.
    
      
    
2. **Calculate Deltas:** Create two new columns that measure how much the features have changed over the last 10 ticks. Use Polars' `.with_columns()` and a backward `.shift(10)`.
    
      
    - `Micro_Price_Delta_10`: Current `Micro_Price_Dollars` minus the value from 10 rows ago.
        
          
        
    - `Deep_Imbalance_Delta_10`: Current `Deep_Imbalance_Ratio` minus the value from 10 rows ago.
        
          
        
3. **Sanitization:** Shifting backward by 10 rows will introduce null values at the very beginning of the dataset (since there is no past for the first 10 events of the day). You must apply `.drop_nulls()` immediately after feature creation.
    
      
    

## 2. Chronological Train/Test Split

**CRITICAL AI DIRECTIVE:** Do NOT use Scikit-Learn's standard `train_test_split()` function with random shuffling. Randomly shuffling financial time-series data causes "Data Leakage" (look-ahead bias), allowing the model to peek into the future to predict the past.

  

You must manually perform a strict chronological split:

  

1. Calculate the split index: `int(df.height * 0.8)`.
    
      
    
2. **Training Set (Morning/Mid-day):** The first 80% of the DataFrame (using `.head(split_idx)`).
    
      
    
3. **Testing Set (Afternoon):** The remaining 20% of the DataFrame (using `.tail(df.height - split_idx)`).
    
      
    

## 3. Data Matrix Preparation

Isolate your features (`X`) and target (`y`) and convert the Polars DataFrames into NumPy arrays compatible with Scikit-Learn.

  

- **Features List:** `Spread_Dollars`, `Micro_Price_Dollars`, `Imbalance_Ratio`, `Deep_Imbalance_Ratio`, `Micro_Price_Delta_10`, `Deep_Imbalance_Delta_10`.
    
      
    
- **Target:** `Target_Direction`.
    
      
    
- _Implementation Note:_ Use `.select().to_numpy()` for the features, and `.select().to_numpy().flatten()` for the target to ensure it is a 1D vector.
    
      
    

## 4. Model Training & Extraction

Initialize and train a Random Forest model. We use an ensemble approach because it mimics algorithmic decision trees (e.g., _if spread is tight AND imbalance is dropping..._) across thousands of simultaneous branches.

  

1. **Initialization:** Instantiate `RandomForestClassifier` with `n_estimators=50`, `max_depth=10`, `random_state=42`, and `n_jobs=-1`. The `max_depth` restriction is crucial to prevent overfitting to micro-structure noise.
    
      
    
2. **Training:** Fit the model exclusively on the 80% Training Set (`X_train`, `y_train`).
    
      
    
3. **Prediction:** Generate baseline predictions using `.predict(X_test)` on the unseen 20% Afternoon Set.
    
      
    
4. **Evaluation Metrics:**
    
      
    - Print a `classification_report` mapping the integer targets to their human-readable states: `[-1: "Down", 0: "Flat", 1: "Up"]`.
        
          
        
    - Extract the `feature_importances_` from the trained model. Sort them in descending order and print them alongside their corresponding feature names. This validates that the newly engineered Delta features are actively influencing the AI's decision-making hierarchy.
        
          
        

## 5. Version Control

- You must adhere strictly to the Conventional Commits specification.
    
      
    
- When this phase is implemented, the commit message must be formatted exactly as: `feat(model): calculate time-series deltas and train v2 random forest`