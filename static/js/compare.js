/**
 * Materials Comparison Controller.
 * Supports real-time text search, category filtering, and toggleable technical columns.
 */

document.addEventListener("DOMContentLoaded", async function() {
  const tableBody = document.getElementById("materials-table-body");
  const searchInput = document.getElementById("search-materials");
  const filterPills = document.querySelectorAll(".filter-pill");
  const btnToggleTech = document.getElementById("btn-toggle-tech-cols");

  let allMaterials = [];
  let currentCategory = "all";
  let showTechCols = false;

  // 1. Fetch Materials from API
  try {
    const res = await ApiClient.getMaterials();
    if (res && res.success && res.materials) {
      allMaterials = res.materials;
      renderTable();
    } else {
      tableBody.innerHTML = `<tr><td colspan="7" style="padding:2rem; text-align:center; color:var(--error);">Failed to load materials database.</td></tr>`;
    }
  } catch (err) {
    console.error("Error loading materials:", err);
    tableBody.innerHTML = `<tr><td colspan="7" style="padding:2rem; text-align:center; color:var(--error);">Unable to connect to packaging materials API.</td></tr>`;
  }

  // 2. Render Table Function
  function renderTable() {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();

    const filtered = allMaterials.filter(m => {
      const matchCat = currentCategory === "all" || (m.material_category || "") === currentCategory;
      const matchText = !query ||
        (m.material_name || "").toLowerCase().includes(query) ||
        (m.polymer_type || "").toLowerCase().includes(query) ||
        (m.material_category || "").toLowerCase().includes(query);
      return matchCat && matchText;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="11" style="padding:2rem; text-align:center; color:var(--text-muted);">No packaging materials matched your filters.</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";
    filtered.forEach(m => {
      const tr = document.createElement("tr");
      tr.style.cssText = "border-bottom: 1px solid var(--border); transition: var(--transition);";
      tr.addEventListener("mouseenter", () => tr.style.backgroundColor = "var(--very-light-green)");
      tr.addEventListener("mouseleave", () => tr.style.backgroundColor = "transparent");

      // Barrier Badge
      let barrierBadge = `<span class="badge badge-neutral">Standard</span>`;
      if (m.oxygen_barrier === "Excellent" || m.moisture_barrier === "Excellent") {
        barrierBadge = `<span class="badge badge-green">High Barrier</span>`;
      } else if (m.oxygen_barrier === "Poor" && m.moisture_barrier === "Poor") {
        barrierBadge = `<span class="badge badge-warning">Permeable</span>`;
      }

      // Sustainability
      const recyc = m.recyclability !== undefined ? `${m.recyclability}%` : "N/A";
      const renew = m.renewable_content > 0 ? ` (${m.renewable_content}% Bio)` : "";

      tr.innerHTML = `
        <td style="padding: 1rem 1.25rem;">
          <strong style="color: var(--dark-green); display: block;">${escapeHtml(m.material_name)}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(m.polymer_type || "")}</span>
        </td>
        <td style="padding: 1rem;"><span class="badge badge-neutral">${escapeHtml(m.material_category || "")}</span></td>
        <td style="padding: 1rem;">${barrierBadge}</td>
        <td style="padding: 1rem;">${escapeHtml(m.mechanical_strength || "Medium")}</td>
        <td style="padding: 1rem;">${escapeHtml(m.sealability || "Good")}</td>
        <td style="padding: 1rem;">${recyc}${renew}</td>
        <td style="padding: 1rem; font-weight: 600; color: var(--dark-green);">$${m.estimated_cost !== undefined ? m.estimated_cost : "N/A"}</td>
        
        <!-- Technical columns -->
        <td class="tech-col" style="padding: 1rem; ${showTechCols ? '' : 'display: none;'}">${m.otr !== undefined ? m.otr : '-'}</td>
        <td class="tech-col" style="padding: 1rem; ${showTechCols ? '' : 'display: none;'}">${m.wvtr !== undefined ? m.wvtr : '-'}</td>
        <td class="tech-col" style="padding: 1rem; ${showTechCols ? '' : 'display: none;'}">${m.thickness !== undefined ? m.thickness + ' μm' : '-'}</td>
        <td class="tech-col" style="padding: 1rem; font-size: 0.75rem; color: var(--text-muted); ${showTechCols ? '' : 'display: none;'}">${escapeHtml(m.source || 'Peer-reviewed')}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // 3. Search & Category Filters
  if (searchInput) {
    searchInput.addEventListener("input", renderTable);
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => {
        p.classList.remove("active", "btn-primary");
        p.classList.add("btn-secondary");
      });
      pill.classList.add("active", "btn-primary");
      pill.classList.remove("btn-secondary");
      currentCategory = pill.getAttribute("data-category");
      renderTable();
    });
  });

  // 4. Toggle Technical Columns
  if (btnToggleTech) {
    btnToggleTech.addEventListener("click", () => {
      showTechCols = !showTechCols;
      document.querySelectorAll(".tech-col").forEach(td => {
        td.style.display = showTechCols ? "table-cell" : "none";
      });
      btnToggleTech.innerHTML = showTechCols
        ? "<span>✓</span> Hide Technical Details"
        : "<span>⚙️</span> Show Technical Details";
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
