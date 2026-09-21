# IoT Telemetry Architecture & Data Governance

## Overview

Phase 6 implements a lightweight, robust telemetry pipeline designed to ingest, validate, store, and analyze storage environmental data from microcontrollers without heavy infrastructure dependencies (no Kafka, Redis, or cloud daemons).

---

## 1. End-to-End Data Flow

```
+------------------+       +-------------------+       +-----------------------+
|  ESP32 Hardware  |       | Flask Ingestion   |       |  SQLite Persistence   |
|  or Simulator    | ----> | /api/iot/readings | ----> |  Table: iot_readings  |
|  (HTTP POST)     |       | (Validation Layer)|       |  Indexed by Timestamp |
+------------------+       +-------------------+       +-----------------------+
                                     |                             |
                                     v                             v
                           +-------------------+       +-----------------------+
                           |  StorageMonitor   |       |    Web Dashboard      |
                           |  Risk Assessment  | ----> |    Route: /monitor    |
                           |  (Normal/Watch/   |       |    (Live Polling 5s)  |
                           |   Warning/Unknown)|       +-----------------------+
                           +-------------------+                   |
                                                                   v
                                                       +-----------------------+
                                                       | Reassess Conditions   |
                                                       | (Logs New Analysis)   |
                                                       +-----------------------+
```

### Flow Sequence:
1. **Acquisition:** ESP32 node samples temperature and humidity every 10 seconds.
2. **Buffering & Retry:** If Wi-Fi is temporarily unavailable, packets are buffered in a local FIFO ring buffer.
3. **Ingestion:** Packets are transmitted via HTTP POST to `/api/iot/readings`.
4. **Validation:** Ingestion layer enforces strict type, boundary, and non-NaN checks.
5. **Assessment:** `StorageMonitor` service compares observed telemetry against linked packaging analysis baseline conditions.
6. **Storage:** Reading is written to the SQLite `iot_readings` table.
7. **Visualization:** Web dashboard polls `/api/iot/latest` and `/api/iot/readings` to update live gauges, condition status badges, and trend charts.

---

## 2. Telemetry Ingestion Schema

### Request (`POST /api/iot/readings`):
```json
{
  "device_id": "ESP32-COLDCHAIN-01",
  "temperature": 5.2,
  "humidity": 84.0,
  "co2": null,
  "analysis_id": 1,
  "signal_quality": -62,
  "source": "SENSOR OBSERVATION"
}
```

### Strict Validation Rules:
- `device_id`: String, 1–64 characters, regex `^[a-zA-Z0-9_\-\.]{1,64}$`.
- `temperature`: Float, $-50.0^\circ\text{C} \le T \le 100.0^\circ\text{C}$, NaN and Inf rejected.
- `humidity`: Float, $0.0\% \le H \le 100.0\%$, NaN and Inf rejected.
- `co2`: Nullable float, $0.0 \le \text{CO}_2 \le 50,000.0\text{ ppm}$, NaN and Inf rejected.
- `timestamp`: Optional ISO8601 string, defaults to current UTC time.
- `source`: Tagged as `"SENSOR OBSERVATION"` or `"SIMULATED SENSOR DATA"`.

---

## 3. Database Schema & Retention Policy

### Table: `iot_readings`
```sql
CREATE TABLE IF NOT EXISTS iot_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    co2 REAL,
    analysis_id INTEGER,
    status TEXT DEFAULT 'NORMAL',
    source TEXT DEFAULT 'SENSOR OBSERVATION',
    signal_quality INTEGER,
    FOREIGN KEY(analysis_id) REFERENCES recommendation(recommendation_id)
);
```

### Performance Indices:
- `idx_iot_timestamp` on `iot_readings(timestamp)`: Fast time-series querying.
- `idx_iot_device` on `iot_readings(device_id)`: Per-device lookup and device status evaluation.
- `idx_iot_analysis` on `iot_readings(analysis_id)`: Analysis baseline linking.

### Data Retention Enforcement:
To prevent unbounded database file growth on embedded and student development machines:
1. **Age-Based Pruning:** Records older than `30 days` (`IOT_RETENTION_DAYS`) are automatically purged.
2. **Volume Cap:** A per-device cap of `5000 records` (`IOT_MAX_RECORDS_PER_DEVICE`) ensures older telemetry is trimmed.
3. **Trigger:** Can be invoked via maintenance API `POST /api/iot/prune`.

---

## 4. Offline Device Detection

To prevent displaying stale data as live readings:
- A device is designated **ONLINE** only if it has transmitted a valid packet within the last `60 seconds` (`IOT_OFFLINE_THRESHOLD_SECONDS`).
- If no reading is received within 60 seconds, the dashboard displays:
  > **NO RECENT SENSOR DATA** — The microcontroller has not transmitted within the last 60 seconds. Previous readings are preserved for inspection, but live conditions cannot be verified.
- The condition state falls back to **UNKNOWN** if data is missing or stale.

---

## 5. Security & Isolation

- **No Hardcoded Credentials:** Wi-Fi passwords and server URLs are excluded from version control using `config.h.example`.
- **Bounded Query Limits:** All GET endpoints enforce bounded maximum query limits (max 100 records per request) to prevent resource exhaustion.
- **Data Provenance Separation:** Simulated data is permanently stamped `"SIMULATED SENSOR DATA"` and cannot masquerade as real hardware observations.
