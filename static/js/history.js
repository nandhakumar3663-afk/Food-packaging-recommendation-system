/**
 * Recommendation History Controller.
 * Renders audit cards and handles empty state cleanly.
 */

document.addEventListener("DOMContentLoaded", async function() {
  const container = document.getElementById("history-cards-container");
  const emptyState = document.getElementById("history-empty-state");

  try {
    const res = await ApiClient.getHistory(50);
    if (res && res.success && Array.isArray(res.history)) {
      if (res.history.length === 0) {
        if (container) container.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
      }

      if (container) {
        container.innerHTML = "";
        res.history.forEach(item => {
          const score = parseFloat(item.compatibility_score || 0).toFixed(1);
          const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : "Recent Run";

          const card = document.createElement("div");
          card.className = "card";
          card.style.cssText = "display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-left: 4px solid var(--primary-green);";

          card.innerHTML = `
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                <span class="badge badge-green">#${item.recommendation_id}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(dateStr)}</span>
              </div>
              <h2 style="font-size: 1.15rem; color: var(--dark-green); margin-bottom: 0.25rem;">
                ${escapeHtml(item.food_name || "Food Product")}
              </h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">
                Category: <strong>${escapeHtml(item.category || "General")}</strong> • Recommended Material: <strong>${escapeHtml(item.material_name || "N/A")}</strong>
              </p>
            </div>

            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div style="text-align: right;">
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Compatibility</span>
                <strong style="font-size: 1.25rem; color: var(--dark-green);">${score}%</strong>
              </div>
              <a href="/report?id=${item.recommendation_id}" class="btn btn-secondary btn-sm">
                View Analysis
              </a>
            </div>
          `;

          container.appendChild(card);
        });
      }
    } else {
      if (container) {
        container.innerHTML = `<div class="card" style="text-align:center; color:var(--error); padding:2rem;">Could not load history records.</div>`;
      }
    }
  } catch (err) {
    console.error("Error loading history:", err);
    if (container) {
      container.innerHTML = `<div class="card" style="text-align:center; color:var(--error); padding:2rem;">Unable to connect to recommendation history API.</div>`;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
