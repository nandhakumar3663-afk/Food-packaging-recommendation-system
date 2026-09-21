# Frontend Architecture & Web Application Documentation

This document describes the design system, client-side modules, page architecture, and user flow for the **Smart Food Packaging Recommendation System**.

---

## 1. Technology & Design Philosophy

- **Core Technologies**: Semantic HTML5, Vanilla CSS3 (Custom Design System), and Modular Vanilla JavaScript (ES2022).
- **Zero Heavy Frameworks**: No React, Vue, Next.js, Angular, Webpack, or Tailwind build chains.
- **Hardware Profile**: Optimized for CPU-only execution on an AMD Ryzen 5 5500U with 8 GB RAM. Minimal asset sizes (<120 KB total assets), zero render blocking.
- **Aesthetic**: Modern technical dashboard with a deep slate/navy palette (`#0b132b`, `#1c274c`), emerald accents for sustainability metrics (`#10b981`), cyan highlights for interactive states (`#06b6d4`), and clean border contrasts.

---

## 2. Template Structure & Pages

```
templates/
├── base.html        # Shared navigation, branding, progressive loading overlay, toast container, footer
├── index.html       # Landing overview, 4-step workflow, core feature pillars, technical callout
├── analyze.html     # Food properties input form, preset loader, client-side validation
├── results.html     # Recommendation dashboard, hero match card, subscore progress bars, alternatives
├── compare.html     # Interactive packaging material catalog matrix with live search and filter
├── history.html     # SQLite historical analysis audit log with pagination
└── report.html      # Clean, printable PDF/print media audit report
```

### Page Descriptions & User Flow

1. **Home (`/home` or `/`)**:
   - Presents the system mission, 4-step pipeline (Enter $\rightarrow$ Analyze $\rightarrow$ Filter $\rightarrow$ Recommend), core engineering pillars (Rule Engine, Scoring Model, Literature Database, Explainability), and the CPU hardware commitment.
   - Primary Call to Action: **Start Analysis**.

2. **Analysis (`/analyze`)**:
   - **Preset Loader**: One-click dropdown to prefill verified literature reference commodities (Roasted Coffee Beans, Fresh Strawberries, Potato Chips, Raw Beef Steak, Aged Cheddar Cheese, etc.).
   - **Input Sections**:
     - *1. Food Commodity & Chemical Composition*: Name, Category, Moisture %, Fat %, pH.
     - *2. Respiration & Environmental Conditions*: Respiration Rate (None to Very High), Storage Temperature (°C), Relative Humidity (% RH), Storage Protocol, Logistics Condition.
     - *3. Shelf-Life Target & Degradation Sensitivities*: Target Shelf Life (days), Oxygen Sensitivity, Moisture Sensitivity, Light Sensitivity.
   - **Client-Side Validation**: Immediate feedback on boundaries (e.g. combined moisture + fat $\le 100\%$, pH $1.0-14.0$, non-negative ranges).
   - **Progressive Loading Simulation**: A multi-step visual modal showing live progress across chemical analysis, barrier evaluation, candidate filtering, and scoring.

3. **Results Dashboard (`/results`)**:
   - **Analyzed Profile Banner**: Displays key input attributes.
   - **Primary Recommended Match (Hero Card)**: Material name, category, polymer type, project-defined compatibility score (0 - 100%), specifications (OTR, WVTR, thickness, recyclability, renewable content, cost $/m²), and provenance citation.
   - **Subscore Visual Bars**: Normalized progress bars for Oxygen, Moisture, Shelf Life, Mechanical, Sealability, Sustainability, and Cost.
   - **"Why This Recommendation?"**: Human-readable explanations formulated from backend heuristics.
   - **Triggered Rules**: Details of rules fired by the YAML rule engine.
   - **Alternative Material Matches**: 3 neutral alternative cards:
     - *Alternative Match*: Runner-up overall score.
     - *Lower-cost Alternative*: Optimized for cost priority.
     - *Sustainability-oriented Alternative*: Optimized for high recyclability and bio-based content.

