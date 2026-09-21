"""
Phase 7 System Hardening, Edge-Case, Security, and Benchmark Test Suite.
Verifies API robustness, security controls, offline transitions, reassessment immutability,
and CPU performance benchmarks on AMD Ryzen 5 5500U.
"""

import time
import pytest
from pathlib import Path
from datetime import datetime, timezone, timedelta

from app import create_app
from app.models.database import (
    init_database,
    get_db_connection,
    insert_iot_reading,
    get_recommendation_by_id,
    get_active_devices,
)
from app.config import Config
from ml.inference.predictor import MLPredictor
from scripts.seed_data import seed_database


@pytest.fixture
def client(tmp_path):
    """Test client with isolated temporary SQLite database."""
    test_db = tmp_path / "hardening_test.db"
    seed_database(db_path=test_db)

    class TestConfig(Config):
        TESTING = True
        DATABASE_PATH = test_db
        IOT_OFFLINE_THRESHOLD_SECONDS = 60

    app = create_app(TestConfig)
    with app.test_client() as c:
        with app.app_context():
            yield c


# =====================================================================
# 1. API Hardening & Boundary Fuzzing
# =====================================================================

class TestApiHardening:
    """Verify defensive handling of invalid types, boundaries, and query parameters."""

    def test_iot_readings_negative_limit_rejected(self, client):
        resp = client.get("/api/iot/readings?limit=-10")
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "limit" in data["error"].lower()

    def test_iot_readings_oversized_limit_rejected(self, client):
        resp = client.get("/api/iot/readings?limit=9999")
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "100" in data["error"]

    def test_iot_readings_non_integer_limit_rejected(self, client):
        resp = client.get("/api/iot/readings?limit=abc")
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False

    def test_iot_readings_non_integer_analysis_id_rejected(self, client):
        resp = client.get("/api/iot/readings?analysis_id=invalid_id")
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "analysis_id" in data["error"]

    def test_iot_post_non_json_rejected(self, client):
        resp = client.post(
            "/api/iot/readings",
            data="raw non-json text string",
            headers={"Content-Type": "text/plain"}
        )
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "application/json" in data["error"].lower()

    def test_iot_post_non_object_json_rejected(self, client):
        resp = client.post("/api/iot/readings", json=[1, 2, 3])
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "object" in data["error"].lower()

    def test_404_json_error_handler(self, client):
        resp = client.get("/api/non_existent_route_404")
        assert resp.status_code == 404
        data = resp.get_json()
        assert data["success"] is False
        assert "not found" in data["error"].lower()

    def test_405_method_not_allowed_handler(self, client):
        resp = client.post("/api/presets")
        assert resp.status_code == 405
        data = resp.get_json()
        assert data["success"] is False
        assert "not allowed" in data["error"].lower()


# =====================================================================
# 2. Security & Repository Hygiene
# =====================================================================

class TestSecurityControls:
    """Verify that credentials and local environment configs are protected."""

    def test_gitignore_protects_hardware_secrets(self):
        gitignore_path = Path(__file__).resolve().parent.parent / ".gitignore"
        assert gitignore_path.exists()
        content = gitignore_path.read_text(encoding="utf-8")

        assert "iot/esp32/config.h" in content
        assert ".env" in content
        assert "*.key" in content

    def test_no_live_firmware_credentials_committed(self):
        esp32_dir = Path(__file__).resolve().parent.parent / "iot" / "esp32"
        # Real config.h must NOT exist in version control, only config.h.example
        config_h = esp32_dir / "config.h"
        assert not config_h.exists(), "Live config.h detected! Only config.h.example should be committed."
        assert (esp32_dir / "config.h.example").exists()


# =====================================================================
# 3. IoT Edge Cases & State Transitions
# =====================================================================

class TestIoTEdgeCases:
    """Verify hardware disconnect states, offline transitions, and burst traffic."""

    def test_sensor_disconnect_nullable_co2(self, client):
        payload = {
            "device_id": "ESP32_DISCONNECT_TEST",
            "temperature": 20.5,
            "humidity": 55.0,
            "co2": None,  # Physically absent / disconnected SCD30
            "source": "SENSOR OBSERVATION"
        }
        resp = client.post("/api/iot/readings", json=payload)
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["success"] is True

        latest_resp = client.get("/api/iot/latest?device_id=ESP32_DISCONNECT_TEST")
        assert latest_resp.status_code == 200
        reading = latest_resp.get_json()["reading"]
        assert reading["co2"] is None

    def test_offline_device_detection_transition(self, client):
        # 1. Insert a reading with timestamp 120 seconds in the past
        past_time = (datetime.now(timezone.utc) - timedelta(seconds=120)).isoformat()
        stale_payload = {
            "device_id": "ESP32_STALE_NODE",
            "timestamp": past_time,
            "temperature": 21.0,
            "humidity": 50.0,
            "co2": 400.0,
            "source": "SENSOR OBSERVATION"
        }
        resp = client.post("/api/iot/readings", json=stale_payload)
        assert resp.status_code == 201

        # 2. Query device list with 60s threshold
        devices_resp = client.get("/api/iot/devices")
        assert devices_resp.status_code == 200
        devices = devices_resp.get_json()["devices"]
        stale_device = next((d for d in devices if d["device_id"] == "ESP32_STALE_NODE"), None)

        assert stale_device is not None
        assert stale_device["status"] == "OFFLINE"
        assert stale_device["seconds_since_ping"] > 60

    def test_rapid_sequential_telemetry_burst(self, client):
        # Transmit 10 readings in rapid succession to ensure no SQLite lock contention
        reading_ids = []
        for i in range(10):
            payload = {
                "device_id": "ESP32_BURST_NODE",
                "temperature": 18.0 + (i * 0.1),
                "humidity": 60.0,
                "source": "SIMULATED SENSOR DATA"
            }
            resp = client.post("/api/iot/readings", json=payload)
            assert resp.status_code == 201
            reading_ids.append(resp.get_json()["reading_id"])

        assert len(set(reading_ids)) == 10


