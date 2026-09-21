# Final System Architecture

**Smart Food Packaging Recommendation System — Phase 8**  
*CPU-Only Architecture | AMD Ryzen 5 5500U, 8 GB RAM, Integrated AMD Radeon*

---

## System Pipeline

```
USER
 ↓
WEB UI (Vanilla HTML5 / CSS3 / JavaScript)
 ↓
FLASK REST API (Application Factory + 4 Blueprints)
 ↓
RECOMMENDATION SERVICE (Orchestration Layer)
 ↓
┌──────────────────┬──────────────────┐
│   RULE ENGINE    │    ML MODEL      │
│  (YAML Boundary  │ (Random Forest + │
│   Filters R001-  │  XGBoost, CPU)   │
│   R008 + Veto)   │                  │
└──────────────────┴──────────────────┘
 ↓
COMPATIBILITY SCORING ENGINE (Multi-Attribute Weighted 0-100)
 ↓
┌──────────────────┬──────────────────┐
│  COST SERVICE    │ SUSTAINABILITY   │
│  ($/m² → Unit    │  SERVICE         │
│   Package Cost)  │ (Circularity     │
│                  │  Index 0-100)    │
└──────────────────┴──────────────────┘
 ↓
16-SECTION AUDIT REPORT
 ↓
IOT MONITORING (Simulated / Physical ESP32)
 ↓
STORAGE CONDITION EVALUATION (NORMAL / WATCH / WARNING)
 ↓
REASSESSMENT (New recommendation, original immutable)
```

---

## Component Architecture Table

| Component | Responsibility | Inputs | Outputs | Technology | Limitations |
|---|---|---|---|---|---|
| **Web UI** | User interaction, form wizard, result display | User clicks, form entries | HTTP requests to API | Vanilla HTML5, CSS3, ES6 JavaScript | No framework (React/Vue); pure vanilla JS |
| **Flask API** | REST endpoint routing, request validation, error handling | HTTP JSON requests | JSON responses, HTML pages | Flask 3.x, Blueprints | Single-threaded dev server; use Gunicorn for production |
| **Recommendation Service** | Orchestrates validation → rules → ML → scoring → persistence | Food properties, storage conditions, preference profile | Categorized recommendations with scores | Python, SQLite | Sequential processing; no parallel candidate evaluation |
| **Rule Engine** | Filters unsafe packaging candidates using declarative domain rules | Food properties (pH, respiration, fat, moisture) | Vetoed material IDs, rule evaluation log | YAML rules, Python interpreter | 8 rules (R001-R008); not exhaustive for all food-packaging combinations |
| **ML Model** | Probabilistic ranking of candidate materials | 10 engineered features | Material class probabilities | scikit-learn RandomForest, XGBoost (CPU) | Trained on 144 synthetic demonstration records; not real-world validated |
| **Scoring Engine** | Multi-attribute weighted compatibility scoring | Material barrier properties, food requirements | Normalized score 0-100 | Python numerical computation | Project-defined weights; not experimentally calibrated |
| **Cost Service** | Substrate cost benchmarking and unit pricing | Material cost_per_sqm from database | Cost tier, unit package cost, transparency note | Python | Literature-based benchmarks; not live market prices |
| **Sustainability Service** | Circularity index computation | Recyclability, renewable content, end-of-life pathway | Composite sustainability score 0-100 | Python | Project-defined heuristic; not ISO 14040 LCA |
| **Provenance Service** | Data source classification | Material/food source metadata | LITERATURE-BACKED / SYNTHETIC labels | Python | Binary classification; no granular confidence levels |
| **Storage Monitor** | Real-time baseline deviation evaluation | Sensor readings, analysis baseline | NORMAL/WATCH/WARNING status, reason statement | Python | Threshold-based; no predictive modeling of degradation |
| **IoT API** | Telemetry ingestion, device management, pruning | Sensor JSON payloads | Reading IDs, assessment, device status | Flask Blueprint, SQLite | Physical hardware validation pending; validated via simulator |
| **SQLite Database** | Persistent storage for all domain data | CRUD operations | Structured records | SQLite 3 | Single-writer; not suitable for high-concurrency production |
| **ESP32 Firmware** | Edge sensor data collection and HTTP transmission | DHT22 (Temp/RH), SCD30 (CO₂) | JSON telemetry via HTTP POST | C++ / Arduino framework | Physical hardware validation pending |
| **CLI Simulator** | Simulated telemetry generation for demonstration | Command-line arguments | HTTP POST to IoT API | Python (urllib) | Generates SIMULATED SENSOR DATA only |

---

## Data Flow

### Pre-Packaging Analysis Flow

```
1. User enters food properties (moisture, fat, pH, respiration, sensitivities)
2. User enters storage conditions (temperature, RH, shelf life)
3. User selects preference profile (balanced / cost / sustainability)
4. Flask API validates input against physical domain boundaries
5. Rule Engine applies YAML boundary filters (R001-R008)
   → Vetoed materials are permanently excluded
6. ML Predictor ranks remaining candidates by probability
7. Scoring Engine calculates weighted compatibility scores
8. Cost Service computes unit packaging economics
9. Sustainability Service computes circularity index
10. Recommendation Service categorizes results:
    - Recommended Match
    - Alternative Match
    - Lower-Cost Alternative
    - Sustainability-Oriented Alternative
11. Results persisted to SQLite with full input snapshot
12. JSON response returned to frontend
```

### Post-Packaging IoT Monitoring Flow

```
1. ESP32 (or simulator) sends telemetry → POST /api/iot/readings
2. IoT validation layer rejects NaN, Inf, out-of-range values
3. Storage Monitor compares reading against analysis baseline
4. Condition state assigned: NORMAL / WATCH / WARNING / UNKNOWN
5. Non-defamatory reason statement generated
6. Reading persisted to SQLite iot_readings table
7. Dashboard polls /api/iot/latest for live updates
8. If WARNING: user may trigger reassessment
9. Reassessment creates new recommendation record (original immutable)
```

---

## Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Language | Python | 3.10+ | CPU-only execution |
| Web Framework | Flask | 3.x | Application factory pattern |
| Database | SQLite | 3 | File-based, zero-config |
| ML (Classification) | scikit-learn | 1.4+ | RandomForestClassifier (100 trees) |
| ML (Gradient Boosting) | XGBoost | 1.7.6 | tree_method="hist" (CPU) |
| Data Processing | pandas, numpy | Latest | Feature engineering |
| Serialization | joblib | 1.3+ | Model artifact persistence |
| Rules | PyYAML | 6.0+ | Declarative rule definitions |
| Frontend | HTML5, CSS3, ES6 JS | N/A | No framework dependency |
| IoT Firmware | C++ / Arduino | N/A | ESP32 DevKit target |
| Testing | pytest | 8.0+ | Automated test suite |

---

## Known Limitations

1. **ML Training Data**: 144 synthetic demonstration records. Not validated against real-world packaging performance data.
2. **Physical IoT Hardware**: Validation pending. Software pipeline validated using simulated sensor telemetry.
3. **Database Concurrency**: SQLite single-writer limitation. Not suitable for multi-user production without migration to PostgreSQL.
4. **Scoring Calibration**: Compatibility scoring weights are project-defined, not experimentally calibrated against shelf-life studies.
5. **Cost Data**: Literature-based benchmark estimates. Not live commercial pricing.
6. **Sustainability Index**: Project-defined circularity heuristic. Not an ISO 14040/14044 certified Life Cycle Assessment.
7. **Rule Coverage**: 8 declarative rules cover common food-packaging incompatibilities but are not exhaustive.
