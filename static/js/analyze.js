/**
 * Analysis Form Controller.
 * Manages preset loading, client validation, simulated execution steps, and submission.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("packaging-analysis-form");
  const presetSelect = document.getElementById("preset-select");
  const presetBanner = document.getElementById("preset-loaded-banner");
  const submitBtn = document.getElementById("submit-analysis-btn");

  if (!form) return;

  // 1. Fetch presets on page load
  try {
    const data = await API.getPresets();
    if (data && data.presets && presetSelect) {
      data.presets.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.food_id;
        opt.textContent = `${p.food_name} (${p.category})`;
        opt.dataset.preset = JSON.stringify(p);
        presetSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn("Could not load presets:", err.message);
  }

  // 2. Handle Preset Selection
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      const selectedOpt = presetSelect.options[presetSelect.selectedIndex];
      if (!selectedOpt || !selectedOpt.dataset.preset) {
        if (presetBanner) presetBanner.style.display = "none";
        return;
      }

      const p = JSON.parse(selectedOpt.dataset.preset);

      // Populate form fields
      setVal("food_id", p.food_id);
      setVal("food_name", p.food_name);
      setVal("category", p.category);
      setVal("moisture", p.moisture);
      setVal("fat", p.fat);
      setVal("ph", p.ph);
      setVal("respiration_rate", p.respiration_rate);
      setVal("storage_temperature", p.storage_temperature);
      setVal("storage_rh", p.storage_rh);
      setVal("target_shelf_life", p.target_shelf_life);
      setVal("oxygen_sensitivity", p.oxygen_sensitivity);
      setVal("moisture_sensitivity", p.moisture_sensitivity);
      setVal("light_sensitivity", p.light_sensitivity);

      // Clear previous validation errors
      clearValidationErrors();

      // Show clear preset banner
      if (presetBanner) {
        presetBanner.textContent = `Preset loaded: ${p.food_name}. You may adjust any parameter below.`;
        presetBanner.style.display = "block";
      }

      UI.showToast(`Loaded preset: ${p.food_name}`, "success");
    });
  }

  // 3. Client-side Validation Helper
  function validateForm() {
    clearValidationErrors();
    let isValid = true;

    function markError(fieldId, msg) {
      const input = document.getElementById(fieldId);
      const group = input ? input.closest(".form-group") : null;
      if (group) {
        group.classList.add("has-error");
        let errSpan = group.querySelector(".field-error");
        if (!errSpan) {
          errSpan = document.createElement("div");
          errSpan.className = "field-error";
          group.appendChild(errSpan);
        }
        errSpan.textContent = msg;
      }
      isValid = false;
    }

    const name = getVal("food_name").trim();
    if (name.length < 2) markError("food_name", "Food commodity name must be at least 2 characters.");

    const category = getVal("category");
    if (!category) markError("category", "Please select a valid food category.");

    const moisture = parseFloat(getVal("moisture"));
    if (isNaN(moisture) || moisture < 0 || moisture > 100) {
      markError("moisture", "Moisture must be between 0.0% and 100.0%.");
    }

    const fat = parseFloat(getVal("fat"));
    if (isNaN(fat) || fat < 0 || fat > 100) {
      markError("fat", "Fat must be between 0.0% and 100.0%.");
    }

    if (!isNaN(moisture) && !isNaN(fat) && (moisture + fat > 100)) {
      markError("fat", `Combined moisture (${moisture}%) and fat (${fat}%) cannot exceed 100.0%.`);
    }

    const ph = parseFloat(getVal("ph"));
    if (isNaN(ph) || ph < 1.0 || ph > 14.0) {
      markError("ph", "pH must be between 1.0 and 14.0.");
    }

    const temp = parseFloat(getVal("storage_temperature"));
    if (isNaN(temp) || temp < -40 || temp > 60) {
      markError("storage_temperature", "Temperature must be between -40°C and 60°C.");
    }

    const rh = parseFloat(getVal("storage_rh"));
    if (isNaN(rh) || rh < 0 || rh > 100) {
      markError("storage_rh", "Relative Humidity must be between 0% and 100%.");
    }

    const shelfLife = parseInt(getVal("target_shelf_life"), 10);
    if (isNaN(shelfLife) || shelfLife < 1 || shelfLife > 3650) {
      markError("target_shelf_life", "Shelf life must be between 1 and 3650 days.");
    }

    return isValid;
  }

  function clearValidationErrors() {
    document.querySelectorAll(".form-group.has-error").forEach(el => {
      el.classList.remove("has-error");
    });
  }

  // 4. Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      UI.showToast("Please correct highlighted fields before analyzing.", "error");
      return;
    }

    const payload = {
      food_name: getVal("food_name"),
      category: getVal("category"),
      moisture: parseFloat(getVal("moisture")),
      fat: parseFloat(getVal("fat")),
      ph: parseFloat(getVal("ph")),
      respiration_rate: getVal("respiration_rate"),
      storage_temperature: parseFloat(getVal("storage_temperature")),
      storage_rh: parseFloat(getVal("storage_rh")),
      target_shelf_life: parseInt(getVal("target_shelf_life"), 10),
      storage_type: getVal("storage_type") || "Ambient",
      transport_condition: getVal("transport_condition") || "Standard Ambient",
      oxygen_sensitivity: getVal("oxygen_sensitivity"),
      moisture_sensitivity: getVal("moisture_sensitivity"),
      light_sensitivity: getVal("light_sensitivity"),
    };

    const foodIdVal = getVal("food_id");
    if (foodIdVal) payload.food_id = parseInt(foodIdVal, 10);

    // Disable submit button during processing
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Analyzing...";
    }

    const analysisSteps = [
      "Analyzing food chemical & biological properties",
      "Evaluating oxygen & moisture degradation risks",
      "Checking storage environment & temperature limits",
      "Filtering candidate packaging materials via Rule Engine",
      "Computing multi-criteria compatibility scores",
    ];

    try {
      await UI.simulateAnalysisProgress(analysisSteps, async () => {
        const result = await API.analyzePackaging(payload);
        // Persist result to sessionStorage for results page
        sessionStorage.setItem("last_packaging_result", JSON.stringify(result));
        window.location.href = "/results";
      });
    } catch (err) {
      UI.showToast(err.message, "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Analyze Packaging Requirements";
      }
    }
  });

  // Helpers
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = (val !== null && val !== undefined) ? val : "";
  }
});
