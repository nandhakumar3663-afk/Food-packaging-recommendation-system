# Production Deployment Guide — Render
**Smart Food Packaging Recommendation System — Phase 8 Production Release**  
*Repository: https://github.com/nandhakumar3663-afk/Food-packaging-recommendation-system.git*  
*Target Environment: Render Cloud (Python 3.12 Web Service + Render PostgreSQL)*  
*Hardware Profile: CPU-Only (AMD Ryzen 5 5500U local baseline, zero CUDA, zero GPU packages)*

---

## 1. Overview & Service Metadata

| Parameter | Configuration Value |
|:---|:---|
| **Repository URL** | `https://github.com/nandhakumar3663-afk/Food-packaging-recommendation-system.git` |
| **Production Branch** | `main` |
| **Service Type** | Render Web Service |
| **Runtime** | Python 3.12 (`3.12.3` pinned in `.python-version`) |
| **Build Command** | `pip install -r requirements.txt && python scripts/init_db.py --seed` |
| **Start Command** | `gunicorn --bind 0.0.0.0:$PORT run:app --workers 2 --timeout 60` |
| **Health Check Path** | `/api/health` |
| **Auto-Deploy** | Enabled on git push to `main` |
| **Database** | Render Managed PostgreSQL (`packaging-postgres`) |

---

## 2. Production Database Architecture

### Ephemeral Filesystem Isolation
Render Web Services run in ephemeral containers. If SQLite is used in production, all historical recommendation records and real-time IoT telemetry are wiped whenever the service restarts or redeploys.

### Dual-Engine Strategy
The repository includes a database abstraction layer (`app/models/database.py`):
1. **Local Development**: When `DATABASE_URL` is omitted, the application uses local SQLite (`data/packaging_system.db`).
2. **Production (Render)**: When `DATABASE_URL` is provided by Render PostgreSQL, the application connects to PostgreSQL using `psycopg2-binary`.
3. **Automatic Dialect Handling**: The custom `PostgresCursorWrapper` and `DBRow` automatically:
   - Map `?` placeholders to `%s`
   - Handle integer-indexed column access (`row[0]`) and key access (`row['food_id']`)
   - Auto-append `RETURNING <pk>` to INSERT statements for `cursor.lastrowid`
   - Handle PostgreSQL-compatible timestamp arithmetic and retention pruning

---

## 3. Environment Variables Specification

Configure the following environment variables in the Render Dashboard under **Environment**:

| Variable | Recommended Value | Description |
|:---|:---|:---|
| `FLASK_ENV` | `production` | Enables production security logging and disables Flask debug mode. |
| `PYTHON_VERSION` | `3.12.3` | Enforces exact Python 3.12 runtime. |
| `SECRET_KEY` | *(Click "Generate" in Render)* | Cryptographic key for session cookies. |
| `DATABASE_URL` | *(Linked from Render PostgreSQL)* | Connection string: `postgresql://user:password@hostname:5432/dbname`. |
| `PORT` | *(Injected dynamically by Render)* | Port to bind Gunicorn (default 10000). |
| `API_BASE_URL` | `https://<your-app-name>.onrender.com` | Base URL used by the IoT simulator script. |

> [!WARNING]
> Never set `FLASK_DEBUG=1` in production. Debug mode exposes internal stack traces.

---

## 4. Step-by-Step Render Deployment Instructions

### Option A: Automatic Blueprint Deployment (Recommended)
The repository includes a `render.yaml` blueprint:
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Select your GitHub repository: `Food-packaging-recommendation-system`.
4. Render detects `render.yaml` and will automatically configure:
   - Web Service: `food-packaging-system`
   - Managed Database: `packaging-postgres`
   - Connection link: `DATABASE_URL` injected into the web service
5. Click **Apply**.
6. Render builds the environment, seeds reference catalogs, and starts Gunicorn.

---

### Option B: Manual Service Creation

#### Step 1: Create the Render PostgreSQL Database
1. In Render Dashboard, click **New +** $\rightarrow$ **PostgreSQL**.
2. Name: `packaging-postgres`
3. Database: `packaging_db`
4. User: `packaging_user`
5. Region: Choose closest region (e.g., *Oregon (US West)* or *Frankfurt (EU)*).
6. Plan: **Free**.
7. Click **Create Database**.
8. Once provisioned, copy the **Internal Database URL** (e.g., `postgres://packaging_user:...@dpg-...-a/packaging_db`).

