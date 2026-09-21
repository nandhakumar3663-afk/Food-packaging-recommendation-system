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

### Phase 6: IoT-Based Real-Time Storage Monitoring ✅
- **Real-Time Telemetry Ingestion & Storage**:
  - Dedicated SQLite `iot_readings` table with indexing on timestamp, device_id, and analysis_id.
  - REST endpoints (`POST /api/iot/readings`, `GET /api/iot/readings`, `GET /api/iot/latest`, `GET /api/iot/devices`, `GET /api/iot/status`).
  - Strict input validation rejecting NaN, Infinity, and out-of-physical-range sensor values.
  - Strict provenance tagging: `SENSOR OBSERVATION` for physical hardware, `SIMULATED SENSOR DATA` for simulator.
- **Baseline Deviation Evaluator & Non-Defamation Guardrails**:
  - Multi-tier evaluation: `NORMAL`, `WATCH` (±2°C / ±8% RH), `WARNING` (±5°C / ±15% RH / thermal abuse), `UNKNOWN`.
  - Non-defamatory notifications: *"Storage condition requires review — observed temperature deviates from analysis baseline."*
  - Original packaging recommendations remain immutable; reassessment writes a distinct new record.
  - Missing CO₂ sensor gracefully handled as `"Sensor Unavailable / Not Installed"` without fabricating dummy data.
- **Web Dashboard & Reporting Integration**:
  - Real-time dashboard at `/monitor` with live temperature, humidity, CO₂ gauges, and dynamic status badges.
  - Offline device indicator automatically triggered after 60 seconds of sensor inactivity.
  - SVG historical trend chart and active recommendation comparison card.
  - Dynamic Section 16 integration in the printable report on `/report`.
- **ESP32 Firmware & Local Telemetry Simulator**:
  - Non-blocking C++ ESP32 firmware (`iot/esp32/smart_packaging_esp32.ino`) with ring-buffer caching for offline recovery.
  - Standalone Python CLI simulator (`scripts/simulate_iot.py`) supporting normal, watch, and warning modes.

### Phase 7: Real-World Validation, System Hardening & Final Demonstration ✅
- **Exhaustive System Audit & Hardening**:
  - Complete architecture, limitations, risks, and validation audit documented in `docs/final_system_audit.md`.
  - API defense-in-depth: query parameter bounds checking (limit bounded 1–100, invalid inputs rejected), defensive JSON parsing, and zero traceback leakage.
  - Security and secret hygiene: gitignore exclusions for `config.h`, `.env`, and credential patterns.
- **Automated Demonstration Runner & Walkthrough**:
  - Standalone, zero-dependency CLI demonstration script (`scripts/demo.py`) executing all 8 pipeline stages from analysis to excursion and reassessment.
  - Verified regulatory immutability: Reassessment writes a separate auditable record while leaving the original analysis untouched.
  - 15-step interactive manual documented in `docs/final_demo.md`.
- **Comprehensive Capstone Documentation**:
  - Objective 15-subsystem project scorecard in `docs/project_status.md` (14 Complete, 1 Hardware Validation Pending).
  - 18-section capstone architecture and engineering report in `docs/final_project_report.md`.
