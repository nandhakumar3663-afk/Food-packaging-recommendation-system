# Smart Food Packaging Recommendation System

An explainable, multi-attribute packaging decision intelligence and recommendation system that pairs food commodities with optimal packaging materials based on barrier chemistry (OTR, WVTR, light transmission), food properties (moisture, lipid oxidation, respiration, pH), logistical conditions, sustainability, and economic cost.

---

## Hardware Constraint & Design Discipline

Developed and tested for local execution on:
- **Processor**: AMD Ryzen 5 5500U (6 Cores / 12 Threads)
- **RAM**: 8 GB
- **Graphics**: Integrated AMD Radeon Graphics (No NVIDIA GPU / No CUDA)

### Architectural Commitments
1. **100% CPU-Only Execution**: Zero dependencies on CUDA, PyTorch, TensorFlow GPU, cuDNN, or NVIDIA-specific runtimes.
2. **Transparent Domain Core**: Deterministic domain boundary rules (`rules/packaging_rules.yaml`) separate from Python business logic.
3. **Multi-Attribute Scoring**: Project-defined compatibility scores with transparent weighting across oxygen, moisture, shelf life, mechanical, seal, sustainability, and cost metrics.
4. **Data Integrity & Provenance**: Real packaging specifications cite verified literature (Robertson, Massey, USDA). All benchmark test records are explicitly tagged `SYNTHETIC DEMONSTRATION DATA`.
5. **No Runtime Retraining**: Offline-trained CPU ML models with sub-millisecond inference and zero startup overhead.

---

## Completed Phases

### Phase 1: Core Domain Engine & SQLite Database ✅
- Structured tables (`food`, `packaging_material`, `storage`, `recommendation`) with performance indices.
- Domain validation layer enforcing physical boundaries.
- Declarative YAML rule engine (R001–R008).
- Multi-criteria compatibility scoring engine.
- Validated literature datasets and synthetic test items.

### Phase 2: Flask Backend & Recommendation API Integration ✅
- Clean Flask application factory (`create_app`) with centralized JSON error handling (400, 404, 500).
- Modular blueprint routing (`/api/foods`, `/api/materials`, `/api/analyze`, `/api/history`, `/api/presets`, `/api/health`).
- Neutral 4-category recommendation output: `Recommended Match`, `Alternative Match`, `Lower-cost Alternative`, and `Sustainability-oriented Alternative`.
- Automatic recommendation persistence in SQLite history.

### Phase 3: Frontend Web Application & User Experience ✅
- Responsive web application built with Vanilla HTML5, CSS3, and JavaScript.
- Home, Analyze, Results, Compare, History, and Printable Report pages.
- Client-side validation and multi-step progress simulation.

### Phase 4: Machine Learning Integration & UI/UX Redesign ✅
- **Lightweight CPU Machine Learning**:
  - `RandomForestClassifier` (100 Trees, CPU-only) and `XGBClassifier` (`tree_method="hist"`).
  - Feature engineering pipeline (10 properties: moisture, fat, pH, respiration, temperature, RH, shelf life, sensitivities).
  - 144-record dataset explicitly stamped `SYNTHETIC DEMONSTRATION DATA`.
  - Artifact persistence in `ml/artifacts/` with sub-millisecond inference and zero runtime server retraining.
  - Hybrid AI architecture: Domain Rules $\rightarrow$ ML Probability Ranking $\rightarrow$ Rule Veto Guarantee $\rightarrow$ Multi-criteria Blend.
- **Eco-Friendly Light-Green UI/UX**:
  - Answers 3 core questions immediately: *What do I enter? What did the system find? Why did it recommend this?*
  - 4-step progressive disclosure wizard on `/analyze` with food preset loader and inline units.