#### Step 2: Create the Render Web Service
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository: `Food-packaging-recommendation-system`.
3. Branch: `main`.
4. Runtime: **Python 3**.
5. Build Command:
   ```bash
   pip install -r requirements.txt && python scripts/init_db.py --seed
   ```
6. Start Command:
   ```bash
   gunicorn --bind 0.0.0.0:$PORT run:app --workers 2 --timeout 60
   ```
7. Plan: **Free**.

#### Step 3: Add Environment Variables
In the Web Service settings under **Environment**:
- `FLASK_ENV`: `production`
- `PYTHON_VERSION`: `3.12.3`
- `SECRET_KEY`: *(Click Generate)*
- `DATABASE_URL`: *(Paste the Internal Database URL from Step 1)*
- Click **Save Changes**. Deploy starts automatically.

---

## 5. Machine Learning Lifecycle in Production

- Models are stored in `ml/artifacts/`:
  - `random_forest_model.joblib` (410 KB)
  - `xgboost_model.joblib` (841 KB)
  - `label_encoder.joblib` (940 B)
  - `feature_schema.json` (1.05 KB)
- **Zero Runtime Retraining**: On Gunicorn worker startup, the `MLPredictor` singleton loads model artifacts into RAM once. Inference runs strictly on CPU in < 20 ms.
- No GPU, CUDA, or heavy deep-learning frameworks (PyTorch/TensorFlow) are included or required.

---

## 6. Remote IoT Telemetry Simulation

Because physical ESP32 hardware is unavailable, the telemetry simulator (`scripts/simulate_iot.py`) can target the deployed production URL:

### 1. Transmit Normal Storage Readings
```bash
python scripts/simulate_iot.py --url https://<your-service>.onrender.com --count 5 --mode normal
```

### 2. Simulate Temperature Breach (Excursion Warning)
```bash
python scripts/simulate_iot.py --url https://<your-service>.onrender.com --count 3 --mode warning --temp 16.5
```

### 3. Continuous Background Simulation
```bash
python scripts/simulate_iot.py --url https://<your-service>.onrender.com --continuous --interval 5
```

All simulated telemetry is explicitly tagged:
> `source: "SIMULATED SENSOR DATA"`

---

## 7. Verification Checklist After Deployment

Test every live endpoint once your service is online (`https://<app>.onrender.com`):

- [ ] `GET /` — Responsive home page loads with light-green design.
- [ ] `GET /api/health` — Returns status 200 with `database_status: "healthy"` and `hardware_profile.cpu_only: true`.
- [ ] `GET /api/foods` — Returns 10 reference food commodities from PostgreSQL.
- [ ] `GET /api/materials` — Returns 12 packaging materials from PostgreSQL.
- [ ] `GET /api/presets` — Returns sample presets.
- [ ] `POST /api/analyze` — Computes packaging recommendation and returns compatibility score.
- [ ] `GET /api/history` — Returns recommendation history.
- [ ] `GET /compare` — Comparison matrix renders with interactive category filters.
- [ ] `GET /monitor` — Live storage monitoring dashboard displays real-time SVG charts.
- [ ] `GET /report?id=1` — Printable audit report renders and formats cleanly for print-to-PDF.

---

## 8. Troubleshooting & FAQ

### 1. `psycopg2.OperationalError: connection to server at ... failed`
- Verify that `DATABASE_URL` is set correctly in the Render Dashboard environment settings.
- If using manual setup, ensure the Web Service and PostgreSQL database are in the same Render region. Use the **Internal Database URL** for zero-latency, private network connectivity.

### 2. Application sleeping on Free tier
- Render's free tier spins down Web Services after 15 minutes of inactivity. The first request after sleep may take ~30-50 seconds (cold start). Subsequent requests respond in < 100 ms.

### 3. Missing tables on first boot
- Check that the build command includes `python scripts/init_db.py --seed`. You can also trigger schema initialization manually using Render Shell:
  ```bash
  python scripts/init_db.py --seed
  ```

---

## 9. Production Limitations & Disclosure
1. **Physical Hardware Validation**:
   > *Physical hardware validation is pending. The IoT software pipeline was validated using simulated sensor telemetry.*
2. **Free Tier Limitations**:
   Render Free Web Services spin down on idle and provide 512 MB RAM. The application is strictly optimized to consume < 140 MB RSS, well within the free tier ceiling.
