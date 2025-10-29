(() => {
  const { models, series } = window.quantData;
  const filtersContainer = document.getElementById('model-filters');
  const toggleAllButton = document.getElementById('toggle-all');
  const resetViewButton = document.getElementById('reset-view');
  const tableBody = document.querySelector('#metrics-table tbody');
  const playbookContainer = document.getElementById('model-playbook');

  const state = {
    activeModels: new Set(models.map((model) => model.id)),
    checkboxes: new Map()
  };

  const playbookNotes = {
    linear_regression: [
      'Engineer lagged returns, moving averages, and volatility features to enrich linearity.',
      'Regularize with ElasticNet when feature space expands.',
      'Best for quick benchmarking and explainability.'
    ],
    random_forest: [
      'Resample rolling windows to reduce look-ahead bias.',
      'Tune tree depth and minimum samples to prevent overfitting choppy markets.',
      'Great for capturing feature interactions with limited preprocessing.'
    ],
    xgboost: [
      'Leverage learning-rate schedules to adapt to new market regimes.',
      'Incorporate engineered macro factors for stronger context awareness.',
      'Watch for target leakage—use walk-forward validation.'
    ],
    lstm: [
      'Normalize sequences and include attention to focus on pivotal timesteps.',
      'Use dropout and recurrent dropout to keep oscillations under control.',
      'Pair with exogenous signals (news, sentiment) for richer embeddings.'
    ],
    prophet: [
      'Ideal for decomposing weekly/seasonal cycles with minimal configuration.',
      'Add changepoints during earnings to capture structural breaks.',
      'Combine with residual models to capture short-term noise.'
    ]
  };

  const priceCtx = document.getElementById('price-chart');
  const errorCtx = document.getElementById('error-chart');

  const chartDatasets = [];
  const datasetLookup = new Map();

  const actualDataset = {
    label: 'Actual Price',
    data: series.map((point) => ({ x: point.date, y: point.actual })),
    borderColor: '#f8fafc',
    backgroundColor: 'rgba(248, 250, 252, 0.25)',
    tension: 0.35,
    borderWidth: 3,
    pointRadius: 0,
    spanGaps: true
  };

  chartDatasets.push(actualDataset);

  models.forEach((model) => {
    const dataset = {
      label: model.name,
      data: series.map((point) => ({ x: point.date, y: point[model.id] })),
      borderColor: model.color,
      backgroundColor: model.color,
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 0,
      hidden: false,
      spanGaps: true
    };
    chartDatasets.push(dataset);
    datasetLookup.set(model.id, dataset);
  });

  const priceChart = new Chart(priceCtx, {
    type: 'line',
    data: { datasets: chartDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day', tooltipFormat: 'DDD MMM dd' },
          ticks: { color: '#cbd5f5' },
          grid: { color: 'rgba(148, 163, 184, 0.15)' }
        },
        y: {
          ticks: { color: '#cbd5f5', callback: (value) => `$${value.toFixed(0)}` },
          grid: { color: 'rgba(148, 163, 184, 0.12)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
          }
        }
      }
    }
  });

  const metricsByModel = computeMetrics();

  const errorChart = new Chart(errorCtx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Mean Absolute Error',
          data: [],
          backgroundColor: [],
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: '#cbd5f5' },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: '#cbd5f5',
            callback: (value) => `$${Number(value).toFixed(2)}`
          },
          grid: { color: 'rgba(148, 163, 184, 0.15)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `$${context.parsed.y.toFixed(2)} average absolute error`
          }
        }
      }
    }
  });

  renderFilters();
  renderMetricsTable();
  renderErrorChart();
  renderPlaybook();

  toggleAllButton.addEventListener('click', () => {
    const shouldActivateAll = state.activeModels.size !== models.length;
    models.forEach((model) => {
      const checkbox = state.checkboxes.get(model.id);
      checkbox.checked = shouldActivateAll;
      updateModelState(model.id, shouldActivateAll);
    });
    syncCharts();
  });

  resetViewButton.addEventListener('click', () => {
    models.forEach((model) => {
      const checkbox = state.checkboxes.get(model.id);
      checkbox.checked = true;
      updateModelState(model.id, true);
    });
    priceChart.stop();
    priceChart.update();
    syncCharts();
  });

  function renderFilters() {
    models.forEach((model) => {
      const label = document.createElement('label');
      label.className = 'filter-chip';
      label.style.setProperty('--chip-color', model.color);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.setAttribute('aria-label', `Toggle ${model.name}`);

      checkbox.addEventListener('change', () => {
        updateModelState(model.id, checkbox.checked);
        syncCharts();
      });

      const swatch = document.createElement('span');
      swatch.style.width = '12px';
      swatch.style.height = '12px';
      swatch.style.borderRadius = '999px';
      swatch.style.display = 'inline-block';
      swatch.style.background = model.color;

      const text = document.createElement('span');
      text.textContent = model.name;

      label.append(checkbox, swatch, text);
      filtersContainer.appendChild(label);
      state.checkboxes.set(model.id, checkbox);
    });
  }

  function renderMetricsTable() {
    tableBody.innerHTML = '';
    const orderedActiveIds = models
      .map((model) => model.id)
      .filter((modelId) => state.activeModels.has(modelId));

    orderedActiveIds.forEach((modelId) => {
      const metrics = metricsByModel[modelId];
      if (!metrics) return;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${metrics.name}</td>
        <td>${metrics.mae.toFixed(2)}</td>
        <td>${metrics.rmse.toFixed(2)}</td>
        <td>${metrics.mape.toFixed(2)}%</td>
        <td>${(metrics.directionalAccuracy * 100).toFixed(1)}%</td>
      `;
      tableBody.appendChild(row);
    });

    if (!tableBody.children.length) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" style="text-align:center; color: var(--muted); padding: 1rem;">
          Select at least one model to view comparative metrics.
        </td>
      `;
      tableBody.appendChild(emptyRow);
    }
  }

  function renderErrorChart() {
    const activeModelIds = models
      .map((model) => model.id)
      .filter((modelId) => state.activeModels.has(modelId));

    errorChart.data.labels = activeModelIds.map((id) => metricsByModel[id]?.name ?? '');
    errorChart.data.datasets[0].data = activeModelIds.map((id) => metricsByModel[id]?.mae ?? 0);
    errorChart.data.datasets[0].backgroundColor = activeModelIds.map((id) => {
      const model = models.find((m) => m.id === id);
      return model ? model.color : '#38bdf8';
    });
    errorChart.update();
  }

  function renderPlaybook() {
    playbookContainer.innerHTML = '';
    models.forEach((model) => {
      const card = document.createElement('article');
      card.className = 'playbook__card';

      const header = document.createElement('div');
      header.className = 'playbook__header';

      const icon = document.createElement('div');
      icon.className = 'playbook__icon';
      icon.textContent = model.icon;

      const title = document.createElement('div');
      title.innerHTML = `<strong>${model.name}</strong><br /><span style="color: var(--muted); font-size: 0.9rem;">${model.description}</span>`;

      header.append(icon, title);
      card.appendChild(header);

      const list = document.createElement('ul');
      (playbookNotes[model.id] || []).forEach((note) => {
        const item = document.createElement('li');
        item.textContent = note;
        list.appendChild(item);
      });

      card.appendChild(list);
      playbookContainer.appendChild(card);
    });
  }

  function updateModelState(modelId, isActive) {
    const dataset = datasetLookup.get(modelId);
    if (!dataset) return;

    if (isActive) {
      state.activeModels.add(modelId);
      dataset.hidden = false;
    } else {
      state.activeModels.delete(modelId);
      dataset.hidden = true;
    }
  }

  function syncCharts() {
    priceChart.update();
    renderMetricsTable();
    renderErrorChart();
  }

  function computeMetrics() {
    const results = {};
    models.forEach((model) => {
      const errors = series.map((point) => point[model.id] - point.actual);
      const absErrors = errors.map((err) => Math.abs(err));
      const squaredErrors = errors.map((err) => err * err);
      const percentageErrors = series.map((point, index) => {
        const actual = point.actual;
        return actual !== 0 ? Math.abs(errors[index] / actual) : 0;
      });

      let directionalHits = 0;
      let comparisons = 0;
      for (let i = 1; i < series.length; i += 1) {
        const actualChange = series[i].actual - series[i - 1].actual;
        const predictedChange = series[i][model.id] - series[i - 1][model.id];
        if (actualChange === 0 && predictedChange === 0) {
          directionalHits += 1;
        } else if (Math.sign(actualChange) === Math.sign(predictedChange)) {
          directionalHits += 1;
        }
        comparisons += 1;
      }

      const mae = average(absErrors);
      const rmse = Math.sqrt(average(squaredErrors));
      const mape = average(percentageErrors) * 100;
      const directionalAccuracy = comparisons > 0 ? directionalHits / comparisons : 0;

      results[model.id] = {
        id: model.id,
        name: model.name,
        mae,
        rmse,
        mape,
        directionalAccuracy
      };
    });

    return results;
  }

  function average(values) {
    if (!values.length) return 0;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  }
})();
