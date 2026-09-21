/**
 * Analysis Form Wizard & Preset Handling (Step 1-4).
 * Enforces client-side validation, smooth step navigation, and API submission.
 */

document.addEventListener("DOMContentLoaded", async function() {
  const form = document.getElementById("analyze-form");
  const presetSelect = document.getElementById("preset-select");
  const btnLoadPreset = document.getElementById("btn-load-preset");
  const presetStatus = document.getElementById("preset-status");

  let currentStep = 1;
  const totalSteps = 4;
  let presetsData = [];

  // =========================================================================
  // 1. Load Food Presets from Backend API
  // =========================================================================
  try {
    const res = await ApiClient.getPresets();
    if (res && res.success && res.presets) {
      presetsData = res.presets;
      presetsData.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.food_id;
        opt.textContent = `${p.food_name} (${p.category})`;
        presetSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn("Could not load presets:", err);
  }

  // Handle Preset Selection
  function applyPreset() {
    const selectedId = parseInt(presetSelect.value, 10);
    const preset = presetsData.find(p => p.food_id === selectedId);
    if (!preset) return;

    document.getElementById("food_name").value = preset.food_name || "";
    document.getElementById("category").value = preset.category || "";
    document.getElementById("moisture").value = preset.moisture !== undefined ? preset.moisture : 50;
    document.getElementById("fat").value = preset.fat !== undefined ? preset.fat : 5;
    document.getElementById("ph").value = preset.ph !== undefined ? preset.ph : 6.0;
    document.getElementById("respiration_rate").value = preset.respiration_rate || "None";
    document.getElementById("target_shelf_life").value = preset.target_shelf_life || 30;
    document.getElementById("storage_temperature").value = preset.storage_temperature !== undefined ? preset.storage_temperature : 20;
    document.getElementById("storage_rh").value = preset.storage_rh !== undefined ? preset.storage_rh : 60;
    document.getElementById("oxygen_sensitivity").value = preset.oxygen_sensitivity || "Medium";
    document.getElementById("moisture_sensitivity").value = preset.moisture_sensitivity || "Medium";
    document.getElementById("light_sensitivity").value = preset.light_sensitivity || "Low";

    if (presetStatus) {
      presetStatus.style.display = "inline-flex";
    }
    UI.showToast(`Loaded preset for ${preset.food_name}`, "info");
  }

  if (btnLoadPreset) btnLoadPreset.addEventListener("click", applyPreset);
  if (presetSelect) presetSelect.addEventListener("change", applyPreset);

  // =========================================================================
  // 2. Step Wizard Navigation
  // =========================================================================
  function updateStepUI(step) {
    currentStep = step;

    // Toggle form steps
    document.querySelectorAll(".form-step").forEach(el => {
      const stepNum = parseInt(el.getAttribute("data-step"), 10);
      el.classList.toggle("active", stepNum === currentStep);
    });

    // Update wizard indicators
    for (let i = 1; i <= totalSteps; i++) {
      const ind = document.getElementById(`step-indicator-i`.replace("i", i));
      if (!ind) continue;
      ind.classList.remove("active", "completed");
      if (i === currentStep) {
        ind.classList.add("active");
      } else if (i < currentStep) {
        ind.classList.add("completed");
      }
    }

    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  // Next Step Handlers
  document.querySelectorAll(".next-step").forEach(btn => {
    btn.addEventListener("click", () => {
      const nextStep = parseInt(btn.getAttribute("data-next"), 10);
      if (validateCurrentStep(currentStep)) {
        updateStepUI(nextStep);
      }
    });
  });

  // Previous Step Handlers
  document.querySelectorAll(".prev-step").forEach(btn => {
    btn.addEventListener("click", () => {
      const prevStep = parseInt(btn.getAttribute("data-prev"), 10);
      updateStepUI(prevStep);
    });
  });

  // =========================================================================
  // 3. Client-Side Validation
  // =========================================================================
  function showError(fieldId, msg) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    }
    if (inputEl) {
      inputEl.classList.add("input-error");
    }
  }

  function clearError(fieldId) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    }
    if (inputEl) {
      inputEl.classList.remove("input-error");
    }
  }

  function validateCurrentStep(step) {
    let isValid = true;

    if (step === 1) {
      const foodName = document.getElementById("food_name").value.trim();
      const category = document.getElementById("category").value;

      clearError("food_name");
      clearError("category");

      if (!foodName) {
        showError("food_name", "Please enter a food name.");
        isValid = false;
      }
      if (!category) {
        showError("category", "Please select a food category.");
        isValid = false;
      }
    } else if (step === 2) {
      const moisture = parseFloat(document.getElementById("moisture").value);
      const fat = parseFloat(document.getElementById("fat").value);
      const ph = parseFloat(document.getElementById("ph").value);

      clearError("moisture");
      clearError("fat");
      clearError("ph");

      if (isNaN(moisture) || moisture < 0 || moisture > 100) {
        showError("moisture", "Moisture must be between 0 and 100%.");
        isValid = false;
      }
      if (isNaN(fat) || fat < 0 || fat > 100) {
        showError("fat", "Fat must be between 0 and 100%.");
        isValid = false;
      }
      if (!isNaN(moisture) && !isNaN(fat) && (moisture + fat > 100)) {
        showError("moisture", "Sum of Moisture and Fat cannot exceed 100%.");
        showError("fat", "Sum of Moisture and Fat cannot exceed 100%.");
        isValid = false;
      }
      if (isNaN(ph) || ph < 1.0 || ph > 14.0) {
        showError("ph", "pH must be between 1.0 and 14.0.");
        isValid = false;
      }
    } else if (step === 3) {
      const shelfLife = parseInt(document.getElementById("target_shelf_life").value, 10);
      const temp = parseFloat(document.getElementById("storage_temperature").value);
      const rh = parseFloat(document.getElementById("storage_rh").value);

      clearError("target_shelf_life");
      clearError("storage_temperature");
      clearError("storage_rh");

      if (isNaN(shelfLife) || shelfLife <= 0) {
        showError("target_shelf_life", "Target shelf life must be at least 1 day.");
        isValid = false;
      }
      if (isNaN(temp) || temp < -30 || temp > 60) {
        showError("storage_temperature", "Temperature must be between -30°C and 60°C.");
        isValid = false;
      }
      if (isNaN(rh) || rh < 10 || rh > 100) {
        showError("storage_rh", "Relative humidity must be between 10% and 100%.");
        isValid = false;
      }
    }

    if (!isValid) {
      UI.showToast("Some information needs to be corrected in the highlighted fields.", "warning");
    }

    return isValid;
  }

  // =========================================================================
  // 4. Form Submission & API Integration
  // =========================================================================
  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    // Verify all steps before final submission
    for (let s = 1; s <= totalSteps; s++) {
      if (!validateCurrentStep(s)) {
        updateStepUI(s);
        return;
      }
    }

    const profileRadio = document.querySelector('input[name="preference_profile"]:checked');
    const preferenceProfile = profileRadio ? profileRadio.value : "balanced";

    const payload = {
      food_name: document.getElementById("food_name").value.trim(),
      category: document.getElementById("category").value,
      moisture: parseFloat(document.getElementById("moisture").value),
      fat: parseFloat(document.getElementById("fat").value),
      ph: parseFloat(document.getElementById("ph").value),
      respiration_rate: document.getElementById("respiration_rate").value,
      target_shelf_life: parseInt(document.getElementById("target_shelf_life").value, 10),
      storage_temperature: parseFloat(document.getElementById("storage_temperature").value),
      storage_rh: parseFloat(document.getElementById("storage_rh").value),
      storage_type: document.getElementById("storage_type").value,
      transport_condition: document.getElementById("transport_condition").value,
      oxygen_sensitivity: document.getElementById("oxygen_sensitivity").value,
      moisture_sensitivity: document.getElementById("moisture_sensitivity").value,
      light_sensitivity: document.getElementById("light_sensitivity").value,
      preference_profile: preferenceProfile,
    };

    const submitBtn = document.getElementById("btn-submit-analysis");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Analyzing...";
    }

    try {
      await UI.simulateAnalysisProgress(async () => {
        const response = await ApiClient.analyze(payload);
        if (response && response.success) {
          sessionStorage.setItem("last_packaging_result", JSON.stringify(response));
          window.location.href = "/results";
        } else {
          const errList = response.errors ? response.errors.join("; ") : "Invalid submission.";
          UI.showToast(`Analysis error: ${errList}`, "error");
        }
      });
    } catch (err) {
      console.error("Submission failed:", err);
      UI.showToast("We couldn't complete the analysis right now. Please check connection and try again.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "<span>🚀</span> Analyze Packaging";
      }
    }
  });
});
