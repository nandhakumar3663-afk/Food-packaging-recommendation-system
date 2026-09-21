/**
 * Materials Comparison Controller.
 * Interactive comparison table with search and category filtering.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("compare-tbody");
  const searchInput = document.getElementById("compare-search");
  const categoryFilter = document.getElementById("compare-cat-filter");
  const countDisplay = document.getElementById("compare-count");

  if (!tbody) return;

  let allMaterials = [];

  try {
    const data = await API.getMaterials();
    if (data && data.materials) {
      allMaterials = data.materials;
      populateCategoryFilter(allMaterials);
      renderTable(allMaterials);
    }
  } catch (err) {
    UI.showToast("Failed to load materials catalog.", "error");
  }

  function populateCategoryFilter(materials) {
    if (!categoryFilter) return;
    const cats = [...new Set(materials.map(m => m.material_category).filter(Boolean))].sort();
    cats.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      categoryFilter.appendChild(opt);
    });
  }

  function renderTable(materials) {
    tbody.innerHTML = "";
    if (countDisplay) countDisplay.textContent = `Showing ${materials.length} materials`;

    if (materials.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:2rem; color:var(--text-muted);">No matching packaging materials found.</td></tr>';
      return;
    }

    materials.forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <strong style="color:#fff;">${m.material_name}</strong>
          <div style="margin-top:0.25rem;">${UI.getProvenanceBadge(m.source)}</div>
        </td>
        <td>
          <span>${m.material_category}</span>
          <span style="display:block; font-size:0.775rem; color:var(--text-muted);">${m.polymer_type || "-"}</span>
        </td>
        <td>
          <strong>${m.otr}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">${m.otr_unit}</span>
          <div style="font-size:0.75rem; color:var(--accent-cyan);">${m.oxygen_barrier}</div>
        </td>
        <td>
          <strong>${m.wvtr}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">${m.wvtr_unit}</span>
          <div style="font-size:0.75rem; color:var(--accent-cyan);">${m.moisture_barrier}</div>
        </td>
        <td>${m.thickness} ${m.thickness_unit}</td>
        <td>${m.mechanical_strength}</td>
        <td>${m.sealability}</td>
        <td><strong>${m.recyclability}%</strong></td>
        <td>${m.renewable_content}%</td>
        <td><strong style="color:var(--accent-emerald);">$${m.estimated_cost}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">/m²</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function applyFilters() {
    const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const cat = categoryFilter ? categoryFilter.value : "";

    const filtered = allMaterials.filter(m => {
      const matchName = (m.material_name || "").toLowerCase().includes(q) ||
                        (m.polymer_type || "").toLowerCase().includes(q);
      const matchCat = cat === "" || m.material_category === cat;
      return matchName && matchCat;
    });

    renderTable(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
});
