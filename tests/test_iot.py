"""
Test Suite for Phase 6: IoT-Based Real-Time Storage Monitoring.
Covers sensor payload validation, database CRUD & pruning, storage condition engine,
REST API endpoints, and simulation utilities.
"""

import math
import pytest
from datetime import datetime, timezone

from app import create_app
from app.utils.iot_validation import validate_iot_payload
from app.models.database import (
    init_database,
    insert_iot_reading,
    get_latest_iot_reading,
    get_iot_readings,
    get_active_devices,
    prune_iot_readings,
    insert_recommendation,
)
from app.services.storage_monitor import StorageMonitor
from scripts.simulate_iot import generate_reading


@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    return app.test_client()


# ============================================================================
# 1. Sensor Payload Validation Tests
# ============================================================================

def test_validate_iot_payload_valid():
    payload = {
        "device_id": "ESP32-TEST-01",
        "temperature": 4.5,
        "humidity": 82.0,
        "co2": 450.0,
        "analysis_id": 1,
        "signal_quality": -65,
    }
    is_valid, cleaned, errors = validate_iot_payload(payload)
    assert is_valid is True
    assert len(errors) == 0
    assert cleaned["device_id"] == "ESP32-TEST-01"
    assert cleaned["temperature"] == 4.5
    assert cleaned["humidity"] == 82.0
    assert cleaned["co2"] == 450.0
    assert cleaned["source"] == "SENSOR OBSERVATION"


def test_validate_iot_payload_nullable_co2():
    payload = {
        "device_id": "ESP32-NO-CO2",
        "temperature": 21.0,
        "humidity": 55.0,
        "co2": None,
    }
    is_valid, cleaned, errors = validate_iot_payload(payload)
    assert is_valid is True
    assert cleaned["co2"] is None


def test_validate_iot_payload_missing_required():
    # Missing temperature
    is_valid, _, errors = validate_iot_payload({"device_id": "ESP32", "humidity": 60})
    assert is_valid is False
    assert any("temperature" in e for e in errors)

    # Missing device_id
    is_valid, _, errors = validate_iot_payload({"temperature": 20, "humidity": 60})
    assert is_valid is False
    assert any("device_id" in e for e in errors)


def test_validate_iot_payload_nan_and_inf():
    # NaN temperature
    is_valid, _, errors = validate_iot_payload({
        "device_id": "ESP32",
        "temperature": float("nan"),
        "humidity": 60
    })
    assert is_valid is False
    assert any("NaN" in e for e in errors)

    # Infinite humidity
    is_valid, _, errors = validate_iot_payload({
        "device_id": "ESP32",
        "temperature": 20,
        "humidity": float("inf")
    })
    assert is_valid is False
    assert any("infinite" in e for e in errors)


def test_validate_iot_payload_out_of_bounds():
    # Temperature below -50°C
    is_valid, _, errors = validate_iot_payload({
        "device_id": "ESP32",
        "temperature": -75.0,
        "humidity": 60
    })
    assert is_valid is False
    assert any("realistic range" in e for e in errors)

    # Humidity above 100%
    is_valid, _, errors = validate_iot_payload({
        "device_id": "ESP32",
        "temperature": 20.0,
        "humidity": 120.0
    })
    assert is_valid is False
    assert any("realistic range" in e for e in errors)


def test_validate_iot_payload_malformed_timestamp():
    is_valid, _, errors = validate_iot_payload({
        "device_id": "ESP32",
        "temperature": 20.0,
        "humidity": 60.0,
        "timestamp": "invalid-time-format"
    })
    assert is_valid is False
    assert any("Malformed timestamp" in e for e in errors)


# ============================================================================
# 2. Database CRUD & Retention Tests
# ============================================================================

def test_iot_database_crud(app):
    with app.app_context():
        reading_data = {
            "device_id": "ESP32-CRUD-01",
            "temperature": 5.1,
            "humidity": 83.5,
            "co2": 420.0,
            "analysis_id": None,
            "status": "NORMAL",
            "source": "SENSOR OBSERVATION",
            "signal_quality": -60,
        }
        rid = insert_iot_reading(reading_data)
        assert rid > 0

        latest = get_latest_iot_reading(device_id="ESP32-CRUD-01")
        assert latest is not None
        assert latest["temperature"] == 5.1
        assert latest["humidity"] == 83.5

        readings = get_iot_readings(device_id="ESP32-CRUD-01", limit=10)
        assert len(readings) >= 1
        assert readings[-1]["device_id"] == "ESP32-CRUD-01"


def test_iot_database_pruning(app):
    with app.app_context():
        # Insert test records
        for i in range(5):
            insert_iot_reading({
                "device_id": "ESP32-PRUNE-TEST",
                "temperature": 20.0 + i,
                "humidity": 50.0,
                "co2": None,
                "status": "NORMAL",
                "source": "SIMULATED SENSOR DATA",
                "signal_quality": -70,
            })

        # Prune keeping max 2 records
        pruned = prune_iot_readings(retention_days=30, max_records_per_device=2)
        assert pruned >= 3

        remaining = get_iot_readings(device_id="ESP32-PRUNE-TEST", limit=10)
        assert len(remaining) <= 2


# ============================================================================
# 3. Storage Condition Monitor Engine Tests
# ============================================================================