### Phase 5: Decision Intelligence, Cost, Sustainability, Reporting & Data Quality ✅
- **Multi-Objective Strategic Profiles**:
  - `Balanced Performance`: Evaluates all criteria evenly.
  - `Cost Priority`: Weights affordability at 30% while enforcing baseline food safety barrier thresholds.
  - `Sustainability Priority`: Weights recyclability and bio-renewable circularity at 30%.
  - Cross-profile comparison matrix demonstrating how recommendations adapt to organizational strategy.
- **Transparent Cost Analysis**:
  - Substrate rate benchmark ($/m²), unit package cost calculation for standard 0.05 m² pouch, and cost tiers (Budget, Moderate, Premium, Specialty).
  - Explicit non-quote disclosure to prevent fabricated commercial pricing.
- **Project-Defined Sustainability Index**:
  - Composite formula: $(0.40 \times \text{Recyclability}) + (0.35 \times \text{Renewable Content}) + (0.25 \times \text{End-of-Life Score})$.
  - Clear non-certification disclaimer distinguishing project heuristic from ISO 14040/14044 LCA.
- **Enhanced Comparison & 16-Section Report**:
  - Multi-material checkboxes and side-by-side modal comparison on `/compare`.
  - 16-section professional printable audit report on `/report` linkable by ID (`/report?id=1`).
  - Searchable recommendation history with preference profile badges and ID lookup.
- **Data Quality Governance**:
  - Provenance tracking (`LITERATURE-BACKED` vs `SYNTHETIC DEMONSTRATION DATA`).
  - Automated CLI audit script (`scripts/audit_data.py`).
  - Model metadata and provenance registry (`ml/artifacts/model_metadata.json`).

---

## Project Structure

```
Food-packaging-recommendation-system/
│
├── app/
│   ├── __init__.py               # Application factory with centralized error handlers
│   ├── config.py                 # Configuration & scoring weights across preference profiles
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── main.py               # Template pages and health check routes
│   │   ├── analysis.py           # POST /api/analyze and GET /api/presets
│   │   └── recommendation.py     # Foods, materials, and history routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── recommendation_service.py # Orchestrates validation, rules, scoring, profiles, history
│   │   ├── rule_engine.py        # YAML domain rule filter
│   │   ├── scoring_engine.py     # Weighted multi-attribute compatibility scoring
│   │   ├── cost_service.py       # Cost classification, unit pricing, and benchmarking
│   │   ├── sustainability_service.py # Project-Defined Sustainability Index
│   │   └── provenance_service.py # Literature vs Synthetic classification
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py           # SQLite connection & CRUD functions
│   │   └── schemas.py            # Dataclasses & schema structures
│   └── utils/
│       ├── __init__.py
│       ├── constants.py          # Enums, scales, units, and categories
│       └── validation.py         # Input validation layer
│
├── ml/
│   ├── artifacts/
│   │   ├── random_forest_model.joblib # Trained RF pipeline
│   │   ├── xgboost_model.joblib       # Trained XGBoost model
│   │   ├── label_encoder.joblib       # Target class encoder
│   │   ├── feature_schema.json        # 10 feature names & categorical encodings
│   │   ├── model_metrics.json         # Evaluation metrics & confusion matrix
│   │   └── model_metadata.json        # Comprehensive model metadata registry
│   ├── data/
│   │   └── food_packaging_dataset.csv # 144 synthetic demonstration training samples
│   ├── inference/
│   │   └── predictor.py          # CPU-only ML inference engine
│   └── training/
│       ├── prepare_dataset.py    # Generates demonstration training dataset
│       ├── train_random_forest.py# Trains RF model (100 estimators, CPU)
│       └── train_xgboost.py      # Trains XGBoost model (CPU hist)
│
├── rules/
│   └── packaging_rules.yaml      # Declarative packaging boundary rules
│
├── data/
│   ├── sample/
│   │   ├── sample_foods.json     # Curated benchmark food items
│   │   └── sample_materials.json # Curated packaging materials with citations
│   └── packaging_system.db       # Local SQLite database
│
├── templates/
│   ├── base.html                 # Base layout, navbar, loading overlay, footer
│   ├── index.html                # Home overview & feature pillars
│   ├── analyze.html              # 4-step wizard with preference profiles & validation
│   ├── results.html              # 10-tier hierarchy, key packaging reqs, profile comparison
│   ├── compare.html              # Multi-select checkboxes & side-by-side comparison modal
│   ├── history.html              # Recommendation history with profile badges & ID lookup
│   └── report.html               # 16-section professional printable audit report
│
├── static/
│   ├── css/
│   │   └── style.css             # Vanilla CSS design system & print styles
│   └── js/
│       ├── api.js                # Centralized REST API client
│       ├── ui.js                 # Toasts, progress modal, formatting helpers
│       ├── analyze.js            # Form controller & client validation
│       ├── results.js            # Results renderer & score visualizer
│       ├── compare.js            # Catalog matrix filter & side-by-side modal
│       └── history.js            # Historical log controller with ID lookup
│
├── scripts/
│   ├── init_db.py                # Initializes SQLite database schema & indices
│   ├── seed_data.py              # Validates and seeds sample records
│   ├── verify_db.py              # Queries and audits database contents
│   └── audit_data.py             # Data quality, boundary, and provenance audit script
│
├── tests/
│   ├── test_api.py               # Integration tests for REST API endpoints & templates
│   ├── test_validation.py        # Boundary and domain validation tests
│   ├── test_database.py          # Database schema and CRUD tests
│   ├── test_rule_engine.py       # YAML rule triggering & filtering tests
│   ├── test_scoring_engine.py    # Scoring normalization & weight tests
│   ├── test_ml.py                # ML inference & hybrid veto tests
│   └── test_e2e_phase5.py        # Phase 5 E2E, profiles, cost, sustainability, audit tests
│
├── docs/
│   ├── api.md                    # REST API documentation & schemas
│   ├── frontend.md               # Frontend architecture & user flow documentation
│   ├── data_dictionary.md        # Detailed schema specifications
│   ├── data_sources.md           # Provenance, citations, and test conditions
│   ├── cost_analysis.md          # Cost methodology, tiers, and unit conversions
│   ├── sustainability.md         # Project-Defined Sustainability Index formula & disclaimer
│   ├── reporting.md              # 16-section printable report specifications
│   ├── data_quality.md           # Provenance tiers and audit methodology
│   └── model_limitations.md      # Disclosures, assumptions, and hardware constraints
│
├── requirements.txt              # CPU-only pinned dependencies
├── run.py                        # Local Flask server entry point
└── README.md
```

