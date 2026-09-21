/**
 * UI Helper module for notifications, tooltips, accordions, and progressive loading simulation.
 * Fresh, accessible Light-Green design system.
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
      container.className = "toast-container";
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
   * Progressive loading simulation matching backend analysis pipeline.
   */
  async simulateAnalysisProgress(callback) {
    const modal = document.getElementById("loading-modal");
    const steps = [
      { id: "p-step-1", text: "Checking food characteristics" },
      { id: "p-step-2", text: "Checking storage requirements" },
      { id: "p-step-3", text: "Filtering unsuitable materials with safety rules" },
      { id: "p-step-4", text: "Machine-learning candidate assessment" },
      { id: "p-step-5", text: "Evaluating packaging compatibility" },
      { id: "p-step-6", text: "Preparing your recommendation" },
    ];

    if (!modal) {
      if (callback) await callback();
      return;
    }

    // Reset steps
    steps.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) {
        el.className = "progress-step-item";
        el.innerHTML = `<span>○</span> ${s.text}`;
      }
    });

    modal.classList.add("active");

    for (let i = 0; i < steps.length; i++) {
      const el = document.getElementById(steps[i].id);
      if (el) {
        el.className = "progress-step-item active";
        el.innerHTML = `<span>◐</span> ${steps[i].text}`;
      }
      await new Promise(r => setTimeout(r, 120));
      if (el) {
        el.className = "progress-step-item done";
        el.innerHTML = `<span style="color: var(--primary-green); font-weight: bold;">✓</span> ${steps[i].text}`;
      }
    }

    if (callback) {
      await callback();
    }

    modal.classList.remove("active");
  },

  /**
   * Return formatted provenance badge HTML.
   */
  getProvenanceBadge(source) {
    const isSynthetic = (source || "").toUpperCase().includes("SYNTHETIC");
    if (isSynthetic) {
      return '<span class="badge badge-warning">Synthetic Demonstration Data</span>';
    }
    return '<span class="badge badge-green">Literature-Backed</span>';
  },

  /**
   * Initialize global listeners for tooltips, accordions, and mobile navigation.
   */
  initGlobalComponents() {
    // Mobile navigation toggle
    const toggleBtn = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener("click", () => {
        const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", !isExpanded);
        navMenu.style.display = isExpanded ? "none" : "flex";
        navMenu.style.flexDirection = "column";
        navMenu.style.gap = "0.75rem";
      });
    }

    // Generic accordion handlers
    document.querySelectorAll(".accordion-header").forEach(header => {
      header.addEventListener("click", () => {
        const parent = header.closest(".accordion");
        if (parent) {
          parent.classList.toggle("open");
          const icon = header.querySelector("span:last-child");
          if (icon) {
            icon.textContent = parent.classList.contains("open") ? "−" : "+";
          }
        }
      });
    });

    // Tooltips setup
    document.querySelectorAll(".tooltip-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tipText = btn.getAttribute("data-tooltip");
        if (tipText) {
          UI.showToast(tipText, "info");
        }
      });
    });
  }
};

window.UI = UI;

document.addEventListener("DOMContentLoaded", () => {
  UI.initGlobalComponents();
});