def test_storage_monitor_states():
    analysis_mock = {
        "recommendation_id": 101,
        "food_name": "Strawberries",
        "input_snapshot": {
            "storage_temperature": 4.0,
            "storage_rh": 85.0,
            "storage_type": "Refrigerated"
        }
    }

    # 1. Normal condition (close to 4.0°C / 85%)
    res_normal = StorageMonitor.evaluate_reading(
        {"temperature": 4.5, "humidity": 86.0, "co2": 400.0, "device_id": "ESP32-01"},
        analysis_mock
    )
    assert res_normal["status"] == "NORMAL"
    assert "aligns" in res_normal["reason"]
    assert "spoiled" not in res_normal["reason"].lower()
    assert "unsafe" not in res_normal["reason"].lower()

    # 2. Watch condition (moderate temperature drift: 7.5°C vs 4.0°C -> delta 3.5°C)
    res_watch = StorageMonitor.evaluate_reading(
        {"temperature": 7.5, "humidity": 85.0, "co2": None, "device_id": "ESP32-01"},
        analysis_mock
    )
    assert res_watch["status"] == "WATCH"
    assert "Condition Drift Observed" in res_watch["condition_label"]

    # 3. Warning condition (severe thermal breach: 12.0°C vs 4.0°C)
    res_warning = StorageMonitor.evaluate_reading(
        {"temperature": 12.0, "humidity": 65.0, "co2": None, "device_id": "ESP32-01"},
        analysis_mock
    )
    assert res_warning["status"] == "WARNING"
    assert "Storage Condition Requires Review" in res_warning["condition_label"]
    assert "requires review" in res_warning["action_advisory"].lower()
    # Confirm no false food safety claims
    assert "food is spoiled" not in res_warning["action_advisory"].lower()
    assert "food is unsafe" not in res_warning["action_advisory"].lower()

    # 4. Unknown condition (no sensor readings)
    res_unknown = StorageMonitor.evaluate_reading(None, analysis_mock)
    assert res_unknown["status"] == "UNKNOWN"
    assert res_unknown["co2_status"] == "UNAVAILABLE"


def test_storage_monitor_aggregates():
    sample_readings = [
        {"temperature": 4.0, "humidity": 80.0, "co2": 400.0, "timestamp": "2026-09-21 12:00:00"},
        {"temperature": 5.0, "humidity": 85.0, "co2": 450.0, "timestamp": "2026-09-21 12:10:00"},
        {"temperature": 6.0, "humidity": 90.0, "co2": None, "timestamp": "2026-09-21 12:20:00"},
    ]
    aggs = StorageMonitor.calculate_aggregate_metrics(sample_readings)
    assert aggs["reading_count"] == 3
    assert aggs["temperature"]["min"] == 4.0
    assert aggs["temperature"]["avg"] == 5.0
    assert aggs["temperature"]["max"] == 6.0
    assert aggs["humidity"]["avg"] == 85.0
    assert aggs["co2"]["available"] is True


# ============================================================================
# 4. REST API Endpoint Tests
# ============================================================================

def test_api_post_reading_success(client):
    payload = {
        "device_id": "ESP32-API-TEST",
        "temperature": 4.2,
        "humidity": 84.0,
        "co2": 420.0,
        "source": "SENSOR OBSERVATION",
    }
    res = client.post("/api/iot/readings", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "reading_id" in data
    assert data["status"] in ["NORMAL", "WATCH", "WARNING"]


def test_api_post_reading_invalid(client):
    # Non-JSON payload
    res = client.post("/api/iot/readings", data="raw-text")
    assert res.status_code == 400

    # Invalid range payload
    bad_payload = {
        "device_id": "ESP32-FAIL",
        "temperature": 150.0,  # Out of range
        "humidity": -10.0,     # Out of range
    }
    res2 = client.post("/api/iot/readings", json=bad_payload)
    assert res2.status_code == 400
    assert res2.get_json()["success"] is False


def test_api_get_endpoints(client):
    # Ensure at least one reading exists
    client.post("/api/iot/readings", json={
        "device_id": "ESP32-GET-TEST",
        "temperature": 5.0,
        "humidity": 80.0,
    })

    # 1. GET /api/iot/readings
    res1 = client.get("/api/iot/readings?limit=5")
    assert res1.status_code == 200
    assert res1.get_json()["success"] is True
    assert "readings" in res1.get_json()

    # 2. GET /api/iot/latest
    res2 = client.get("/api/iot/latest")
    assert res2.status_code == 200
    assert res2.get_json()["success"] is True
    assert "assessment" in res2.get_json()

    # 3. GET /api/iot/devices
    res3 = client.get("/api/iot/devices")
    assert res3.status_code == 200
    assert res3.get_json()["success"] is True

    # 4. GET /api/iot/status
    res4 = client.get("/api/iot/status")
    assert res4.status_code == 200
    assert res4.get_json()["system_status"] in ["ONLINE", "IDLE"]


def test_monitor_page_renders(client):
    res = client.get("/monitor")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Storage Condition Monitor" in html
    assert "Carbon Dioxide" in html


# ============================================================================
# 5. Simulator Telemetry Generation Test
# ============================================================================

def test_simulated_payload_generation():
    pkt = generate_reading("ESP32-SIM-UNIT", "normal", analysis_id=2)
    assert pkt["device_id"] == "ESP32-SIM-UNIT"
    assert pkt["analysis_id"] == 2
    assert pkt["source"] == "SIMULATED SENSOR DATA"
    assert 0 <= pkt["temperature"] <= 15
    assert 0 <= pkt["humidity"] <= 100