---

## Setup & Execution Guide

### 1. Create Virtual Environment
Using standard Python on Linux:
```bash
python -m venv .venv
source .venv/bin/activate
```

### 2. Install CPU-Only Dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialize SQLite Database & Seed Data
```bash
python scripts/init_db.py
python scripts/seed_data.py
```

### 4. Run Data Quality Audit
```bash
python scripts/audit_data.py
```

### 5. Start Flask Server
```bash
python run.py
```
*Server starts on `http://127.0.0.1:5000`.*

Open your web browser and navigate to:
- `http://127.0.0.1:5000/` (Home Overview)
- `http://127.0.0.1:5000/analyze` (Run Packaging Analysis with Preference Profiles)
- `http://127.0.0.1:5000/results` (View 10-Tier Recommendation Hierarchy)
- `http://127.0.0.1:5000/compare` (Select & Compare Materials Side-by-Side)
- `http://127.0.0.1:5000/history` (Audit Prior Analyses with Profile Badges)
- `http://127.0.0.1:5000/report` (View & Print 16-Section Audit Report)

### 6. Run Automated Test Suite
```bash
python -m pytest tests/ -v
```

---

## Scientific & Domain Disclaimer

The compatibility scores and recommendations generated by this software represent **computational estimates derived from published barrier literature and engineering rule heuristics**. They do **not** constitute experimentally certified shelf-life guarantees. Real shelf-life depends on packaging seal integrity, microbiological load, head-space gas ratios, temperature abuse during logistics, and specific food formulation.