const MODEL_DATA = {
    dataset: {
        name: "Synthetic NASDAQ Technology Equity",
        period: "January 2023 – December 2023",
        horizon: "30 trading days",
        frequency: "Daily close resampled to monthly checkpoints",
        featureStack: [
            "14-day RSI",
            "5/20 day moving averages",
            "MACD & signal spread",
            "Rolling volatility",
            "On-balance volume",
            "Lagged returns",
            "Earnings surprise flag",
            "Sector momentum index"
        ],
        workflow: [
            "Ingest and clean raw equity OHLCV data from the broker API",
            "Engineer technical indicators and macro covariates, then align to trading calendar",
            "Split into training (70%), validation (20%), and hold-out (10%) segments",
            "Scale numeric features and tune hyperparameters via cross-validation",
            "Backtest forecasts on the hold-out window and aggregate error statistics"
        ],
        insightSummary: [
            "Tree-based ensembles dominate RMSE, indicating strong handling of non-linearities.",
            "Sequence models like LSTM excel on directional accuracy with the lowest MAPE.",
            "Prophet underfits high-volatility swings, making it less suitable for aggressive trading windows."
        ]
    },
    actual: [
        { date: "2023-01-01", price: 150 },
        { date: "2023-02-01", price: 153 },
        { date: "2023-03-01", price: 148 },
        { date: "2023-04-01", price: 160 },
        { date: "2023-05-01", price: 165 },
        { date: "2023-06-01", price: 170 },
        { date: "2023-07-01", price: 172 },
        { date: "2023-08-01", price: 169 },
        { date: "2023-09-01", price: 175 },
        { date: "2023-10-01", price: 180 },
        { date: "2023-11-01", price: 185 },
        { date: "2023-12-01", price: 190 }
    ],
    models: [
        {
            id: "linear-regression",
            name: "Linear Regression",
            technique: "Ordinary Least Squares with polynomial time features",
            color: "#f97316",
            summary: "Baseline model using linear relationships between engineered factors and the next-month return.",
            bestFor: "Fast benchmarking and interpretable factor exposure analysis.",
            watchOut: "Fails to capture regime shifts and saturates during high volatility periods.",
            features: ["Polynomial time indices", "Moving-average crossover", "Lagged log returns"],
            metrics: { MAE: 1.42, RMSE: 1.5, MAPE: 0.84, R2: 0.987 },
            predictions: [
                { date: "2023-01-01", price: 149 },
                { date: "2023-02-01", price: 154 },
                { date: "2023-03-01", price: 150 },
                { date: "2023-04-01", price: 158 },
                { date: "2023-05-01", price: 164 },
                { date: "2023-06-01", price: 171 },
                { date: "2023-07-01", price: 174 },
                { date: "2023-08-01", price: 170 },
                { date: "2023-09-01", price: 176 },
                { date: "2023-10-01", price: 179 },
                { date: "2023-11-01", price: 183 },
                { date: "2023-12-01", price: 188 }
            ]
        },
        {
            id: "random-forest",
            name: "Random Forest",
            technique: "500-tree ensemble with time-aware cross-validation",
            color: "#38bdf8",
            summary: "Captures non-linear feature interactions and performs robustly across volatility regimes.",
            bestFor: "Traders wanting strong overall fit with limited parameter tuning.",
            watchOut: "Limited extrapolation beyond the observed feature space; retrain frequently.",
            features: ["Technical indicator stack", "Macro sentiment score", "Volume imbalance"],
            metrics: { MAE: 1.25, RMSE: 1.38, MAPE: 0.75, R2: 0.989 },
            predictions: [
                { date: "2023-01-01", price: 151 },
                { date: "2023-02-01", price: 152 },
                { date: "2023-03-01", price: 149 },
                { date: "2023-04-01", price: 162 },
                { date: "2023-05-01", price: 168 },
                { date: "2023-06-01", price: 171 },
                { date: "2023-07-01", price: 173 },
                { date: "2023-08-01", price: 168 },
                { date: "2023-09-01", price: 174 },
                { date: "2023-10-01", price: 181 },
                { date: "2023-11-01", price: 186 },
                { date: "2023-12-01", price: 191 }
            ]
        },
        {
            id: "lstm",
            name: "LSTM",
            technique: "Two-layer sequence model with dropout regularization",
            color: "#a855f7",
            summary: "Learns temporal dependencies directly from price sequences and technical indicators.",
            bestFor: "Swing-trading strategies that prioritize directionality and turning points.",
            watchOut: "Requires GPUs for faster training and careful monitoring to avoid overfitting.",
            features: ["Normalized OHLCV sequences", "Lagged technical factors", "Market regime embeddings"],
            metrics: { MAE: 1.17, RMSE: 1.41, MAPE: 0.67, R2: 0.988 },
            predictions: [
                { date: "2023-01-01", price: 150 },
                { date: "2023-02-01", price: 153 },
                { date: "2023-03-01", price: 147 },
                { date: "2023-04-01", price: 159 },
                { date: "2023-05-01", price: 166 },
                { date: "2023-06-01", price: 169 },
                { date: "2023-07-01", price: 173 },
                { date: "2023-08-01", price: 170 },
                { date: "2023-09-01", price: 176 },
                { date: "2023-10-01", price: 182 },
                { date: "2023-11-01", price: 187 },
                { date: "2023-12-01", price: 193 }
            ]
        },
        {
            id: "prophet",
            name: "Prophet",
            technique: "Additive model with holiday and changepoint priors",
            color: "#facc15",
            summary: "Flexible decomposition into trend, seasonality, and events with interpretable components.",
            bestFor: "Medium-term planning where seasonality and business calendar effects dominate.",
            watchOut: "Struggles with sudden volatility spikes without manual changepoint tuning.",
            features: ["Trend changepoints", "Quarterly seasonality", "Earnings date indicator"],
            metrics: { MAE: 1.67, RMSE: 1.73, MAPE: 1.01, R2: 0.982 },
            predictions: [
                { date: "2023-01-01", price: 148 },
                { date: "2023-02-01", price: 151 },
                { date: "2023-03-01", price: 150 },
                { date: "2023-04-01", price: 161 },
                { date: "2023-05-01", price: 167 },
                { date: "2023-06-01", price: 172 },
                { date: "2023-07-01", price: 171 },
                { date: "2023-08-01", price: 167 },
                { date: "2023-09-01", price: 173 },
                { date: "2023-10-01", price: 178 },
                { date: "2023-11-01", price: 184 },
                { date: "2023-12-01", price: 189 }
            ]
        },
        {
            id: "xgboost",
            name: "XGBoost",
            technique: "Gradient boosted decision trees (depth 4, 400 estimators)",
            color: "#34d399",
            summary: "Boosted trees emphasize recent momentum but require careful tuning to prevent noise amplification.",
            bestFor: "Quants seeking fast inference with moderate non-linearity capture.",
            watchOut: "Higher sensitivity to hyperparameters and risk of overshooting during spikes.",
            features: ["Momentum ratios", "Implied volatility spread", "Liquidity factor"],
            metrics: { MAE: 2.0, RMSE: 2.12, MAPE: 1.18, R2: 0.973 },
            predictions: [
                { date: "2023-01-01", price: 152 },
                { date: "2023-02-01", price: 155 },
                { date: "2023-03-01", price: 149 },
                { date: "2023-04-01", price: 161 },
                { date: "2023-05-01", price: 167 },
                { date: "2023-06-01", price: 171 },
                { date: "2023-07-01", price: 175 },
                { date: "2023-08-01", price: 171 },
                { date: "2023-09-01", price: 177 },
                { date: "2023-10-01", price: 183 },
                { date: "2023-11-01", price: 188 },
                { date: "2023-12-01", price: 192 }
            ]
        }
    ],
    analystInsights: [
        "Random Forest achieves the tightest RMSE and R², making it a balanced default for production pipelines.",
        "LSTM captures inflection points and keeps the lowest MAPE, indicating superior directional accuracy despite slightly higher RMSE.",
        "Prophet lags during momentum bursts—consider augmenting it with additional changepoints or switching to ensemble methods in turbulent markets.",
        "Linear Regression remains valuable for factor attribution but should be combined with regular retraining.",
        "XGBoost overreacts to momentum cues in the synthetic set; reduce learning rate or add regularization before deployment."
    ]
};
