# Deployment Audit & Architecture Assessment
**Smart Food Packaging Recommendation System — Production Deployment to Render**  
*Target Environment: Render Cloud (Python 3.12 Web Service + Render Managed PostgreSQL)*  
*Hardware Profile: CPU-Only (Zero CUDA, Zero GPU Packages)*  
*Evaluation Date: 2026-09-21*

---

## 1. Executive Summary
This audit inspects the existing **Smart Food Packaging Recommendation System** repository to define the exact production deployment strategy for Render. The system combines a Flask REST backend, client-side Jinja2/vanilla JavaScript frontend, scikit-learn/XGBoost CPU machine learning inference, declarative YAML rule engine, multi-attribute scoring engine, and an IoT storage monitoring pipeline.

---

## 2. Current Architecture & Components

| Component | Current Implementation | Production Target | Notes |
|:---|:---|:---|:---|
| **Web Framework** | Flask 3.0+ Application Factory (`app.create_app`) | Flask 3.0+ | Factory initialized at module level in `run.py` as `run:app`. |
| **WSGI Server** | Flask development server (`app.run()`) | Gunicorn 21.2+ (`gunicorn run:app`) | Configured to bind to `0.0.0.0:$PORT` with 2 worker processes. |
| **Runtime Language** | Python 3.12 (local development) | Python 3.12.3 pinned via `.python-version` | Matches AMD Ryzen 5 5500U local environment. |
| **Database** | SQLite (`data/packaging_system.db`) | Dual Backend: SQLite (Local) / PostgreSQL (Production) | PostgreSQL selected whenever `DATABASE_URL` is set in environment. |
| **ML Models** | Scikit-learn Random Forest (~410 KB) & XGBoost (~841 KB) | Pre-trained models loaded into memory via `MLPredictor` singleton | Zero runtime retraining; CPU inference latency < 20 ms. |
| **Rules Engine** | PyYAML declarative rules (`rules/packaging_rules.yaml`) | Read-only in-memory YAML parsing | Immutable rule veto layer. |
| **IoT Layer** | HTTP ingestion `/api/iot/readings` & dashboard `/monitor` | Software pipeline + local/remote simulator (`scripts/simulate_iot.py`) | Explicitly tagged as `SIMULATED SENSOR DATA`. Physical hardware pending. |
| **Static & Templates** | Vanilla CSS, JavaScript (`static/`), Jinja2 (`templates/`) | Served directly via Flask | Same-origin architecture; no external CDN dependencies. |

---

## 3. Ephemeral Filesystem Risk & Production Database Strategy

### Risk Analysis
Render Web Services operate on ephemeral containers. Any files written to local disk (such as `data/packaging_system.db`) are lost whenever:
- The service restarts (e.g., free tier sleep, crash recovery)
- A new commit is deployed
- The service scales or moves to a new host

### Production Strategy
1. **Dual Database Engine**:
   - **Local Development & Testing**: SQLite remains the default when `DATABASE_URL` is not provided. All 118 existing unit/integration tests continue passing against SQLite without requiring a local PostgreSQL service.
   - **Production (Render)**: When `DATABASE_URL` is present (pointing to a Render PostgreSQL instance), the connection context manager automatically activates the PostgreSQL driver (`psycopg2-binary`).
2. **Schema & Reference Data**:
   - Schema initialization (`scripts/init_db.py`) creates all tables and indices idempotently (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).
   - Reference food and packaging material catalogs are seeded explicitly (`python scripts/init_db.py --seed`) rather than re-inserting duplicates on every server boot.
   - Dynamic runtime data (recommendation history, IoT telemetry) persists permanently in PostgreSQL across deploys and container recycles.

---

## 4. Flask Application Entry Point Analysis

