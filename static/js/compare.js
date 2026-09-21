/**
 * Materials Comparison Controller — Phase 5 Enhanced.
 * Supports real-time text search, category filtering, toggleable technical columns,
 * multi-material checkboxes, and side-by-side modal comparison.
 */

document.addEventListener("DOMContentLoaded", async function() {
  const tableBody = document.getElementById("materials-table-body");
  const searchInput = document.getElementById("search-materials");
  const filterPills = document.querySelectorAll(".filter-pill");
  const btnToggleTech = document.getElementById("btn-toggle-tech-cols");
  
  // Modal & Selection elements
  const selectedCountBadge = document.getElementById("selected-count-badge");
  const btnClearSelection = document.getElementById("btn-clear-selection");
  const btnOpenModal = document.getElementById("btn-open-compare-modal");
  const compareModal = document.getElementById("compare-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCloseModalFooter = document.getElementById("btn-close-modal-footer");
  const modalTable = document.getElementById("modal-compare-table");

  let allMaterials = [];
  let selectedMaterialIds = new Set();
  let currentCategory = "all";
  let showTechCols = false;

  // 1. Fetch Materials from API
  try {
    const res = await ApiClient.getMaterials();
    if (res && res.success && res.materials) {
      allMaterials = res.materials;
      renderTable();
    } else {
      tableBody.innerHTML = `<tr><td colspan="8" style="padding:2rem; text-align:center; color:var(--error);">Failed to load materials database.</td></tr>`;
    }
  } catch (err) {
    console.error("Error loading materials:", err);
    tableBody.innerHTML = `<tr><td colspan="8" style="padding:2rem; text-align:center; color:var(--error);">Unable to connect to packaging materials API.</td></tr>`;
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
      tableBody.innerHTML = `<tr><td colspan="12" style="padding:2rem; text-align:center; color:var(--text-muted);">No packaging materials matched your filters.</td></tr>`;
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

      const isChecked = selectedMaterialIds.has(m.material_id);

      tr.innerHTML = `
        <td style="padding: 1rem; text-align: center;">
          <input type="checkbox" class="material-checkbox" data-id="${m.material_id}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
        </td>
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

      // Checkbox listener
      const cb = tr.querySelector(".material-checkbox");
      cb.addEventListener("change", (e) => {
        const id = parseInt(e.target.getAttribute("data-id"), 10);
        if (e.target.checked) {
          if (selectedMaterialIds.size >= 4) {
            e.target.checked = false;
            UI.showToast("You can compare a maximum of 4 materials side-by-side.", "warning");
            return;
          }
          selectedMaterialIds.add(id);
        } else {
          selectedMaterialIds.delete(id);
        }
        updateSelectionState();
      });

      tableBody.appendChild(tr);
    });
  }

  // 3. Selection State Management
  function updateSelectionState() {
    const count = selectedMaterialIds.size;
    selectedCountBadge.textContent = `${count} Selected`;

    if (count > 0) {
      btnClearSelection.style.display = "inline-block";
    } else {
      btnClearSelection.style.display = "none";
    }

    if (count >= 2) {
      btnOpenModal.disabled = false;
      btnOpenModal.innerHTML = `<span>📊</span> Compare (${count}) Side-by-Side`;
    } else {
      btnOpenModal.disabled = true;
      btnOpenModal.innerHTML = `<span>📊</span> Compare Side-by-Side`;
    }
  }

  if (btnClearSelection) {
    btnClearSelection.addEventListener("click", () => {
      selectedMaterialIds.clear();
      document.querySelectorAll(".material-checkbox").forEach(cb => cb.checked = false);
      updateSelectionState();
    });
  }

  // 4. Modal Side-by-Side Table Population
  function renderComparisonModal() {
    const selected = allMaterials.filter(m => selectedMaterialIds.has(m.material_id));
    if (selected.length < 2) return;

    const rows = [
      {
        label: "Category & Structure",
        getValue: m => `<span class="badge badge-neutral">${escapeHtml(m.material_category || "")}</span><br><small style="color:var(--text-muted);">${escapeHtml(m.polymer_type || "")}</small>`
      },
      {
        label: "Oxygen Barrier (OTR)",
        getValue: m => `<strong>${m.otr !== undefined ? m.otr : "N/A"}</strong> ${m.otr_unit || "cc/(m²·d·atm)"}<br><small style="color:var(--text-muted);">${escapeHtml(m.otr_test_condition || "23°C, 50% RH")}</small>`
      },
      {
        label: "Moisture Barrier (WVTR)",
        getValue: m => `<strong>${m.wvtr !== undefined ? m.wvtr : "N/A"}</strong> ${m.wvtr_unit || "g/(m²·d)"}<br><small style="color:var(--text-muted);">${escapeHtml(m.wvtr_test_condition || "38°C, 90% RH")}</small>`
      },
      {
        label: "Mechanical Strength",
        getValue: m => `<span style="font-weight:600; color:var(--dark-green);">${escapeHtml(m.mechanical_strength || "Medium")}</span>`
      },
      {
        label: "Heat Sealability",
        getValue: m => `<span style="font-weight:600; color:var(--dark-green);">${escapeHtml(m.sealability || "Good")}</span>`
      },
      {
        label: "Recyclability",
        getValue: m => `<strong>${m.recyclability !== undefined ? m.recyclability : "N/A"}%</strong>`
      },
      {
        label: "Bio-Renewable Content",
        getValue: m => `<strong>${m.renewable_content !== undefined ? m.renewable_content : "0"}%</strong>`
      },
      {
        label: "Estimated Material Cost",
        getValue: m => `<strong style="color:var(--dark-green);">$${m.estimated_cost !== undefined ? m.estimated_cost : "N/A"}</strong> / m²`
      },
      {
        label: "Unit Package Cost (0.05 m²)",
        getValue: m => {
          const unit = m.estimated_cost !== undefined ? (m.estimated_cost * 0.05).toFixed(4) : "N/A";
          return `<strong style="color:var(--primary-green);">$${unit}</strong> / pouch`;
        }
      },
      {
        label: "Data Provenance",
        getValue: m => {
          const isSyn = (m.source || "").toUpperCase().includes("SYNTHETIC");
          const badgeClass = isSyn ? "badge-warning" : "badge-info";
          const badgeText = isSyn ? "Synthetic Demo Data" : "Literature-Backed";
          return `<span class="badge ${badgeClass}">${badgeText}</span><br><small style="color:var(--text-muted);">${escapeHtml(m.source || "Literature")}</small>`;
        }
      }
    ];

    let html = `<thead><tr style="background:var(--very-light-green); border-bottom:2px solid var(--border-green);"><th style="padding:0.75rem 1rem; width:220px; text-align:left; color:var(--dark-green);">Property</th>`;
    selected.forEach(m => {
      html += `<th style="padding:0.75rem 1rem; text-align:left; color:var(--dark-green); font-size:0.95rem;">${escapeHtml(m.material_name)}</th>`;
    });
    html += `</tr></thead><tbody>`;

    rows.forEach((r, idx) => {
      const bg = idx % 2 === 0 ? "#ffffff" : "var(--very-light-green)";
      html += `<tr style="background:${bg}; border-bottom:1px solid var(--border);"><td style="padding:0.75rem 1rem; font-weight:600; color:var(--text-primary);">${r.label}</td>`;
      selected.forEach(m => {
        html += `<td style="padding:0.75rem 1rem; line-height:1.4;">${r.getValue(m)}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody>`;
    modalTable.innerHTML = html;
  }

  // 5. Open & Close Modal
  if (btnOpenModal) {
    btnOpenModal.addEventListener("click", () => {
      renderComparisonModal();
      compareModal.style.display = "block";
      document.body.style.overflow = "hidden";
    });
  }

  function closeModal() {
    compareModal.style.display = "none";
    document.body.style.overflow = "";
  }

  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCloseModalFooter) btnCloseModalFooter.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === compareModal) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && compareModal.style.display === "block") closeModal();
  });

  // 6. Search & Category Filters
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

  // 7. Toggle Technical Columns
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
