/**
 * Results View Controller.
 * Visualizes hybrid recommendation outcomes, subscore breakdown bars, rules, and alternatives.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("results-container");
  const noDataEl = document.getElementById("no-results-message");
  if (!container) return;

  let resultData = null;

  // Check URL query parameters for an explicit recommendation ID
  const urlParams = new URLSearchParams(window.location.search);
  const recId = urlParams.get("id");

  if (recId) {
    try {
      const data = await API.getHistoryById(recId);
      if (data && data.recommendation) {
        resultData = formatHistoryRecord(data.recommendation);
      }
    } catch (err) {
      UI.showToast("Could not load recommendation from history.", "error");
    }
  }

  // Fallback to sessionStorage
  if (!resultData) {
    const raw = sessionStorage.getItem("last_packaging_result");
    if (raw) {
      try {
        resultData = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse cached recommendation result:", e);
      }
    }
  }

  if (!resultData) {
    if (noDataEl) noDataEl.style.display = "block";
    return;
  }

  if (noDataEl) noDataEl.style.display = "none";
  container.style.display = "block";

  renderResults(resultData);

  // Helper to format a single history row into results structure if loaded via ?id=
  function formatHistoryRecord(rec) {
    let triggered = [];
    let snapshot = {};
    try { triggered = JSON.parse(rec.triggered_rules || "[]"); } catch (e) {}
    try { snapshot = JSON.parse(rec.input_snapshot || "{}"); } catch (e) {}

    return {
      recommendation_id: rec.recommendation_id,
      analysis: {
        food: rec.food_name,
        category: rec.category,
        target_shelf_life: snapshot.target_shelf_life || "N/A",
        storage: {
          temperature: snapshot.storage_temperature || "N/A",
          rh: snapshot.storage_rh || "N/A",
          storage_type: snapshot.storage_type || "Ambient",
          transport_condition: snapshot.transport_condition || "Standard Ambient",
        },
      },
      recommendations: {
        recommended_match: {
          recommendation_type: rec.recommendation_type,
          compatibility_score: rec.compatibility_score,
          material: {
            material_id: rec.selected_material_id,
            material_name: rec.material_name,
            material_category: rec.material_category,
            polymer_type: rec.polymer_type,
            otr: rec.otr,
            wvtr: rec.wvtr,
            thickness: rec.thickness,
            estimated_cost: rec.estimated_cost,
            recyclability: rec.recyclability,
            renewable_content: rec.renewable_content,
            source: rec.material_source,
            source_url: rec.material_source_url,
          },
          subscores: {
            oxygen: rec.oxygen_score,
            moisture: rec.moisture_score,
            mechanical: rec.strength_score,
            sealability: rec.sealability_score,
            shelf_life: rec.shelf_life_score,
            sustainability: rec.sustainability_score,
            cost: rec.cost_score,
          },
          reasons: (rec.reason || "").split("; "),
          triggered_rules: triggered,
          warnings: [],
        }
      }
    };
  }

  function renderResults(data) {
    const recId = data.recommendation_id;
    const a = data.analysis;
    const recs = data.recommendations || {};
    const primary = recs.recommended_match;

    if (!primary) return;

    // 1. Food Summary Banner
    document.getElementById("res-food-name").textContent = a.food || "Analyzed Food";
    document.getElementById("res-food-category").textContent = a.category || "General";
    document.getElementById("res-shelf-life").textContent = `${a.target_shelf_life || 30} days`;
    document.getElementById("res-storage-temp").textContent = `${a.storage.temperature}°C`;
    document.getElementById("res-storage-rh").textContent = `${a.storage.rh}% RH`;

    // 2. Primary Recommendation Hero Card
    const mat = primary.material || {};
    document.getElementById("hero-material-name").textContent = mat.material_name || "N/A";
    document.getElementById("hero-material-cat").textContent = `${mat.material_category || ""} (${mat.polymer_type || ""})`;
    document.getElementById("hero-score-val").textContent = `${primary.compatibility_score.toFixed(2)}%`;

    // Provenance badge
    document.getElementById("hero-provenance-badge").innerHTML = UI.getProvenanceBadge(mat.source);
    document.getElementById("hero-source-cite").textContent = mat.source || "Literature reference unavailable";
    if (mat.source_url) {
      const link = document.getElementById("hero-source-link");
      link.href = mat.source_url;
      link.style.display = "inline";
    }

    // Material Specs
    document.getElementById("spec-otr").textContent = `${mat.otr} ${mat.otr_unit || "cc/(m²·day·atm)"}`;
    document.getElementById("spec-wvtr").textContent = `${mat.wvtr} ${mat.wvtr_unit || "g/(m²·day)"}`;
    document.getElementById("spec-thickness").textContent = `${mat.thickness} ${mat.thickness_unit || "μm"}`;
    document.getElementById("spec-cost").textContent = `$${mat.estimated_cost} / m²`;
    document.getElementById("spec-recyc").textContent = `${mat.recyclability}%`;
    document.getElementById("spec-renew").textContent = `${mat.renewable_content}%`;

    // 3. Subscores Progress Bars
    const subs = primary.subscores || {};
    renderScoreBar("bar-oxygen", "val-oxygen", subs.oxygen);
    renderScoreBar("bar-moisture", "val-moisture", subs.moisture);
    renderScoreBar("bar-shelf", "val-shelf", subs.shelf_life);
    renderScoreBar("bar-mech", "val-mech", subs.mechanical);
    renderScoreBar("bar-seal", "val-seal", subs.sealability);
    renderScoreBar("bar-sust", "val-sust", subs.sustainability);
    renderScoreBar("bar-cost", "val-cost", subs.cost);

    // 4. Reasons List
    const reasonsList = document.getElementById("reasons-list");
    reasonsList.innerHTML = "";
    (primary.reasons || []).forEach(r => {
      const li = document.createElement("li");
      li.style.marginBottom = "0.4rem";
      li.textContent = r;
      reasonsList.appendChild(li);
    });

    // 5. Triggered Rules
    const rulesList = document.getElementById("triggered-rules-list");
    rulesList.innerHTML = "";
    const rules = primary.triggered_rules || [];
    if (rules.length === 0) {
      rulesList.innerHTML = '<p class="form-hint">No special barrier restriction rules triggered.</p>';
    } else {
      rules.forEach(rule => {
        const item = document.createElement("div");
        item.style.padding = "0.75rem";
        item.style.marginBottom = "0.5rem";
        item.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
        item.style.borderRadius = "var(--radius-sm)";
        item.style.border = "1px solid rgba(46, 62, 111, 0.4)";
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
            <strong style="color:var(--accent-cyan); font-size:0.85rem;">${rule.id}</strong>
            <span style="font-size:0.8rem; color:#fff;">${rule.name}</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">${rule.explanation}</p>
        `;
        rulesList.appendChild(item);
      });
    }

    // 6. Warnings
    const warnContainer = document.getElementById("warnings-container");
    const warnList = document.getElementById("warnings-list");
    const warnings = primary.warnings || [];
    if (warnings.length > 0) {
      warnContainer.style.display = "block";
      warnList.innerHTML = "";
      warnings.forEach(w => {
        const li = document.createElement("li");
        li.textContent = w;
        warnList.appendChild(li);
      });
    }

    // 7. Alternatives Cards
    renderAlternativeCard("alt-match-card", recs.alternative_match, "Alternative Match");
    renderAlternativeCard("alt-cost-card", recs.lower_cost_alternative, "Lower-cost Alternative");
    renderAlternativeCard("alt-sust-card", recs.sustainability_oriented_alternative, "Sustainability-oriented Alternative");

    // 8. Report Link
    const reportBtn = document.getElementById("view-report-btn");
    if (reportBtn && recId) {
      reportBtn.href = `/report/${recId}`;
    }
  }

  function renderScoreBar(barId, valId, score) {
    const val = typeof score === "number" ? Math.round(score) : 0;
    const bar = document.getElementById(barId);
    const label = document.getElementById(valId);
    if (label) label.textContent = `${val}%`;
    if (bar) {
      bar.style.width = `${val}%`;
      bar.className = `score-bar-fill ${UI.getScoreColorClass(val)}`;
    }
  }

  function renderAlternativeCard(elemId, altData, fallbackLabel) {
    const el = document.getElementById(elemId);
    if (!el || !altData) return;

    const m = altData.material || {};
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
        <span class="badge badge-cyan">${altData.recommendation_type || fallbackLabel}</span>
        <span style="font-size:1.1rem; font-weight:700; color:#fff;">${altData.compatibility_score.toFixed(1)}%</span>
      </div>
      <h4 style="font-size:1.05rem; margin-bottom:0.35rem; color:#fff;">${m.material_name || "N/A"}</h4>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.85rem;">
        ${m.material_category || ""} | Cost: $${m.estimated_cost}/m² | Recyc: ${m.recyclability}%
      </p>
      <div style="font-size:0.825rem; color:var(--text-secondary); line-height:1.4;">
        ${(altData.reasons && altData.reasons[0]) || "Meets barrier parameters."}
      </div>
      <div style="margin-top:0.85rem;">
        ${UI.getProvenanceBadge(m.source)}
      </div>
    `;
  }
});