- **98 Automated Tests Passing**:
  - Expanded test suite covering boundary fuzzing, offline transitions, security controls, immutability, and CPU performance benchmarks on AMD Ryzen 5 5500U.

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
│   │   ├── main.py               # Template pages (/monitor, /analyze, /results, /compare, /history, /report)
│   │   ├── analysis.py           # POST /api/analyze and GET /api/presets
│   │   ├── recommendation.py     # Foods, materials, and history routes
│   │   └── iot.py                # REST endpoints for IoT ingestion, latest status, and pruning
│   ├── services/
│   │   ├── __init__.py
│   │   ├── recommendation_service.py # Orchestrates validation, rules, scoring, profiles, history
│   │   ├── rule_engine.py        # YAML domain rule filter
│   │   ├── scoring_engine.py     # Weighted multi-attribute compatibility scoring
│   │   ├── cost_service.py       # Cost classification, unit pricing, and benchmarking
│   │   ├── sustainability_service.py # Project-Defined Sustainability Index
│   │   ├── provenance_service.py # Literature vs Synthetic classification
│   │   └── storage_monitor.py    # Real-time baseline deviation evaluator & aggregates
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py           # SQLite connection & CRUD functions (including IoT readings)
│   │   └── schemas.py            # Dataclasses & schema structures
│   └── utils/
│       ├── __init__.py
│       ├── constants.py          # Enums, scales, units, and categories
│       ├── validation.py         # Input validation layer for foods & materials
│       └── iot_validation.py     # Strict sensor validation (NaN/Inf rejection, ranges)
│
├── iot/
│   └── esp32/
│       ├── smart_packaging_esp32.ino # Non-blocking C++ ESP32 firmware with ring buffer
│       └── config.h.example          # Wi-Fi and server configuration template
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
│   ├── report.html               # 16-section professional printable audit report
│   └── monitor.html              # Real-time IoT monitoring dashboard with live SVG chart
│
├── static/
│   ├── css/
│   │   └── style.css             # Vanilla CSS design system & print styles
│   └── js/
│       ├── api.js                # Centralized REST API client (with IoT helper methods)
│       ├── ui.js                 # Toasts, progress modal, formatting helpers
│       ├── analyze.js            # Form controller & client validation
│       ├── results.js            # Results renderer & score visualizer
│       ├── compare.js            # Catalog matrix filter & side-by-side modal
│       ├── history.js            # Historical log controller with ID lookup
│       └── monitor.js            # Live telemetry polling, dynamic SVG trend chart, reassessment
│
├── scripts/
│   ├── init_db.py                # Initializes SQLite database schema & indices
│   ├── seed_data.py              # Validates and seeds sample records
│   ├── verify_db.py              # Queries and audits database contents
│   ├── audit_data.py             # Data quality, boundary, and provenance audit script
│   ├── simulate_iot.py           # Standalone CLI telemetry simulator (normal/watch/warning)
│   └── demo.py                   # Automated 8-stage end-to-end demonstration runner
│
├── tests/
│   ├── test_api.py               # Integration tests for REST API endpoints & templates
│   ├── test_validation.py        # Boundary and domain validation tests
│   ├── test_database.py          # Database schema and CRUD tests
│   ├── test_rule_engine.py       # YAML rule triggering & filtering tests
│   ├── test_scoring_engine.py    # Scoring normalization & weight tests
│   ├── test_ml.py                # ML inference & hybrid veto tests
│   ├── test_e2e_phase5.py        # Phase 5 E2E, profiles, cost, sustainability, audit tests
│   ├── test_iot.py               # IoT payload validation, CRUD, pruning, monitor states, API tests
│   └── test_phase7_hardening.py  # Boundary fuzzing, security, offline, immutability, benchmark tests
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
│   ├── model_limitations.md      # Disclosures, assumptions, and hardware constraints
│   ├── iot_setup.md              # Hardware wiring, ESP32 pinout, flashing guide, and simulator
│   ├── iot_architecture.md       # Ingestion schema, data pipeline, SQLite schema, retention
│   ├── storage_monitoring.md     # Evaluation matrix, tolerance thresholds, reassessment workflow
│   ├── final_system_audit.md     # Phase 7 full system audit and edge-case review
│   ├── final_demo.md             # 15-step end-to-end demonstration guide
│   ├── project_status.md         # Objective 15-subsystem scorecard
│   └── final_project_report.md   # Comprehensive 18-section capstone architecture report
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
- `http://127.0.0.1:5000/monitor` (Real-Time IoT Storage Telemetry Dashboard)

### 6. Simulate Real-Time IoT Telemetry (Optional)
In a separate terminal, stream simulated ESP32 environmental sensor packets to the running server:
```bash
# Stream 20 normal baseline packets every 2 seconds
python scripts/simulate_iot.py --mode normal --interval 2 --count 20

# Or simulate cold chain temperature excursion (WATCH / WARNING states)
python scripts/simulate_iot.py --mode warning --interval 2 --count 15
```
Telemetry packets are tagged with provenance `"SIMULATED SENSOR DATA"` and can be monitored live on `/monitor`.

### 7. Run End-to-End Automated Demonstration
Execute the automated 8-stage demonstration script verifying the full analysis, recommendation, IoT telemetry, excursion, and reassessment workflow:
```bash
python scripts/demo.py
```

### 8. Run Automated Test Suite
```bash
python -m pytest tests/ -v
```
*Executes all 98 unit, integration, edge-case, and security tests across API, database, rules, scoring, ML, IoT, and system hardening.*

---

## Scientific & Domain Disclaimer

The compatibility scores and recommendations generated by this software represent **computational estimates derived from published barrier literature and engineering rule heuristics**. They do **not** constitute experimentally certified shelf-life guarantees. Real shelf-life depends on packaging seal integrity, microbiological load, head-space gas ratios, temperature abuse during logistics, and specific food formulation.

Furthermore, real-time IoT storage monitoring notifications indicate environmental deviations from the recommended baseline. The system **never** claims food is spoiled or unsafe without laboratory microbiological testing; condition alerts signify that observed storage parameters warrant inspection and operational review.