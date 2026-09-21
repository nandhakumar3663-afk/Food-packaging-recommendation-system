/**
 * Results Page Controller — Phase 5 Enhanced.
 * Renders 10-tier hierarchy, key packaging requirements, primary recommendation,
 * cost analysis, sustainability index, cross-profile comparison, and ML disclosures.
 */

document.addEventListener("DOMContentLoaded", function() {
  const rawData = sessionStorage.getItem("last_packaging_result");
  if (!rawData) {
    window.location.href = "/analyze";
    return;
  }

  let result = null;
  try {
    result = JSON.parse(rawData);
  } catch (e) {
    console.error("Failed to parse recommendation results:", e);
    window.location.href = "/analyze";
    return;
  }

  const analysis = result.analysis || {};
  const recs = result.recommendations || {};
  const primaryMatch = recs.recommended_match || {};
  const primaryMat = primaryMatch.material || {};
  const mlAssessment = result.ml_assessment || {};
  const pkgReqs = result.packaging_requirements || {};
  const profileComp = result.profile_comparison || {};
  const costData = primaryMatch.cost_analysis || {};
  const sustData = primaryMatch.sustainability_analysis || {};
  const provData = primaryMatch.provenance || {};

  // 1. Header & Badges
  const foodLine = document.getElementById("food-summary-line");
  if (foodLine) {
    foodLine.textContent = `Analyzed: ${analysis.food || "Custom Food"} (${analysis.category || "General"}) • Target Shelf Life: ${analysis.target_shelf_life || 30} days`;
  }

  const profileBadge = document.getElementById("rec-profile-badge");
  if (profileBadge) {
    const profName = (analysis.preference_profile || "balanced").replace("_", " ").toUpperCase();
    profileBadge.textContent = `Profile: ${profName}`;
    if (profName.includes("COST")) {
      profileBadge.className = "badge badge-warning";
    } else if (profName.includes("SUSTAIN")) {
      profileBadge.className = "badge badge-green";
    } else {
      profileBadge.className = "badge badge-neutral";
    }
  }

  const provBadge = document.getElementById("rec-provenance-badge");
  if (provBadge) {
    provBadge.textContent = provData.tier || "Literature-Backed";
    if (provData.is_synthetic) {
      provBadge.className = "badge badge-warning";
    } else {
      provBadge.className = "badge badge-info";
    }
  }

  // Report Link
  const btnReport = document.getElementById("btn-view-report");
  if (btnReport && result.recommendation_id) {
    btnReport.href = `/report?id=${result.recommendation_id}`;
  }

  // 2. Key Packaging Requirements Card
  const reqShelf = document.getElementById("req-target-shelf-life");
  const reqO2 = document.getElementById("req-o2-demand");
  const reqWVTR = document.getElementById("req-wvtr-demand");
  const reqMech = document.getElementById("req-mech-demand");
  const reqGas = document.getElementById("req-gas-exchange");
  const reqText = document.getElementById("req-summary-text");

  if (reqShelf) reqShelf.textContent = `Target: ${pkgReqs.preservation_shelf_life_target || (analysis.target_shelf_life + ' days')}`;
  if (reqO2) reqO2.textContent = pkgReqs.critical_o2_barrier_needed || "Standard Barrier";
  if (reqWVTR) reqWVTR.textContent = pkgReqs.critical_wvtr_barrier_needed || "Standard Barrier";
  if (reqMech) reqMech.textContent = pkgReqs.mechanical_protection_demand || "Standard Handling";
  if (reqGas) reqGas.textContent = pkgReqs.gas_exchange_demand || "Hermetic Seal";
  if (reqText) reqText.textContent = pkgReqs.summary_text || "";

  // 3. Primary Match Hero Card
  const matNameEl = document.getElementById("rec-material-name");
  const matCatEl = document.getElementById("rec-material-category");
  const scoreEl = document.getElementById("rec-score");
  const reasonsListEl = document.getElementById("rec-reasons-list");

  if (matNameEl) matNameEl.textContent = primaryMat.material_name || "Packaging Candidate";
  if (matCatEl) matCatEl.textContent = `${primaryMat.material_category || "Polymer"} • ${primaryMat.polymer_type || "Film"}`;
  if (scoreEl) {
    const scoreVal = parseFloat(primaryMatch.compatibility_score || 0).toFixed(1);
    scoreEl.textContent = `${scoreVal}%`;
  }

  // Reasons
  if (reasonsListEl) {
    reasonsListEl.innerHTML = "";
    const reasons = primaryMatch.reasons || [
      "Meets baseline food protection barrier requirements for oxygen and water vapor.",
      "Compatible with target storage temperature and distribution handling."
    ];
    reasons.forEach(r => {
      const li = document.createElement("li");
      li.className = "reason-item";
      li.innerHTML = `<span class="reason-bullet">✓</span> <span>${escapeHtml(r)}</span>`;
      reasonsListEl.appendChild(li);
    });
  }

  // 4. Cost Analysis Box
  const costTierBadge = document.getElementById("cost-tier-badge");
  const costUnitPrice = document.getElementById("cost-unit-price");
  const costUnitLabel = document.getElementById("cost-unit-label");
  const costPerSqmText = document.getElementById("cost-per-sqm-text");
  const costStatusNote = document.getElementById("cost-status-note");

  if (costUnitPrice && costData.unit_package_cost_usd !== undefined) {
    costUnitPrice.textContent = `$${costData.unit_package_cost_usd.toFixed(4)}`;
  }
  if (costPerSqmText && costData.cost_per_sq_meter !== undefined) {
    costPerSqmText.textContent = `Raw material benchmark: $${costData.cost_per_sq_meter.toFixed(2)} / m²`;
  }
  if (costTierBadge && costData.cost_tier) {
    costTierBadge.textContent = `${costData.cost_tier} Tier`;
  }
  if (costStatusNote && costData.status) {
    costStatusNote.textContent = costData.status;
  }

  // 5. Sustainability Analysis Box
  const sustIdxBadge = document.getElementById("sustainability-index-badge");
  const sustBreakdown = document.getElementById("sustainability-breakdown-text");
  const sustPathway = document.getElementById("sustainability-pathway-text");

  if (sustIdxBadge && sustData.sustainability_index !== undefined) {
    sustIdxBadge.textContent = `${sustData.sustainability_index.toFixed(1)} / 100`;
  }
  if (sustBreakdown) {
    const recyc = sustData.recyclability_score !== undefined ? `${sustData.recyclability_score}%` : `${primaryMat.recyclability || 0}%`;
    const renew = sustData.renewable_content_score !== undefined ? `${sustData.renewable_content_score}%` : `${primaryMat.renewable_content || 0}%`;
    sustBreakdown.textContent = `Recyclability: ${recyc} • Bio-Renewable: ${renew}`;
  }
  if (sustPathway && sustData.end_of_life_pathway) {
    sustPathway.textContent = `End-of-life: ${sustData.end_of_life_pathway}`;
  }

  // 6. Machine Learning Assessment Box
  const mlSummaryEl = document.getElementById("rec-ml-summary");
  const mlBadgeEl = document.getElementById("rec-ml-status-badge");
  if (mlSummaryEl && mlAssessment.model_name) {
    const conf = mlAssessment.confidence ? `${Math.round(mlAssessment.confidence * 100)}%` : "N/A";
    if (mlAssessment.rule_veto_occurred) {
      mlSummaryEl.textContent = `${mlAssessment.model_name} initially ranked another candidate, but domain safety rules governed the selection to prevent food spoilage.`;
      if (mlBadgeEl) {
        mlBadgeEl.className = "badge badge-warning";
        mlBadgeEl.textContent = "Safety Rule Veto Applied";
      }
    } else {
      mlSummaryEl.textContent = `The ${mlAssessment.model_name} model evaluated candidate materials and assigned a confidence score of ${conf} to this recommendation.`;
      if (mlBadgeEl) {
        mlBadgeEl.className = "badge badge-green";
        mlBadgeEl.textContent = "ML Candidate Aligned";
      }
    }
  }

  // 7. Key Factors Considered (Plain-English Rule Explanations)
  const factorsContainer = document.getElementById("key-factors-container");
  if (factorsContainer) {
    factorsContainer.innerHTML = "";
    const triggered = primaryMatch.triggered_rules || [];
    if (triggered.length === 0) {
      factorsContainer.innerHTML = `
        <div style="font-size: 0.875rem; color: var(--text-secondary); background: #ffffff; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
          Standard baseline barrier parameters apply. No extreme moisture, fat rancidity, or acid constraints were triggered.
        </div>
      `;
    } else {
      triggered.forEach(rule => {
        const item = document.createElement("div");
        item.style.cssText = "font-size: 0.875rem; color: var(--text-primary); background: #ffffff; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-green); display: flex; align-items: center; gap: 0.5rem;";
        item.innerHTML = `<span style="color: var(--primary-green); font-weight: bold;">•</span> <strong>${escapeHtml(rule.name || rule.rule_id)}:</strong> <span>${escapeHtml(rule.reason || "")}</span>`;
        factorsContainer.appendChild(item);
      });
    }
  }

  // 8. Score Breakdown Progress Bars
  const breakdownContainer = document.getElementById("score-breakdown-container");
  if (breakdownContainer && primaryMatch.subscores) {
    breakdownContainer.innerHTML = "";
    const sub = primaryMatch.subscores;
    const criteria = [
      { key: "oxygen", label: "Oxygen Barrier (OTR)", val: sub.oxygen || 0 },
      { key: "moisture", label: "Moisture Barrier (WVTR)", val: sub.moisture || 0 },
      { key: "mechanical", label: "Mechanical Durability", val: sub.mechanical || 0 },
      { key: "sealability", label: "Hermetic Seal Integrity", val: sub.sealability || 0 },
      { key: "shelf_life", label: "Shelf-Life Compatibility", val: sub.shelf_life || 0 },
      { key: "sustainability", label: "Sustainability & Circularity", val: sub.sustainability || 0 },
      { key: "cost", label: "Cost Efficiency", val: sub.cost || 0 },
    ];

    criteria.forEach(c => {
      const barItem = document.createElement("div");
      barItem.className = "score-bar-item";
      barItem.innerHTML = `
        <div class="score-bar-header">
          <span>${escapeHtml(c.label)}</span>
          <span style="font-weight: 700;">${Math.round(c.val)}%</span>
        </div>
        <div class="score-bar-track">
          <div class="score-bar-fill" style="width: 0%;" data-target="${Math.round(c.val)}%"></div>
        </div>
      `;
      breakdownContainer.appendChild(barItem);
    });

    setTimeout(() => {
      document.querySelectorAll(".score-bar-fill").forEach(fill => {
        fill.style.width = fill.getAttribute("data-target");
      });
    }, 100);
  }

  // 9. Technical Details Accordion
  const btnToggleTech = document.getElementById("btn-toggle-tech");
  const contentTech = document.getElementById("content-technical");
  const techIcon = document.getElementById("tech-accordion-icon");
  if (btnToggleTech && contentTech) {
    btnToggleTech.addEventListener("click", () => {
      const isOpen = contentTech.style.display === "block";
      contentTech.style.display = isOpen ? "none" : "block";
      if (techIcon) techIcon.textContent = isOpen ? "+" : "−";
    });
  }

  const tableBody = document.getElementById("tech-specs-table-body");
  if (tableBody) {
    tableBody.innerHTML = `
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 0.5rem; font-weight: 600;">Oxygen Transmission Rate (OTR)</td>
        <td style="padding: 0.5rem;">${primaryMat.otr !== undefined ? primaryMat.otr : "N/A"}</td>
        <td style="padding: 0.5rem; color: var(--text-muted);">${primaryMat.otr_unit || "cc/(m²·d·atm)"} (${primaryMat.otr_test_condition || "23°C, 50% RH"})</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 0.5rem; font-weight: 600;">Water Vapor Transmission Rate (WVTR)</td>
        <td style="padding: 0.5rem;">${primaryMat.wvtr !== undefined ? primaryMat.wvtr : "N/A"}</td>
        <td style="padding: 0.5rem; color: var(--text-muted);">${primaryMat.wvtr_unit || "g/(m²·d)"} (${primaryMat.wvtr_test_condition || "38°C, 90% RH"})</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 0.5rem; font-weight: 600;">Gauge Thickness</td>
        <td style="padding: 0.5rem;">${primaryMat.thickness !== undefined ? primaryMat.thickness : "N/A"}</td>
        <td style="padding: 0.5rem; color: var(--text-muted);">${primaryMat.thickness_unit || "μm"}</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 0.5rem; font-weight: 600;">Estimated Material Cost</td>
        <td style="padding: 0.5rem;">$${primaryMat.estimated_cost !== undefined ? primaryMat.estimated_cost : "N/A"}</td>
        <td style="padding: 0.5rem; color: var(--text-muted);">USD / m²</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 0.5rem; font-weight: 600;">Recyclability Rating</td>
        <td style="padding: 0.5rem;">${primaryMat.recyclability !== undefined ? primaryMat.recyclability : "N/A"}%</td>
        <td style="padding: 0.5rem; color: var(--text-muted);">Standard municipal stream</td>
      </tr>
    `;
  }

  const provText = document.getElementById("tech-provenance-text");
  if (provText) {
    provText.textContent = primaryMat.source || "Literature reference: Robertson, G. L. (2012) & Massey, L. K. (2003).";
  }

  const rulesTechList = document.getElementById("triggered-rules-tech-list");
  if (rulesTechList) {
    rulesTechList.innerHTML = "";
    (primaryMatch.triggered_rules || []).forEach(r => {
      const li = document.createElement("li");
      li.textContent = `[${r.rule_id}] ${r.name}: ${r.reason}`;
      rulesTechList.appendChild(li);
    });
    if (!rulesTechList.children.length) {
      rulesTechList.innerHTML = "<li>No restrictive rules triggered for this product category.</li>";
    }
  }

  // 10. Multi-Objective Profile Comparison Grid
  const profileGrid = document.getElementById("profile-comparison-grid");
  if (profileGrid && Object.keys(profileComp).length > 0) {
    profileGrid.innerHTML = "";
    const profiles = [
      { key: "balanced", title: "Balanced Performance", icon: "⚖️", badge: "badge-neutral" },
      { key: "cost_priority", title: "Cost Priority", icon: "💰", badge: "badge-warning" },
      { key: "sustainability_priority", title: "Sustainability Priority", icon: "🌿", badge: "badge-green" }
    ];

    profiles.forEach(p => {
      const recItem = profileComp[p.key];
      if (!recItem) return;
      const m = recItem.material || {};
      const card = document.createElement("div");
      card.style.cssText = "background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;";
      
      const isActive = (analysis.preference_profile || "balanced") === p.key;
      if (isActive) {
        card.style.borderColor = "var(--primary-green)";
        card.style.boxShadow = "0 2px 8px rgba(34, 197, 94, 0.15)";
      }

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span class="badge ${p.badge}">${p.icon} ${p.title}</span>
            ${isActive ? '<span class="badge badge-green">Active Choice</span>' : ''}
          </div>
          <h3 style="font-size: 1rem; color: var(--dark-green); font-weight: 700; margin: 0.35rem 0;">
            ${escapeHtml(m.material_name || "Candidate")}
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            ${escapeHtml(m.material_category || "")} • Score: <strong>${parseFloat(recItem.compatibility_score || 0).toFixed(1)}%</strong>
          </p>
          <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.75rem;">
            Unit Cost: <strong>$${(recItem.unit_package_cost || 0).toFixed(4)}</strong><br>
            Sust. Index: <strong>${(recItem.sustainability_index || 0).toFixed(1)} / 100</strong>
          </div>
        </div>
      `;
      profileGrid.appendChild(card);
    });
  }

  // 11. Alternative Materials Cards
  const altContainer = document.getElementById("alternatives-container");
  if (altContainer) {
    altContainer.innerHTML = "";
    const altKeys = [
      { key: "alternative_match", title: "Alternative Match", icon: "🥈" },
      { key: "lower_cost_alternative", title: "Lower-Cost Alternative", icon: "💰" },
      { key: "sustainability_oriented_alternative", title: "Sustainability-Oriented Alternative", icon: "🌿" }
    ];

    altKeys.forEach(item => {
      const alt = recs[item.key];
      if (!alt || !alt.material) return;
      const m = alt.material;
      const score = parseFloat(alt.compatibility_score || 0).toFixed(1);

      const card = document.createElement("div");
      card.className = "alternative-card";
      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <span class="badge badge-green">${item.icon} ${escapeHtml(item.title)}</span>
            <span style="font-weight: 800; color: var(--dark-green); font-size: 1.1rem;">${score}%</span>
          </div>
          <h3 style="font-size: 1.1rem; color: var(--text-primary); font-weight: 700; margin-bottom: 0.35rem;">
            ${escapeHtml(m.material_name)}
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            ${escapeHtml(m.material_category || "")} • $${m.estimated_cost || "-"}/m² • ${m.recyclability || "-"}% Recyclable
          </p>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 1rem;">
            ${escapeHtml((alt.reasons || [])[0] || "Alternative packaging solution meeting fundamental barrier requirements.")}
          </p>
        </div>
        <div style="border-top: 1px solid var(--border); padding-top: 0.75rem;">
          <a href="/compare" class="btn btn-secondary btn-sm" style="width: 100%;">
            Compare Specifications
          </a>
        </div>
      `;
      altContainer.appendChild(card);
    });
  }

  // 12. Warnings Section
  const warningsSection = document.getElementById("warnings-section");
  const warningsContent = document.getElementById("warnings-content");
  const warnings = primaryMatch.warnings || [];
  if (warningsSection && warningsContent && warnings.length > 0) {
    warningsContent.innerHTML = `
      <div style="font-size: 1.3rem;">⚠️</div>
      <div>
        <strong style="display: block; margin-bottom: 0.25rem;">Advisory & Boundary Constraints:</strong>
        <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem; line-height: 1.5;">
          ${warnings.map(w => `<li>${escapeHtml(w)}</li>`).join("")}
        </ul>
      </div>
    `;
    warningsSection.style.display = "block";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