# =====================================================================
# 4. Reassessment Immutability & Audit Trail
# =====================================================================

class TestReassessmentImmutability:
    """Verify that reassessing storage conditions creates a new record without mutating baseline."""

    def test_reassessment_preserves_original_recommendation(self, client):
        # 1. Create original recommendation
        initial_payload = {
            "food_name": "Fresh Blueberries",
            "category": "Produce",
            "moisture": 84.0,
            "fat": 0.3,
            "ph": 3.3,
            "respiration_rate": "High",
            "target_shelf_life": 14,
            "storage_temperature": 2.0,
            "storage_rh": 90.0,
            "light_sensitivity": "Medium",
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "preference_profile": "balanced"
        }
        res1 = client.post("/api/analyze", json=initial_payload).get_json()
        assert res1["success"] is True
        orig_id = res1["recommendation_id"]

        # Capture initial record fingerprint from database
        app = client.application
        orig_before = get_recommendation_by_id(orig_id, db_path=app.config["DATABASE_PATH"])
        assert orig_before is not None

        # 2. Trigger reassessment with elevated temperature
        reassess_payload = dict(initial_payload)
        reassess_payload["storage_temperature"] = 12.5  # Warm excursion
        reassess_payload["source_analysis_id"] = orig_id

        res2 = client.post("/api/analyze", json=reassess_payload).get_json()
        assert res2["success"] is True
        new_id = res2["recommendation_id"]

        assert new_id != orig_id

        # 3. Verify original record has NOT changed
        orig_after = get_recommendation_by_id(orig_id, db_path=app.config["DATABASE_PATH"])
        assert orig_before["recommendation_id"] == orig_after["recommendation_id"]
        assert orig_before["compatibility_score"] == orig_after["compatibility_score"]
        assert orig_before["selected_material_id"] == orig_after["selected_material_id"]
        assert orig_before["input_snapshot"] == orig_after["input_snapshot"]


# =====================================================================
# 5. Performance Benchmarks on AMD Ryzen 5 5500U
# =====================================================================

class TestPerformanceBenchmarks:
    """Verify sub-millisecond to low-millisecond execution times on target CPU hardware."""

    def test_cpu_ml_inference_latency(self):
        predictor = MLPredictor()
        sample_features = {
            "moisture": 85.0,
            "fat": 1.0,
            "ph": 4.5,
            "respiration_rate": "High",
            "storage_temperature": 4.0,
            "storage_rh": 85.0,
            "target_shelf_life": 21,
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "light_sensitivity": "Medium",
        }

        # Warm-up run
        predictor.predict(sample_features)

        # Timed inference run
        latencies = []
        for _ in range(50):
            t0 = time.perf_counter()
            predictor.predict(sample_features)
            latencies.append((time.perf_counter() - t0) * 1000.0)

        avg_latency = sum(latencies) / len(latencies)
        assert avg_latency < 50.0, f"CPU ML inference latency {avg_latency:.2f}ms exceeds 50.0ms threshold!"

    def test_iot_telemetry_ingestion_latency(self, client):
        payload = {
            "device_id": "ESP32_PERF_NODE",
            "temperature": 4.5,
            "humidity": 88.0,
            "co2": 420.0,
            "source": "SIMULATED SENSOR DATA"
        }

        # Warm-up
        client.post("/api/iot/readings", json=payload)

        # Timed ingestion runs
        latencies = []
        for _ in range(20):
            t0 = time.perf_counter()
            resp = client.post("/api/iot/readings", json=payload)
            latencies.append((time.perf_counter() - t0) * 1000.0)
            assert resp.status_code == 201

        avg_latency = sum(latencies) / len(latencies)
        assert avg_latency < 25.0, f"IoT ingestion latency {avg_latency:.2f}ms exceeds 25.0ms ceiling!"
