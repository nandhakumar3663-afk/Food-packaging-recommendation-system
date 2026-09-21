/**
 * Real-Time IoT Storage Monitor Controller.
 * Handles lightweight polling (every 5s), metric updates, condition evaluation,
 * SVG history trend plotting, offline detection, and reassessment workflow.
 */

document.addEventListener("DOMContentLoaded", async function() {
  const selectAnalysis = document.getElementById("select-analysis");
  const btnRefresh = document.getElementById("btn-refresh-monitor");
  const btnReassess = document.getElementById("btn-reassess");
  const lastUpdatedText = document.getElementById("last-updated-text");
  const offlineAlert = document.getElementById("offline-alert");

  // Metrics
  const tempVal = document.getElementById("metric-temp-val");
  const tempBase = document.getElementById("metric-temp-baseline");
  const tempBadge = document.getElementById("metric-temp-badge");

  const humVal = document.getElementById("metric-hum-val");
  const humBase = document.getElementById("metric-hum-baseline");
  const humBadge = document.getElementById("metric-hum-badge");

  const co2Val = document.getElementById("metric-co2-val");
  const co2Badge = document.getElementById("metric-co2-badge");

  const condTitle = document.getElementById("condition-status-title");
  const condDesc = document.getElementById("condition-desc-text");
  const condPill = document.getElementById("condition-pill");
  const condIcon = document.getElementById("condition-icon");
  const cardCond = document.getElementById("card-condition-state");

  // Comparison
  const compBadge = document.getElementById("comp-analysis-badge");
  const compFoodName = document.getElementById("comp-food-name");
  const compTarget = document.getElementById("comp-target-cond");
  const compObserved = document.getElementById("comp-observed-cond");
  const compRecMat = document.getElementById("comp-rec-material");
  const advisoryHeading = document.getElementById("advisory-heading");
  const advisoryText = document.getElementById("advisory-text");
  const advisoryBox = document.getElementById("advisory-callout-box");

  // Device & Provenance
  const deviceBadge = document.getElementById("device-status-badge");
  const sourceBadge = document.getElementById("data-source-badge");
  const rawDeviceId = document.getElementById("raw-device-id");
  const rawSource = document.getElementById("raw-source-text");
  const rawSignal = document.getElementById("raw-signal-text");
  const rawJson = document.getElementById("raw-json-payload");

  // SVG Chart
  const svgChart = document.getElementById("telemetry-chart");
  const chartEmpty = document.getElementById("chart-empty-msg");

  let currentAnalysisId = null;
  let activeAnalysisData = null;
  let latestReadingData = null;
  let pollingInterval = null;
  let lastFetchTimestamp = Date.now();

  // 1. Check URL parameters for analysis ID
  const urlParams = new URLSearchParams(window.location.search);
  const paramAnalysisId = urlParams.get("analysis_id");
  if (paramAnalysisId) {
    currentAnalysisId = parseInt(paramAnalysisId, 10);
  }

  // 2. Load available analyses into dropdown
  try {
    const historyRes = await ApiClient.getHistory(30);
    if (historyRes && historyRes.success && Array.isArray(historyRes.history)) {
      historyRes.history.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.recommendation_id;
        opt.textContent = `#${item.recommendation_id} - ${item.food_name} (${item.material_name})`;
        if (currentAnalysisId && item.recommendation_id === currentAnalysisId) {
          opt.selected = true;
        }
        selectAnalysis.appendChild(opt);
      });
      if (!currentAnalysisId && historyRes.history.length > 0) {
        currentAnalysisId = historyRes.history[0].recommendation_id;
        selectAnalysis.value = currentAnalysisId;
      }
    }
  } catch (err) {
    console.warn("Could not populate analysis dropdown:", err);
  }

  // 3. Telemetry Fetch & Update Function
  async function fetchTelemetry() {
    try {
      let data = null;
      if (currentAnalysisId) {
        data = await ApiClient.getIoTAnalysis(currentAnalysisId);
      } else {
        data = await ApiClient.getIoTLatest();
      }

      lastFetchTimestamp = Date.now();
      updateDashboardUI(data);

      // Fetch history for chart
      const histParams = { limit: 25 };
      if (currentAnalysisId) histParams.analysis_id = currentAnalysisId;
      const histRes = await ApiClient.getIoTReadings(histParams);
      if (histRes && histRes.success && histRes.readings) {
        renderSvgChart(histRes.readings);
      }
    } catch (err) {
      console.error("Telemetry fetch failed:", err);
      lastUpdatedText.textContent = "Connection error • Retrying...";
    }
  }

  // 4. Update Dashboard UI
  function updateDashboardUI(res) {
    if (!res || !res.success) {
      handleNoDataState();
      return;
    }

    const reading = res.latest_reading || res.reading;
    const assessment = res.assessment || {};
    const analysis = res.analysis || null;
    activeAnalysisData = analysis;
    latestReadingData = reading;

    // Check offline status
    if (!reading) {
      handleNoDataState();
      return;
    }

    // Check reading age
    const readingTime = new Date(reading.timestamp).getTime();
    const ageSeconds = Math.max(0, Math.floor((Date.now() - readingTime) / 1000));
    const isOffline = ageSeconds > 60;

    if (isOffline) {
      offlineAlert.style.display = "flex";
      deviceBadge.textContent = `${reading.device_id || "ESP32"} (OFFLINE)`;
      deviceBadge.className = "badge badge-warning";
    } else {
      offlineAlert.style.display = "none";
      deviceBadge.textContent = `${reading.device_id || "ESP32"} (ONLINE)`;
      deviceBadge.className = "badge badge-green";
    }

    lastUpdatedText.textContent = `Updated ${ageSeconds}s ago (${reading.timestamp || "recent"})`;

    // Data Source Badge
    if (reading.source && reading.source.includes("SIMULATED")) {
      sourceBadge.textContent = "Simulated Sensor Data";
      sourceBadge.className = "badge badge-warning";
    } else {
      sourceBadge.textContent = "Sensor Observation";
      sourceBadge.className = "badge badge-info";
    }

    // 1. Temperature Card
    tempVal.textContent = parseFloat(reading.temperature).toFixed(1);
    if (assessment.baseline && assessment.baseline.target_temperature !== undefined) {
      tempBase.textContent = `Analysis Target: ${assessment.baseline.target_temperature}°C (Δ ${assessment.deviations.temperature_delta > 0 ? '+' : ''}${assessment.deviations.temperature_delta}°C)`;
    } else {
      tempBase.textContent = "Analysis Target: Ambient baseline";
    }
    tempBadge.textContent = assessment.temp_status || "NORMAL";
    tempBadge.className = getStatusBadgeClass(assessment.temp_status);

    // 2. Humidity Card
    humVal.textContent = parseFloat(reading.humidity).toFixed(1);
    if (assessment.baseline && assessment.baseline.target_humidity !== undefined) {
      humBase.textContent = `Analysis Target: ${assessment.baseline.target_humidity}% RH (Δ ${assessment.deviations.humidity_delta > 0 ? '+' : ''}${assessment.deviations.humidity_delta}%)`;
    } else {
      humBase.textContent = "Analysis Target: Ambient baseline";
    }
    humBadge.textContent = assessment.humidity_status || "NORMAL";
    humBadge.className = getStatusBadgeClass(assessment.humidity_status);

    // 3. CO2 Card
    if (reading.co2 !== null && reading.co2 !== undefined) {
      co2Val.textContent = `${Math.round(reading.co2)} ppm`;
      co2Badge.textContent = "Sensor Active";
      co2Badge.className = "badge badge-green";
    } else {
      co2Val.textContent = "Sensor Unavailable";
      co2Badge.textContent = "Not Installed";
      co2Badge.className = "badge badge-neutral";
    }

    // 4. Condition State Card
    const status = assessment.status || "NORMAL";
    condTitle.textContent = status;
    condPill.textContent = status;
    condPill.className = getStatusBadgeClass(status);
    condDesc.textContent = assessment.condition_label || "Storage conditions evaluated.";

    if (status === "WARNING") {
      condIcon.textContent = "🔴";
      cardCond.style.borderTopColor = "#ef4444";
      condTitle.style.color = "#b91c1c";
    } else if (status === "WATCH") {
      condIcon.textContent = "🟡";
      cardCond.style.borderTopColor = "#f59e0b";
      condTitle.style.color = "#b45309";
    } else if (status === "NORMAL") {
      condIcon.textContent = "🟢";
      cardCond.style.borderTopColor = "var(--primary-green)";
      condTitle.style.color = "var(--dark-green)";
    } else {
      condIcon.textContent = "⚪";
      cardCond.style.borderTopColor = "var(--border)";
      condTitle.style.color = "var(--text-muted)";
    }

    // 5. Comparison Card
    if (assessment.baseline && assessment.baseline.analysis_id) {
      compBadge.textContent = `Linked to Analysis #${assessment.baseline.analysis_id}`;
      compFoodName.textContent = assessment.baseline.food_name || "Custom Food";
      compTarget.textContent = `${assessment.baseline.target_temperature}°C / ${assessment.baseline.target_humidity}% RH (${assessment.baseline.storage_type})`;
      compObserved.textContent = `${reading.temperature}°C / ${reading.humidity}% RH`;
      compRecMat.textContent = analysis ? analysis.material_name : "Evaluated Material";
      advisoryHeading.textContent = assessment.condition_label || "Condition Assessment";
      advisoryText.textContent = assessment.action_advisory || assessment.reason;

      if (status === "WARNING") {
        advisoryBox.style.borderLeftColor = "#ef4444";
      } else if (status === "WATCH") {
        advisoryBox.style.borderLeftColor = "#f59e0b";
      } else {
        advisoryBox.style.borderLeftColor = "var(--primary-green)";
      }
    } else {
      compBadge.textContent = "General Telemetry (Unlinked)";
      compFoodName.textContent = "Select an analysis above to compare";
      compTarget.textContent = "Standard 20°C / 60% RH";
      compObserved.textContent = `${reading.temperature}°C / ${reading.humidity}% RH`;
      compRecMat.textContent = "N/A";
      advisoryHeading.textContent = "General Storage Condition";
      advisoryText.textContent = assessment.action_advisory || "Telemetry is active.";
    }

    // 6. Raw Drawer
    rawDeviceId.textContent = reading.device_id || "ESP32";
    rawSource.textContent = reading.source || "SENSOR OBSERVATION";
    rawSignal.textContent = reading.signal_quality ? `${reading.signal_quality} dBm` : "N/A";
    rawJson.textContent = JSON.stringify(reading, null, 2);
  }

  function handleNoDataState() {
    tempVal.textContent = "--";
    humVal.textContent = "--";
    co2Val.textContent = "Sensor Unavailable";
    condTitle.textContent = "NO DATA";
    condPill.textContent = "UNKNOWN";
    condPill.className = "badge badge-neutral";
    condDesc.textContent = "No telemetry received yet.";
    offlineAlert.style.display = "flex";
    lastUpdatedText.textContent = "Awaiting first sensor packet...";
  }

  function getStatusBadgeClass(status) {
    if (status === "WARNING") return "badge badge-error";
    if (status === "WATCH") return "badge badge-warning";
    if (status === "NORMAL") return "badge badge-green";
    return "badge badge-neutral";
  }

  // 5. SVG Chart Renderer
  function renderSvgChart(readings) {
    if (!readings || readings.length === 0) {
      chartEmpty.style.display = "flex";
      svgChart.innerHTML = "";
      return;
    }

    chartEmpty.style.display = "none";
    const width = svgChart.clientWidth || 800;
    const height = svgChart.clientHeight || 200;
    const padding = { top: 20, right: 30, bottom: 25, left: 40 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const temps = readings.map(r => r.temperature);
    const hums = readings.map(r => r.humidity);

    const minTemp = Math.min(...temps, 0);
    const maxTemp = Math.max(...temps, 30);
    const minHum = 0;
    const maxHum = 100;

    const n = readings.length;
    const getX = i => padding.left + (i / Math.max(1, n - 1)) * chartW;
    const getYTemp = t => padding.top + chartH - ((t - minTemp) / Math.max(1, maxTemp - minTemp)) * chartH;
    const getYHum = h => padding.top + chartH - ((h - minHum) / (maxHum - minHum)) * chartH;

    // Build SVG paths
    let tempPoints = "";
    let humPoints = "";
    readings.forEach((r, i) => {
      const x = getX(i);
      const yt = getYTemp(r.temperature);
      const yh = getYHum(r.humidity);
      tempPoints += `${i === 0 ? "M" : "L"} ${x} ${yt} `;
      humPoints += `${i === 0 ? "M" : "L"} ${x} ${yh} `;
    });

    svgChart.innerHTML = `
      <!-- Grid lines -->
      <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#e2e8f0" stroke-dasharray="3,3" />
      <line x1="${padding.left}" y1="${padding.top + chartH/2}" x2="${width - padding.right}" y2="${padding.top + chartH/2}" stroke="#e2e8f0" stroke-dasharray="3,3" />
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#cbd5e1" />

      <!-- Paths -->
      <path d="${humPoints}" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" />
      <path d="${tempPoints}" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" />

      <!-- End Point Dots -->
      ${n > 0 ? `
        <circle cx="${getX(n-1)}" cy="${getYTemp(temps[n-1])}" r="4" fill="#16a34a" />
        <circle cx="${getX(n-1)}" cy="${getYHum(hums[n-1])}" r="4" fill="#0ea5e9" />
      ` : ''}
    `;
  }

  // 6. Reassess Conditions Handler
  if (btnReassess) {
    btnReassess.addEventListener("click", async () => {
      if (!latestReadingData) {
        UI.showToast("No active sensor reading available to reassess.", "warning");
        return;
      }

      if (!currentAnalysisId) {
        UI.showToast("Please link to an existing analysis first to reassess its conditions.", "info");
        return;
      }

      try {
        const histRes = await ApiClient.getHistoryById(currentAnalysisId);
        if (!histRes || !histRes.success || !histRes.recommendation) {
          UI.showToast("Could not retrieve original analysis parameters.", "error");
          return;
        }

        const orig = histRes.recommendation;
        let snap = {};
        try {
          snap = typeof orig.input_snapshot === "string" ? JSON.parse(orig.input_snapshot) : (orig.input_snapshot || {});
        } catch (e) {}

        // Construct new payload blending original food profile with CURRENT real-world temperature & humidity
        const newPayload = {
          food_name: orig.food_name,
          category: orig.category,
          moisture: snap.moisture !== undefined ? snap.moisture : 50,
          fat: snap.fat !== undefined ? snap.fat : 5,
          ph: snap.ph !== undefined ? snap.ph : 6.0,
          respiration_rate: snap.respiration_rate || "None",
          target_shelf_life: snap.target_shelf_life || 30,
          storage_temperature: parseFloat(latestReadingData.temperature), // REAL SENSOR VALUE
          storage_rh: parseFloat(latestReadingData.humidity),             // REAL SENSOR VALUE
          storage_type: snap.storage_type || "Ambient",
          transport_condition: snap.transport_condition || "Standard Ambient",
          oxygen_sensitivity: snap.oxygen_sensitivity || "Medium",
          moisture_sensitivity: snap.moisture_sensitivity || "Medium",
          light_sensitivity: snap.light_sensitivity || "Low",
          preference_profile: snap.preference_profile || "balanced",
        };

        UI.showToast("Submitting new recommendation with observed real-time conditions...", "info");

        const analysisRes = await ApiClient.analyzePackaging(newPayload);
        if (analysisRes && analysisRes.success) {
          sessionStorage.setItem("last_packaging_result", JSON.stringify(analysisRes));
          window.location.href = "/results";
        } else {
          UI.showToast("Reassessment failed: " + (analysisRes.error || "Unknown error"), "error");
        }
      } catch (err) {
        console.error("Reassessment error:", err);
        UI.showToast("Could not complete reassessment.", "error");
      }
    });
  }

  // 7. Event Listeners
  selectAnalysis.addEventListener("change", () => {
    currentAnalysisId = selectAnalysis.value ? parseInt(selectAnalysis.value, 10) : null;
    fetchTelemetry();
  });

  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      fetchTelemetry();
      UI.showToast("Telemetry refreshed.", "info");
    });
  }

  // Accordion Toggle
  const btnToggleDevice = document.getElementById("btn-toggle-device");
  const contentDevice = document.getElementById("content-device");
  const deviceIcon = document.getElementById("device-accordion-icon");
  if (btnToggleDevice && contentDevice) {
    btnToggleDevice.addEventListener("click", () => {
      const isOpen = contentDevice.style.display === "block";
      contentDevice.style.display = isOpen ? "none" : "block";
      if (deviceIcon) deviceIcon.textContent = isOpen ? "+" : "−";
    });
  }

  // 8. Start Polling Loop (every 5 seconds)
  fetchTelemetry();
  pollingInterval = setInterval(fetchTelemetry, 5000);

  window.addEventListener("beforeunload", () => {
    if (pollingInterval) clearInterval(pollingInterval);
  });
});
