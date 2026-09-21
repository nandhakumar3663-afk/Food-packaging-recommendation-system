# Smart Food Packaging Recommendation System

An explainable, multi-criteria packaging recommendation system that pairs food commodities with optimal packaging materials based on barrier chemistry (OTR, WVTR, light transmission), food properties (moisture, lipid oxidation, respiration, pH), logistical conditions, sustainability, and economic cost.

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
4. **Data Integrity**: Real packaging specifications cite verified literature (Robertson, Massey, USDA). All benchmark test records are explicitly tagged `SYNTHETIC DEMONSTRATION DATA`.

---

## Completed Phases

### Phase 1: Core Domain Engine & SQLite Database
- Structured tables (`food`, `packaging_material`, `storage`, `recommendation`) with performance indices.
- Domain validation layer enforcing physical boundaries.
- Declarative YAML rule engine (R001–R008).
- Multi-criteria compatibility scoring engine.
- Validated literature datasets and synthetic test items.

### Phase 2: Flask Backend & Recommendation API Integration
- Clean Flask application factory (`create_app`) with centralized JSON error handling (400, 404, 500).
- Modular blueprint routing (`/api/foods`, `/api/materials`, `/api/analyze`, `/api/history`, `/api/presets`, `/api/health`).
- Neutral 4-category recommendation output: `Recommended Match`, `Alternative Match`, `Lower-cost Alternative`, and `Sustainability-oriented Alternative`.
- Automatic recommendation persistence in SQLite history.

### Phase 3: Frontend Web Application & User Experience
- Responsive web application built with Vanilla HTML5, CSS3, and JavaScript.
- Home, Analyze, Results, Compare, History, and Printable Report pages.
- Client-side validation and multi-step progress simulation.

### Phase 4: Machine Learning Integration & Complete UI/UX Redesign
- **Lightweight CPU Machine Learning**:
  - `RandomForestClassifier` (100 Trees, CPU-only) and `XGBClassifier` (`tree_method="hist"`).
  - Feature engineering pipeline (10 properties: moisture, fat, pH, respiration, temperature, RH, shelf life, sensitivities).
  - 144-record dataset explicitly stamped `SYNTHETIC DEMONSTRATION DATA`.
  - Artifact persistence in `ml/artifacts/` with sub-millisecond inference and zero runtime server retraining.
  - Hybrid AI architecture: Domain Rules $\rightarrow$ ML Probability Ranking $\rightarrow$ Rule Veto Guarantee $\rightarrow$ Multi-criteria Blend.
- **Complete UI/UX Redesign**:
  - Fresh, eco-friendly light-green visual theme with centralized CSS custom properties.
  - Answers 3 core questions immediately: *What do I enter? What did the system find? Why did it recommend this?*
  - 4-step progressive disclosure wizard on `/analyze` with food preset loader and inline units.
  - Plain-English explanations, score progress bars, ML assessment disclosures, and collapsible technical accordions.
  - 55 automated tests passing in under 2 seconds.

---

## Project Structure

