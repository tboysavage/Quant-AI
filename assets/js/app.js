const METRIC_CONFIG = [
    { key: "MAE", label: "MAE ↓", direction: "min" },
    { key: "RMSE", label: "RMSE ↓", direction: "min" },
    { key: "MAPE", label: "MAPE ↓", direction: "min" },
    { key: "R2", label: "R² ↑", direction: "max" }
];

document.addEventListener("DOMContentLoaded", () => {
    if (!window.MODEL_DATA) {
        console.warn("MODEL_DATA is not defined.");
        return;
    }

    const {
        dataset,
        actual,
        models,
        analystInsights
    } = MODEL_DATA;

    const selectedModelIds = new Set(models.slice(0, 3).map((model) => model.id));
    const metricRanges = computeMetricRanges(models);
    const metricBests = computeMetricBests(models);

    populateDatasetFacts(dataset);
    populateLists(dataset, analystInsights);

    const modelSelector = document.getElementById("model-selector");
    const tableBody = document.querySelector("#metrics-table tbody");
    const tableHeaders = document.querySelectorAll("#metrics-table thead th[data-key]");
    const profilesContainer = document.getElementById("model-profiles");
    const metricPlaceholder = document.getElementById("metric-placeholder");

    const monthFormatter = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });
    const currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    });

    const labels = actual.map((point) => monthFormatter.format(new Date(point.date)));
    const actualSeries = actual.map((point) => point.price);

    createModelSelector(modelSelector, models, selectedModelIds, () => {
        updateLineChart();
        updateMetricChart();
        renderMetricsTable();
    });

    createModelProfiles(profilesContainer, models, metricBests);

    let currentSort = { key: "R2", direction: "desc" };

    tableHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const key = header.dataset.key;
            if (!key) return;
            if (currentSort.key === key) {
                currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
            } else {
                currentSort = {
                    key,
                    direction: METRIC_CONFIG.find((config) => config.key === key)?.direction === "max" ? "desc" : "asc"
                };
            }
            renderMetricsTable();
        });
    });

    const priceChart = new Chart(document.getElementById("price-chart"), {
        type: "line",
        data: {
            labels,
            datasets: [createActualDataset(actualSeries)]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: "rgba(226,232,240,0.85)",
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(15,23,42,0.92)",
                    borderColor: "rgba(148,163,184,0.35)",
                    borderWidth: 1,
                    callbacks: {
                        label(context) {
                            const label = context.dataset.label || "";
                            const value = context.parsed.y;
                            return `${label}: ${currencyFormatter.format(value)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "rgba(148,163,184,0.85)" },
                    grid: { color: "rgba(148,163,184,0.15)" }
                },
                y: {
                    ticks: {
                        color: "rgba(148,163,184,0.85)",
                        callback: (value) => `$${value}`
                    },
                    grid: { color: "rgba(148,163,184,0.15)" }
                }
            }
        }
    });

    const metricChart = new Chart(document.getElementById("metric-chart"), {
        type: "radar",
        data: {
            labels: METRIC_CONFIG.map((config) => config.label),
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    min: 0,
                    max: 1,
                    ticks: {
                        display: false
                    },
                    grid: {
                        color: "rgba(148,163,184,0.2)"
                    },
                    angleLines: {
                        color: "rgba(148,163,184,0.15)"
                    },
                    pointLabels: {
                        color: "rgba(226,232,240,0.85)",
                        font: { size: 12 }
                    }
                }
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "rgba(226,232,240,0.85)",
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(15,23,42,0.92)",
                    borderColor: "rgba(148,163,184,0.35)",
                    borderWidth: 1,
                    callbacks: {
                        label(context) {
                            const model = models.find((item) => item.name === context.dataset.label);
                            if (!model) return context.formattedValue;
                            const metricKey = METRIC_CONFIG[context.dataIndex]?.key;
                            if (!metricKey) return context.formattedValue;
                            const rawValue = model.metrics[metricKey];
                            const displayValue = metricKey === "MAPE"
                                ? `${rawValue.toFixed(2)}%`
                                : metricKey === "R2"
                                    ? rawValue.toFixed(3)
                                    : rawValue.toFixed(2);
                            return `${context.dataset.label} – ${metricKey}: ${displayValue}`;
                        }
                    }
                }
            }
        }
    });

    function updateLineChart() {
        const selectedModels = getSelectedModels();
        const datasets = [createActualDataset(actualSeries)];
        selectedModels.forEach((model) => {
            datasets.push({
                label: model.name,
                data: alignPredictions(model.predictions, actual),
                borderColor: model.color,
                backgroundColor: hexToRgba(model.color, 0.1),
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderWidth: 2
            });
        });
        priceChart.data.datasets = datasets;
        priceChart.update("none");
    }

    function updateMetricChart() {
        const selectedModels = getSelectedModels();
        const datasets = selectedModels.map((model) => ({
            label: model.name,
            data: METRIC_CONFIG.map((config) => normalizeMetric(model.metrics[config.key], config.key)),
            borderColor: model.color,
            backgroundColor: hexToRgba(model.color, 0.25),
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2
        }));
        metricChart.data.datasets = datasets;
        metricChart.update("none");
        if (metricPlaceholder) {
            metricPlaceholder.hidden = datasets.length > 0;
        }
    }

    function renderMetricsTable() {
        const sortedModels = [...models].sort((a, b) => compareModels(a, b));
        tableBody.innerHTML = "";
        sortedModels.forEach((model) => {
            const row = document.createElement("tr");
            row.dataset.modelId = model.id;
            if (selectedModelIds.has(model.id)) {
                row.classList.add("is-active");
            }

            const nameCell = document.createElement("th");
            nameCell.scope = "row";
            const nameWrapper = document.createElement("span");
            nameWrapper.className = "table-name";

            const colorChip = document.createElement("span");
            colorChip.className = "table-color";
            colorChip.style.backgroundColor = model.color;

            const nameText = document.createElement("span");
            nameText.textContent = model.name;

            nameWrapper.appendChild(colorChip);
            nameWrapper.appendChild(nameText);
            nameCell.appendChild(nameWrapper);
            row.appendChild(nameCell);

            METRIC_CONFIG.forEach((config) => {
                const value = model.metrics[config.key];
                const cell = document.createElement("td");
                const formatted = config.key === "MAPE"
                    ? `${value.toFixed(2)}%`
                    : config.key === "R2"
                        ? value.toFixed(3)
                        : value.toFixed(2);
                cell.textContent = formatted;
                const tolerance = config.key === "R2" ? 0.0005 : 0.01;
                if (Math.abs(value - metricBests[config.key]) <= tolerance) {
                    cell.classList.add("is-best");
                }
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

        tableHeaders.forEach((header) => {
            const { key } = header.dataset;
            if (!key) {
                header.removeAttribute("aria-sort");
                return;
            }
            if (currentSort.key === key) {
                header.classList.add("is-sorted");
                header.setAttribute("aria-sort", currentSort.direction === "asc" ? "ascending" : "descending");
            } else {
                header.classList.remove("is-sorted");
                header.setAttribute("aria-sort", "none");
            }
        });
    }

    function compareModels(a, b) {
        const { key, direction } = currentSort;
        const valueA = a.metrics[key];
        const valueB = b.metrics[key];
        if (valueA === valueB) return 0;
        const multiplier = direction === "asc" ? 1 : -1;
        return valueA > valueB ? multiplier : -multiplier;
    }

    function getSelectedModels() {
        return models.filter((model) => selectedModelIds.has(model.id));
    }

    function alignPredictions(predictions, referenceSeries) {
        const priceByDate = new Map(predictions.map((point) => [point.date, point.price]));
        return referenceSeries.map((point) => priceByDate.get(point.date) ?? null);
    }

    function createActualDataset(data) {
        return {
            label: "Actual Price",
            data,
            borderColor: "#f8fafc",
            backgroundColor: "rgba(248,250,252,0.1)",
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 4
        };
    }

    function createModelSelector(container, modelList, selectedSet, onChange) {
        container.innerHTML = "";
        modelList.forEach((model, index) => {
            const option = document.createElement("label");
            option.className = "model-option";
            option.style.borderColor = hexToRgba(model.color, 0.35);

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = model.id;
            checkbox.checked = index < 3;
            if (checkbox.checked) {
                selectedSet.add(model.id);
            }
            option.classList.toggle("is-active", checkbox.checked);

            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    selectedSet.add(model.id);
                } else {
                    selectedSet.delete(model.id);
                }
                option.classList.toggle("is-active", checkbox.checked);
                onChange?.();
            });

            const colorBlock = document.createElement("span");
            colorBlock.className = "model-color";
            colorBlock.style.backgroundColor = model.color;

            const textWrapper = document.createElement("div");
            const title = document.createElement("h4");
            title.textContent = model.name;
            const subtitle = document.createElement("p");
            subtitle.textContent = model.technique;

            textWrapper.appendChild(title);
            textWrapper.appendChild(subtitle);

            option.appendChild(checkbox);
            option.appendChild(colorBlock);
            option.appendChild(textWrapper);

            container.appendChild(option);
        });
    }

    function createModelProfiles(container, modelList, bestValues) {
        container.innerHTML = "";
        modelList.forEach((model) => {
            const card = document.createElement("article");
            card.className = "model-card";
            card.style.setProperty("--model-color", model.color);

            const header = document.createElement("div");
            header.className = "model-card__header";
            const title = document.createElement("h3");
            title.textContent = model.name;
            const badge = document.createElement("span");
            badge.textContent = model.technique;
            header.appendChild(title);
            header.appendChild(badge);

            const summary = document.createElement("p");
            summary.textContent = model.summary;

            const metricsBlock = document.createElement("div");
            metricsBlock.className = "model-card__metrics";
            METRIC_CONFIG.forEach((config) => {
                const value = model.metrics[config.key];
                const metricRow = document.createElement("span");
                const label = document.createElement("strong");
                label.textContent = config.key;
                const metricValue = document.createElement("span");
                metricValue.textContent = config.key === "MAPE"
                    ? `${value.toFixed(2)}%`
                    : config.key === "R2"
                        ? value.toFixed(3)
                        : value.toFixed(2);
                if (Math.abs(value - bestValues[config.key]) <= (config.key === "R2" ? 0.0005 : 0.01)) {
                    metricValue.classList.add("is-best");
                }
                metricRow.appendChild(label);
                metricRow.appendChild(metricValue);
                metricsBlock.appendChild(metricRow);
            });

            const bestFor = document.createElement("p");
            bestFor.innerHTML = `<strong>Best for:</strong> ${model.bestFor}`;

            const watchOut = document.createElement("p");
            watchOut.innerHTML = `<strong>Watch out:</strong> ${model.watchOut}`;

            const featureTitle = document.createElement("h4");
            featureTitle.textContent = "Feature highlights";
            const featureList = document.createElement("ul");
            featureList.className = "model-card__list";
            model.features.forEach((feature) => {
                const li = document.createElement("li");
                li.textContent = feature;
                featureList.appendChild(li);
            });

            card.appendChild(header);
            card.appendChild(summary);
            card.appendChild(metricsBlock);
            card.appendChild(bestFor);
            card.appendChild(watchOut);
            card.appendChild(featureTitle);
            card.appendChild(featureList);

            container.appendChild(card);
        });
    }

    function populateDatasetFacts(datasetInfo) {
        const name = document.getElementById("dataset-name");
        const period = document.getElementById("dataset-period");
        const horizon = document.getElementById("dataset-horizon");
        if (name) name.textContent = datasetInfo.name;
        if (period) period.textContent = datasetInfo.period;
        if (horizon) horizon.textContent = datasetInfo.horizon;
    }

    function populateLists(datasetInfo, insights) {
        const featureStack = document.getElementById("feature-stack");
        const workflowSteps = document.getElementById("workflow-steps");
        const insightSummary = document.getElementById("insight-summary");
        const insightList = document.getElementById("insight-list");

        if (featureStack) {
            featureStack.innerHTML = "";
            datasetInfo.featureStack.forEach((feature) => {
                const li = document.createElement("li");
                li.textContent = feature;
                featureStack.appendChild(li);
            });
        }

        if (workflowSteps) {
            workflowSteps.innerHTML = "";
            datasetInfo.workflow.forEach((step) => {
                const li = document.createElement("li");
                li.textContent = step;
                workflowSteps.appendChild(li);
            });
        }

        if (insightSummary) {
            insightSummary.innerHTML = "";
            datasetInfo.insightSummary.forEach((item) => {
                const li = document.createElement("li");
                li.textContent = item;
                insightSummary.appendChild(li);
            });
        }

        if (insightList) {
            insightList.innerHTML = "";
            insights.forEach((item) => {
                const li = document.createElement("li");
                li.textContent = item;
                insightList.appendChild(li);
            });
        }
    }

    function computeMetricRanges(modelList) {
        return METRIC_CONFIG.reduce((acc, config) => {
            const values = modelList.map((model) => model.metrics[config.key]);
            acc[config.key] = {
                min: Math.min(...values),
                max: Math.max(...values),
                direction: config.direction
            };
            return acc;
        }, {});
    }

    function computeMetricBests(modelList) {
        return METRIC_CONFIG.reduce((acc, config) => {
            const values = modelList.map((model) => model.metrics[config.key]);
            acc[config.key] = config.direction === "max" ? Math.max(...values) : Math.min(...values);
            return acc;
        }, {});
    }

    function normalizeMetric(value, key) {
        const range = metricRanges[key];
        if (!range) return value;
        const { min, max, direction } = range;
        if (Math.abs(max - min) < Number.EPSILON) return 1;
        if (direction === "max") {
            return (value - min) / (max - min);
        }
        return (max - value) / (max - min);
    }

    function hexToRgba(hex, alpha = 1) {
        let parsedHex = hex.replace("#", "");
        if (parsedHex.length === 3) {
            parsedHex = parsedHex.split("").map((char) => char + char).join("");
        }
        const bigint = parseInt(parsedHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    updateLineChart();
    updateMetricChart();
    renderMetricsTable();
});
