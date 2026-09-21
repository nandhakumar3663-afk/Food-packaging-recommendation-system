# Packaging Recommendation Reporting System

## Overview

The Smart Food Packaging Recommendation System includes an auditable 16-section printable HTML report view accessible at `/report` and directly linkable via recommendation ID (e.g. `/report?id=3`).

The report formats multi-attribute engineering findings into a standardized audit document suitable for academic grading, client presentations, and packaging quality records.

---

## 1. 16-Section Structure

The report follows a structured 16-section layout:

1. **Document Title & Header:**
   - Formal title, Analysis ID (`#ID`), timestamp, and organizational audit label.
2. **Executive Summary:**
   - High-level narrative identifying the food, storage conditions, and recommended packaging match with compatibility score.
3. **Input Food Physiological Profile:**
   - Commodity name, category, moisture %, fat %, pH, and respiration activity.
4. **Storage & Environmental Parameters:**
   - Target shelf life (days), storage temperature (°C), relative humidity (% RH), storage environment, and logistics handling.
5. **Food Preservation Sensitivities:**
   - Qualitative ratings for oxygen sensitivity, moisture sensitivity, and light sensitivity.
6. **Computed Key Packaging Requirements:**
   - Dynamic barrier targets (OTR demand, WVTR demand, mechanical durability, gas exchange mode).
7. **Active Multi-Objective Preference Profile:**
   - Displays whether `Balanced`, `Cost Priority`, or `Sustainability Priority` governed candidate scoring.
8. **Primary Packaging Material Recommendation:**
   - Material name, category, polymer type, gauge thickness, and final compatibility score.
   - Plain-English justification bullet points.
9. **Compatibility Subscores Breakdown:**
   - Subscores for oxygen barrier, moisture barrier, shelf-life fit, mechanical strength, sealability, circularity, and cost.
10. **Cost Analysis & Economic Benchmark:**
    - Raw substrate cost ($/m²), estimated unit pouch cost ($0.05 m² standard unit), economic tier, and non-quote disclaimer.
11. **Sustainability & Circularity Assessment:**
    - Project-Defined Sustainability Index (0–100), recyclability %, renewable content %, and end-of-life recovery pathway.
12. **Machine Learning Model Assessment:**
    - Model family (Random Forest / XGBoost), CPU execution note, candidate prediction confidence, and safety override status.
13. **Domain Rules & Safety Guardrails Triggered:**
    - Explicit list of active expert system rules evaluated for physiological compatibility and veto status.
14. **Viable Alternative Packaging Candidates:**
    - Secondary alternatives including close match, lower-cost candidate, and sustainability-oriented candidate.
15. **Data Provenance & Authoritative Citations:**
    - Provenance classification (`LITERATURE-BACKED` vs `SYNTHETIC DEMONSTRATION DATA`), academic literature citations (Robertson, 2012; Massey, 2003).
16. **Assumptions, Model Limitations & Laboratory Testing Notice:**
    - Formal statement covering CPU execution scope, synthetic model training notice, and mandatory real-world barrier/shelf-life testing prerequisites.

---

## 2. Print & PDF Styling

The report is styled with CSS media print queries:
- Automatically hides web navigation bars, toolbars, and action buttons during print.
- Enforces crisp black/dark-green typography on pure white background.
- Eliminates unnecessary box-shadows to ensure clean PDF export via browser print dialog (`Ctrl+P` / `Cmd+P`).

---

## 3. Data Retrieval & Auditing

The report page operates dual data retrieval:
1. **Direct Query via ID (`/report?id=1`):** Fetches the historic record from the SQLite `recommendation` table and reconstructs the full 16-section view from the stored `input_snapshot`.
2. **Current Session Run:** Reads from client-side `sessionStorage` for immediate, real-time inspection right after analysis.
