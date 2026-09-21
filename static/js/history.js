/**
 * Recommendation History Controller.
 * Displays past analyses log, limit controls, and details navigation.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("history-tbody");
  const limitSelect = document.getElementById("history-limit-select");
  const countDisplay = document.getElementById("history-count");

  if (!tbody) return;

  async function loadHistory(limit = 20) {
    try {
      const data = await API.getHistory(limit);
      if (data && data.history) {
        renderHistoryTable(data.history);
      }
    } catch (err) {
      UI.showToast("Failed to load recommendation history.", "error");
    }
  }

  function renderHistoryTable(items) {
    tbody.innerHTML = "";
    if (countDisplay) countDisplay.textContent = `Displaying ${items.length} records`;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2.5rem; color:var(--text-muted);">No recommendation records found in SQLite history. Run a new analysis to populate.</td></tr>';
      return;
    }

    items.forEach(row => {
      const tr = document.createElement("tr");
      const score = parseFloat(row.compatibility_score) || 0;

      tr.innerHTML = `
        <td><strong style="color:var(--accent-cyan);">#${row.recommendation_id}</strong></td>
        <td>
          <strong style="color:#fff;">${row.food_name}</strong>
          <span style="display:block; font-size:0.775rem; color:var(--text-muted);">${row.category}</span>
        </td>
        <td>
          <span>${row.material_name}</span>
          <span style="display:block; font-size:0.775rem; color:var(--text-muted);">${row.material_category || ""}</span>
        </td>
        <td>
          <strong style="color:${score >= 80 ? '#34d399' : (score >= 50 ? '#fbbf24' : '#fb7185')};">
            ${score.toFixed(2)}%
          </strong>
        </td>
        <td style="max-width:260px; font-size:0.8rem; color:var(--text-secondary);">
          <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${row.reason}">
            ${row.reason || "-"}
          </div>
        </td>
        <td style="font-size:0.8rem; color:var(--text-muted); white-space:nowrap;">
          ${row.created_at || "-"}
        </td>
        <td style="white-space:nowrap;">
          <a href="/results?id=${row.recommendation_id}" class="btn btn-secondary btn-sm" style="margin-right:0.35rem;">View</a>
          <a href="/report/${row.recommendation_id}" class="btn btn-outline btn-sm">Report</a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (limitSelect) {
    limitSelect.addEventListener("change", (e) => {
      loadHistory(parseInt(e.target.value, 10) || 20);
    });
  }

  // Initial load
  loadHistory(20);
});
