window.quantData = {
  models: [
    {
      id: 'linear_regression',
      name: 'Linear Regression',
      color: '#38bdf8',
      icon: '∑',
      description: 'A fast baseline that captures linear trends and seasonality using engineered lag features.'
    },
    {
      id: 'random_forest',
      name: 'Random Forest',
      color: '#c084fc',
      icon: '🌲',
      description: 'Ensemble of decision trees trained on technical features to capture non-linear relationships.'
    },
    {
      id: 'xgboost',
      name: 'XGBoost',
      color: '#fbbf24',
      icon: '⚡',
      description: 'Gradient-boosted trees tuned for short-term price shocks and regime shifts.'
    },
    {
      id: 'lstm',
      name: 'LSTM Network',
      color: '#34d399',
      icon: '🧠',
      description: 'Sequence-to-sequence recurrent network ingesting OHLCV windows for temporal dynamics.'
    },
    {
      id: 'prophet',
      name: 'Prophet',
      color: '#f472b6',
      icon: '🔮',
      description: 'Bayesian structural time series model balancing trend, seasonality, and holiday effects.'
    }
  ],
  series: [
    { date: '2024-02-01', actual: 150.2, linear_regression: 149.8, random_forest: 150.4, xgboost: 150.1, lstm: 150.6, prophet: 150.0 },
    { date: '2024-02-02', actual: 151.4, linear_regression: 151.0, random_forest: 151.3, xgboost: 151.5, lstm: 151.9, prophet: 151.2 },
    { date: '2024-02-03', actual: 150.8, linear_regression: 150.9, random_forest: 150.7, xgboost: 150.9, lstm: 151.4, prophet: 150.6 },
    { date: '2024-02-04', actual: 152.0, linear_regression: 151.7, random_forest: 152.1, xgboost: 152.2, lstm: 152.6, prophet: 151.9 },
    { date: '2024-02-05', actual: 153.2, linear_regression: 152.9, random_forest: 153.5, xgboost: 153.4, lstm: 153.8, prophet: 153.0 },
    { date: '2024-02-06', actual: 154.1, linear_regression: 153.6, random_forest: 154.3, xgboost: 154.2, lstm: 154.7, prophet: 154.0 },
    { date: '2024-02-07', actual: 155.0, linear_regression: 154.6, random_forest: 155.1, xgboost: 155.3, lstm: 155.7, prophet: 154.9 },
    { date: '2024-02-08', actual: 154.4, linear_regression: 154.1, random_forest: 154.6, xgboost: 154.5, lstm: 155.0, prophet: 154.2 },
    { date: '2024-02-09', actual: 155.6, linear_regression: 155.0, random_forest: 155.4, xgboost: 155.7, lstm: 156.1, prophet: 155.3 },
    { date: '2024-02-10', actual: 156.8, linear_regression: 156.1, random_forest: 156.5, xgboost: 156.9, lstm: 157.3, prophet: 156.4 },
    { date: '2024-02-11', actual: 157.2, linear_regression: 156.8, random_forest: 157.4, xgboost: 157.3, lstm: 157.7, prophet: 157.0 },
    { date: '2024-02-12', actual: 158.3, linear_regression: 158.0, random_forest: 158.6, xgboost: 158.5, lstm: 159.0, prophet: 158.2 },
    { date: '2024-02-13', actual: 157.9, linear_regression: 157.4, random_forest: 157.8, xgboost: 158.0, lstm: 158.4, prophet: 157.5 },
    { date: '2024-02-14', actual: 158.7, linear_regression: 158.2, random_forest: 158.8, xgboost: 159.0, lstm: 159.5, prophet: 158.6 },
    { date: '2024-02-15', actual: 159.5, linear_regression: 159.0, random_forest: 159.6, xgboost: 159.7, lstm: 160.2, prophet: 159.3 },
    { date: '2024-02-16', actual: 160.2, linear_regression: 160.0, random_forest: 160.5, xgboost: 160.6, lstm: 161.0, prophet: 160.1 },
    { date: '2024-02-17', actual: 161.4, linear_regression: 160.8, random_forest: 161.3, xgboost: 161.5, lstm: 161.9, prophet: 161.0 },
    { date: '2024-02-18', actual: 162.0, linear_regression: 161.4, random_forest: 162.1, xgboost: 162.3, lstm: 162.8, prophet: 161.7 },
    { date: '2024-02-19', actual: 163.1, linear_regression: 162.6, random_forest: 163.4, xgboost: 163.2, lstm: 163.9, prophet: 162.9 },
    { date: '2024-02-20', actual: 164.0, linear_regression: 163.5, random_forest: 164.2, xgboost: 164.3, lstm: 165.0, prophet: 163.8 },
    { date: '2024-02-21', actual: 165.2, linear_regression: 164.6, random_forest: 165.1, xgboost: 165.4, lstm: 166.1, prophet: 165.0 },
    { date: '2024-02-22', actual: 164.7, linear_regression: 164.0, random_forest: 164.4, xgboost: 164.6, lstm: 165.5, prophet: 164.3 },
    { date: '2024-02-23', actual: 165.5, linear_regression: 165.0, random_forest: 165.7, xgboost: 165.8, lstm: 166.5, prophet: 165.2 },
    { date: '2024-02-24', actual: 166.3, linear_regression: 165.9, random_forest: 166.5, xgboost: 166.7, lstm: 167.4, prophet: 166.0 },
    { date: '2024-02-25', actual: 167.1, linear_regression: 166.7, random_forest: 167.3, xgboost: 167.4, lstm: 168.2, prophet: 166.9 },
    { date: '2024-02-26', actual: 168.4, linear_regression: 167.8, random_forest: 168.6, xgboost: 168.7, lstm: 169.7, prophet: 168.0 },
    { date: '2024-02-27', actual: 169.0, linear_regression: 168.5, random_forest: 169.1, xgboost: 169.3, lstm: 170.2, prophet: 168.8 },
    { date: '2024-02-28', actual: 170.5, linear_regression: 169.6, random_forest: 170.3, xgboost: 170.6, lstm: 171.7, prophet: 169.9 },
    { date: '2024-02-29', actual: 171.2, linear_regression: 170.4, random_forest: 171.0, xgboost: 171.4, lstm: 172.4, prophet: 170.7 },
    { date: '2024-03-01', actual: 172.4, linear_regression: 171.5, random_forest: 172.2, xgboost: 172.5, lstm: 173.7, prophet: 171.9 }
  ]
};