4. **Catalog Matrix (`/compare`)**:
   - Searchable, filterable table comparing all 12 packaging materials.
   - Real-time search across material names and polymer types.
   - Category filtering (Flexible Film, Multi-layer Laminate, Bio-polymer, Glass, Paper & Paperboard).
   - Provenance badges distinguishing literature-backed values from synthetic testing benchmarks.

5. **Evaluation History (`/history`)**:
   - Displays all historical analyses stored in SQLite.
   - Pagination limit dropdown (10, 20, 50, 100).
   - Actions to view the result dashboard or open the printable audit report.

6. **Printable Report (`/report/<rec_id>` or `/report`)**:
   - Formatted using CSS `@media print` rules.
   - Hides navigation bars, buttons, and backgrounds for clean printer/PDF export.
   - Displays food profile, material properties, subscore tables, triggered rules, and domain disclaimers.

---

## 3. Modular JavaScript Architecture

The client-side logic is split into focused modules located in `static/js/`:

| Module | Responsibility |
| :--- | :--- |
| [`api.js`](../static/js/api.js) | Centralized `fetch()` client. Handles HTTP 400/404/500 errors, network connection drops, and exposes clean promise methods (`getFoods`, `getMaterials`, `analyzePackaging`, `getHistory`, `getPresets`). |
| [`ui.js`](../static/js/ui.js) | UI utilities: non-blocking toast notifications (`UI.showToast`), simulated progressive loading overlay (`UI.simulateAnalysisProgress`), provenance badge generator, and score color-coders. |
| [`analyze.js`](../static/js/analyze.js) | Form state management, dynamic preset autofill, client-side boundary validation, submit handling, and redirect to results view via `sessionStorage`. |
| [`results.js`](../static/js/results.js) | Renders recommendation results from `sessionStorage` or `/api/history/<id>`, animates subscore progress bars, formats triggered rule cards, and populates alternatives. |
| [`compare.js`](../static/js/compare.js) | Fetches materials catalog via `API.getMaterials()`, populates category filters, and performs real-time client-side table filtering. |
| [`history.js`](../static/js/history.js) | Loads historical analyses from `API.getHistory()`, handles limit changes, and creates action links. |

---

## 4. Validation Architecture

1. **Client-Side Validation (User Experience)**:
   - Provides immediate feedback near the input fields before network requests.
   - Checks:
     - `food_name`: Minimum 2 characters.
     - `moisture`: $0.0 \le \text{moisture} \le 100.0\%$.
     - `fat`: $0.0 \le \text{fat} \le 100.0\%$.
     - `moisture + fat`: $\le 100.0\%$.
     - `ph`: $1.0 \le \text{pH} \le 14.0$.
     - `storage_temperature`: $-40.0^\circ\text{C} \le \text{temp} \le 60.0^\circ\text{C}$.
     - `storage_rh`: $0.0 \le \text{RH} \le 100.0\%$.
     - `target_shelf_life`: $1 \le \text{days} \le 3650$.
     - Required dropdown selections for category, sensitivities, and respiration.

2. **Backend Validation (Authoritative Gatekeeper)**:
   - Enforced by `app/utils/validation.py` inside `RecommendationService`.
   - Any invalid payload returns `HTTP 400 Bad Request` with structured error messages.

---

## 5. Responsive Design & Accessibility

- **Responsive Breakpoints**:
  - `> 900px`: Multi-column grid layouts (2, 3, 4 columns).
  - `768px - 900px`: 2-column or stacked layout.
  - `< 768px`: Single column mobile view with collapsible hamburger navigation menu and horizontally scrollable data tables.
- **Accessibility**:
  - Explicit `<label for="...">` associations on all form controls.
  - High color contrast meeting WCAG AA standards.
  - Visible focus outlines (`box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15)`).
  - Semantic HTML tags (`<header>`, `<main>`, `<footer>`, `<section>`).
