/**
 * Recommendation History Controller — Phase 5 Enhanced.
 * Renders audit cards with preference profile badges, search/ID lookup, and report links.
 */

document.addEventListener("DOMContentLoaded", async function() {
  const container = document.getElementById("history-cards-container");
  const emptyState = document.getElementById("history-empty-state");
  const searchInput = document.getElementById("search-history");
  const countLabel = document.getElementById("history-count-label");

  let allHistory = [];

  try {
    const res = await ApiClient.getHistory(100);
    if (res && res.success && Array.isArray(res.history)) {
      allHistory = res.history;
      if (allHistory.length === 0) {
        if (container) container.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
      }
      renderCards();
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

  function renderCards() {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();

    const filtered = allHistory.filter(item => {
      if (!query) return true;
      const idMatch = `#${item.recommendation_id}`.toLowerCase().includes(query) || `${item.recommendation_id}` === query;
      const foodMatch = (item.food_name || "").toLowerCase().includes(query);
      const matMatch = (item.material_name || "").toLowerCase().includes(query);
      return idMatch || foodMatch || matMatch;
    });

    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${allHistory.length} analyses`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div class="card" style="text-align:center; color:var(--text-muted); padding:2rem;">No previous analyses match "${escapeHtml(query)}".</div>`;
      return;
    }

    container.innerHTML = "";
    filtered.forEach(item => {
      const score = parseFloat(item.compatibility_score || 0).toFixed(1);
      const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : "Recent Run";

      let snap = {};
      try {
        snap = typeof item.input_snapshot === "string" ? JSON.parse(item.input_snapshot) : (item.input_snapshot || {});
      } catch(e){}

      const profile = (snap.preference_profile || "balanced").toLowerCase();
      let profileBadge = `<span class="badge badge-neutral">Balanced Profile</span>`;
      if (profile.includes("cost")) {
        profileBadge = `<span class="badge badge-warning">💰 Cost Priority</span>`;
      } else if (profile.includes("sustain")) {
        profileBadge = `<span class="badge badge-green">🌿 Sustainability Priority</span>`;
      }

      const card = document.createElement("div");
      card.className = "card";
      card.style.cssText = "display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-left: 4px solid var(--primary-green);";

      card.innerHTML = `
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span class="badge badge-green">#${item.recommendation_id}</span>
            ${profileBadge}
            <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(dateStr)}</span>
          </div>
          <h2 style="font-size: 1.15rem; color: var(--dark-green); margin-bottom: 0.25rem;">
            ${escapeHtml(item.food_name || "Food Product")}
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Category: <strong>${escapeHtml(item.category || "General")}</strong> • Recommended Material: <strong>${escapeHtml(item.material_name || "N/A")}</strong>
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <div style="text-align: right; min-width: 80px;">
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Compatibility</span>
            <strong style="font-size: 1.25rem; color: var(--dark-green);">${score}%</strong>
          </div>
          <div style="display: flex; gap: 0.4rem;">
            <a href="/report?id=${item.recommendation_id}" class="btn btn-secondary btn-sm">
              <span>📄</span> Report
            </a>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderCards);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