```
Food-packaging-recommendation-system/
│
├── app/
│   ├── __init__.py               # Application factory with centralized error handlers
│   ├── config.py                 # Configuration & scoring weights
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── main.py               # Template pages and health check routes
│   │   ├── analysis.py           # POST /api/analyze and GET /api/presets
│   │   └── recommendation.py     # Foods, materials, and history routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── recommendation_service.py # Orchestrates validation, rules, scoring, and history
│   │   ├── rule_engine.py        # YAML domain rule filter
│   │   └── scoring_engine.py     # Weighted multi-attribute compatibility scoring
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py           # SQLite connection & CRUD functions
│   │   └── schemas.py            # Dataclasses & schema structures
│   └── utils/
│       ├── __init__.py
│       ├── constants.py          # Enums, scales, units, and categories
│       └── validation.py         # Input validation layer
│
├── rules/
│   └── packaging_rules.yaml      # Declarative packaging boundary rules
│
├── data/
│   ├── sample/
│   │   ├── sample_foods.json     # Curated benchmark food items
│   │   └── sample_materials.json # Curated packaging materials with citations
│   └── packaging_system.db       # Local SQLite database (auto-generated)
│
├── templates/
│   ├── base.html                 # Base layout, navbar, loading overlay, footer
│   ├── index.html                # Home overview & feature pillars
│   ├── analyze.html              # Input form with preset loader & validation
│   ├── results.html              # Results dashboard with score bars & alternatives
│   ├── compare.html              # Materials comparison matrix with live search
│   ├── history.html              # Recommendation audit history log
│   └── report.html               # Printable summary report
│
├── static/
│   ├── css/
│   │   └── style.css             # Vanilla CSS design system & print styles
│   └── js/
│       ├── api.js                # Centralized REST API client
│       ├── ui.js                 # Toasts, progress modal, formatting helpers
│       ├── analyze.js            # Form controller & client validation
│       ├── results.js            # Results renderer & score visualizer
│       ├── compare.js            # Catalog matrix filter & search
│       └── history.js            # Historical log controller
│
├── scripts/
│   ├── init_db.py                # Initializes SQLite database schema & indices
│   ├── seed_data.py              # Validates and seeds sample records
│   └── verify_db.py              # Queries and audits database contents
│
├── tests/
│   ├── test_api.py               # Integration tests for REST API endpoints & templates
│   ├── test_validation.py        # Boundary and domain validation tests
│   ├── test_database.py          # Database schema and CRUD tests
│   ├── test_rule_engine.py       # YAML rule triggering & filtering tests
│   └── test_scoring_engine.py    # Scoring normalization & weight tests
│
├── docs/
│   ├── api.md                    # REST API documentation & schemas
│   ├── frontend.md               # Frontend architecture & user flow documentation
│   ├── data_dictionary.md        # Detailed schema specifications
│   └── data_sources.md           # Provenance, citations, and test conditions
│
├── requirements.txt              # CPU-only pinned dependencies
├── run.py                        # Local Flask server entry point
├── .gitignore
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
*(Or with `uv`: `uv venv .venv --python 3.12 && source .venv/bin/activate`)*

### 2. Install CPU-Only Dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialize SQLite Database & Seed Data
```bash
python scripts/init_db.py
python scripts/seed_data.py
```

### 4. Prepare Dataset & Train ML Models (CPU-Only)
```bash
python ml/training/prepare_dataset.py
python ml/training/train_random_forest.py
python ml/training/train_xgboost.py
```
*Generates the 144-record demonstration dataset and trains Random Forest and XGBoost in `ml/artifacts/`.*

### 5. Start Flask Server
```bash
python run.py
```
*Server starts on `http://127.0.0.1:5000`.*

Open your web browser and navigate to:
- `http://127.0.0.1:5000/` or `http://127.0.0.1:5000/home` (Home Overview)
- `http://127.0.0.1:5000/analyze` (Run Step-by-Step Packaging Analysis)
- `http://127.0.0.1:5000/compare` (Materials Comparison Matrix)
- `http://127.0.0.1:5000/history` (Recommendation Audit History)

### 6. Run Automated Test Suite
```bash
python -m pytest tests/ -v
```
*Runs all 55 unit, integration, template, and ML tests in under 2 seconds.*

---

## Example API Request (`POST /api/analyze`)

```bash
curl -X POST http://127.0.0.1:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "food_id": 1,
    "moisture": 78,
    "fat": 0.1,
    "ph": 5.8,
    "respiration_rate": "HIGH",
    "target_shelf_life": 15,
    "storage_temperature": 5,
    "storage_rh": 85,
    "storage_type": "CHILLED",
    "transport_condition": "REFRIGERATED",
    "oxygen_sensitivity": "HIGH",
    "moisture_sensitivity": "HIGH",
    "light_sensitivity": "MEDIUM"
  }'
```

---

## Scientific & Domain Disclaimer

The compatibility scores and recommendations generated by this software represent **computational estimates derived from published barrier literature and engineering rule heuristics**. They do **not** constitute experimentally certified shelf-life guarantees. Real shelf-life depends on packaging seal integrity, microbiological load, head-space gas ratios, temperature abuse during logistics, and specific food formulation.