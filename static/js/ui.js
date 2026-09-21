/**
 * UI Helper module for notifications, formatters, and progressive loading simulation.
 */

const UI = {
  /**
   * Display a non-intrusive toast notification.
   */
  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  /**
   * Simulated progressive loading modal matching backend analysis steps.
   */
  async simulateAnalysisProgress(steps, callback) {
    const overlay = document.getElementById("loading-overlay");
    const stepList = document.getElementById("loading-steps");
    if (!overlay || !stepList) {
      if (callback) await callback();
      return;
    }

    stepList.innerHTML = "";
    steps.forEach((stepText, index) => {
      const item = document.createElement("div");
      item.className = "step-item";
      item.id = `step-item-${index}`;
      item.innerHTML = `<span class="step-icon">○</span> <span>${stepText}</span>`;
      stepList.appendChild(item);
    });

    overlay.classList.add("active");

    // Progressive step advancement
    for (let i = 0; i < steps.length; i++) {
      const currentItem = document.getElementById(`step-item-${i}`);
      if (currentItem) {
        currentItem.classList.add("active");
        currentItem.querySelector(".step-icon").textContent = "◐";
      }

      await new Promise(r => setTimeout(r, 140));

      if (currentItem) {
        currentItem.classList.remove("active");
        currentItem.classList.add("completed");
        currentItem.querySelector(".step-icon").textContent = "✓";
      }
    }

    if (callback) {
      await callback();
    }

    overlay.classList.remove("active");
  },

  /**
   * Return formatted provenance badge HTML.
   */
  getProvenanceBadge(source) {
    const isSynthetic = (source || "").toUpperCase().includes("SYNTHETIC");
    if (isSynthetic) {
      return '<span class="badge badge-synthetic">Synthetic Demonstration Data</span>';
    }
    return '<span class="badge badge-literature">Literature-Backed</span>';
  },

  /**
   * Return color-coded score class.
   */
  getScoreColorClass(score) {
    if (score >= 80) return "score-fill-high";
    if (score >= 50) return "score-fill-mid";
    return "score-fill-low";
  },
};

window.UI = UI;