- In `run.py`:
  ```python
  from app import create_app
  from app.config import Config, DevelopmentConfig, ProductionConfig

  _config_map = {
      "development": DevelopmentConfig,
      "production": ProductionConfig,
      "testing": Config,
  }
  env = os.environ.get("FLASK_ENV", "development").lower()
  config_class = _config_map.get(env, Config)
  app = create_app(config_class)
  ```
- **Gunicorn Target**: `run:app`
- **Verified Local Command**:
  ```bash
  gunicorn --bind 0.0.0.0:$PORT run:app --workers 2 --timeout 60
  ```

---

## 5. Required Environment Variables

| Variable | Required | Default / Example | Purpose |
|:---|:---:|:---|:---|
| `FLASK_ENV` | Yes | `production` | Selects `ProductionConfig` (disables debug mode, enforces secure logging). |
| `PORT` | Yes | `10000` (set by Render) | Port to bind Gunicorn server. |
| `SECRET_KEY` | Yes | Secure random string | Signs session cookies and CSRF tokens. |
| `DATABASE_URL` | Yes (in prod) | `postgresql://user:pass@host:5432/dbname` | Render PostgreSQL connection string. Falls back to SQLite if absent. |
| `HOST` | No | `0.0.0.0` | Bind host. |
| `PYTHON_VERSION`| No | `3.12.3` | Pinned Python runtime. |
| `API_BASE_URL` | No | Target base URL | Used by `scripts/simulate_iot.py` to send telemetry to production. |

---

## 6. Secret & Security Audit Findings

1. **Hardcoded Secrets**: Audited `password`, `secret`, `token`, `api_key`, `private_key`, `BEGIN PRIVATE KEY`, and `DATABASE_URL`. Zero active credentials committed.
2. **Hardware Secrets**: `iot/esp32/config.h` is protected in `.gitignore`. Only `config.h.example` exists.
3. **Environment Files**: `.env` and `*.env` are strictly excluded by `.gitignore`.
4. **Error Exposure**: Centralized error handlers in `app/__init__.py` intercept HTTP 400, 404, 405, and 500, returning sanitized JSON without leaking stack traces or internal server paths.
5. **CORS**: Same-origin architecture; no permissive wildcard headers (`*`) enabled.

---

## 7. Machine Learning Artifact Audit

- Pre-trained models stored in `ml/artifacts/`:
  - `random_forest_model.joblib` (410 KB)
  - `xgboost_model.joblib` (841 KB)
  - `label_encoder.joblib` (940 B)
  - `feature_schema.json` (1.05 KB)
- **Lifecycle**: Models are committed to the repository and loaded once on worker initialization via `MLPredictor`. Startup does NOT trigger retraining.

---

## 8. IoT Subsystem Deployment Strategy

- **Physical Hardware Constraint**: Physical ESP32 hardware is not present.
- **Reporting Rule**: The application explicitly reports:
  > *"Physical hardware validation is pending. The IoT software pipeline was validated using simulated sensor telemetry."*
- **Simulator Portability**: `scripts/simulate_iot.py` is configured with configurable `API_BASE_URL` / `--url` to allow transmitting telemetry to the live deployed Render URL. All generated data is tagged `SIMULATED SENSOR DATA`.

---

## 9. Required Codebase Changes Summary

1. Add `gunicorn>=21.2.0` and `psycopg2-binary>=2.9.9` to `requirements.txt`.
2. Add `.python-version` with `3.12.3`.
3. Add `DATABASE_URL` handling to `app/config.py`.
4. Implement dual SQLite / PostgreSQL abstraction in `app/models/database.py`.
5. Update `scripts/init_db.py` and `scripts/seed_data.py` to support PostgreSQL and optional `--seed`.
6. Update `scripts/simulate_iot.py` to read `API_BASE_URL` and `--url`.
7. Replace local `/home/nandha/...` file links in `docs/frontend.md` with repository-relative paths.
8. Create `render.yaml` and `.env.example`.
9. Document deployment procedures in `docs/deployment.md` and `docs/deployment_completion.md`.
