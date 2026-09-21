"""
IoT Telemetry Ingestion and Monitoring Routes.
Provides endpoints for sensor data ingestion, history querying, device status,
and real-time storage condition evaluation against packaging analysis baselines.
"""

from flask import Blueprint, jsonify, request, current_app
from typing import Optional

from app.utils.iot_validation import validate_iot_payload
from app.models.database import (
    insert_iot_reading,
    get_latest_iot_reading,
    get_iot_readings,
    get_active_devices,
    get_recommendation_by_id,
    prune_iot_readings,
)
from app.services.storage_monitor import StorageMonitor

bp = Blueprint("iot", __name__, url_prefix="/api/iot")


@bp.route("/readings", methods=["POST"])
def post_reading():
    """
    Ingest a new sensor telemetry reading from ESP32 or simulation agent.
    Validates sensor values, checks against baseline tolerances, and saves to SQLite.
    """
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Request body must be valid application/json."
        }), 400

    payload = request.get_json()
    is_valid, cleaned, errors = validate_iot_payload(payload)
    if not is_valid or not cleaned:
        return jsonify({
            "success": False,
            "error": "Validation error in sensor telemetry.",
            "errors": errors
        }), 400

    db_path = current_app.config.get("DATABASE_PATH")

    # If linked to an analysis, perform pre-ingestion condition evaluation
    analysis_rec = None
    if cleaned.get("analysis_id"):
        analysis_rec = get_recommendation_by_id(cleaned["analysis_id"], db_path=db_path)

    assessment = StorageMonitor.evaluate_reading(cleaned, analysis_rec)
    cleaned["status"] = assessment["status"]

    reading_id = insert_iot_reading(cleaned, db_path=db_path)

    return jsonify({
        "success": True,
        "message": "Sensor reading recorded successfully.",
        "reading_id": reading_id,
        "device_id": cleaned["device_id"],
        "status": assessment["status"],
        "condition_label": assessment["condition_label"],
        "assessment": assessment,
    }), 201


@bp.route("/readings", methods=["GET"])
def get_readings_list():
    """
    Retrieve historical sensor telemetry records.
    Query parameters: device_id, analysis_id, limit (bounded 1-100), start_time, end_time.
    """
    db_path = current_app.config.get("DATABASE_PATH")
    device_id = request.args.get("device_id")
    analysis_id = request.args.get("analysis_id", type=int)
    limit = request.args.get("limit", default=50, type=int)
    start_time = request.args.get("start_time")
    end_time = request.args.get("end_time")

    readings = get_iot_readings(
        device_id=device_id,
        analysis_id=analysis_id,
        limit=limit,
        start_time=start_time,
        end_time=end_time,
        db_path=db_path,
    )

    return jsonify({
        "success": True,
        "count": len(readings),
        "readings": readings,
    }), 200


@bp.route("/latest", methods=["GET"])
def get_latest_reading():
    """
    Fetch the most recent sensor reading with condition evaluation.
    Query parameters: device_id (optional), analysis_id (optional).
    """
    db_path = current_app.config.get("DATABASE_PATH")
    device_id = request.args.get("device_id")
    analysis_id = request.args.get("analysis_id", type=int)

    latest = get_latest_iot_reading(device_id=device_id, analysis_id=analysis_id, db_path=db_path)

    analysis_rec = None
    if analysis_id is not None:
        analysis_rec = get_recommendation_by_id(analysis_id, db_path=db_path)
    elif latest and latest.get("analysis_id"):
        analysis_rec = get_recommendation_by_id(latest["analysis_id"], db_path=db_path)

    assessment = StorageMonitor.evaluate_reading(latest, analysis_rec)

    return jsonify({
        "success": True,
        "reading": latest,
        "assessment": assessment,
    }), 200


@bp.route("/devices", methods=["GET"])
def get_devices():
    """List all registered microcontrollers, online/offline status, and sensor support."""
    db_path = current_app.config.get("DATABASE_PATH")
    threshold = current_app.config.get("IOT_OFFLINE_THRESHOLD_SECONDS", 60)
    devices = get_active_devices(offline_threshold_seconds=threshold, db_path=db_path)

    return jsonify({
        "success": True,
        "count": len(devices),
        "devices": devices,
    }), 200


@bp.route("/status", methods=["GET"])
def get_iot_status():
    """Return system-level IoT infrastructure status and data retention health."""
    db_path = current_app.config.get("DATABASE_PATH")
    threshold = current_app.config.get("IOT_OFFLINE_THRESHOLD_SECONDS", 60)
    devices = get_active_devices(offline_threshold_seconds=threshold, db_path=db_path)

    online_count = sum(1 for d in devices if d["status"] == "ONLINE")
    total_readings = sum(d["total_readings"] for d in devices)

    return jsonify({
        "success": True,
        "system_status": "ONLINE" if online_count > 0 else "IDLE",
        "total_devices": len(devices),
        "online_devices": online_count,
        "total_readings_stored": total_readings,
        "offline_threshold_seconds": threshold,
        "retention_policy_days": current_app.config.get("IOT_RETENTION_DAYS", 30),
    }), 200


@bp.route("/analysis/<int:analysis_id>", methods=["GET"])
def get_analysis_monitoring(analysis_id: int):
    """
    Compare real-time storage telemetry directly against baseline assumptions
    for a specific past recommendation analysis.
    """
    db_path = current_app.config.get("DATABASE_PATH")
    analysis_rec = get_recommendation_by_id(analysis_id, db_path=db_path)
    if not analysis_rec:
        return jsonify({
            "success": False,
            "error": f"Packaging analysis #{analysis_id} not found."
        }), 404

    # Fetch latest reading explicitly linked, or fallback to overall latest
    latest = get_latest_iot_reading(analysis_id=analysis_id, db_path=db_path)
    if not latest:
        latest = get_latest_iot_reading(db_path=db_path)

    assessment = StorageMonitor.evaluate_reading(latest, analysis_rec)

    # Fetch recent history for this analysis
    history = get_iot_readings(analysis_id=analysis_id, limit=50, db_path=db_path)
    aggregates = StorageMonitor.calculate_aggregate_metrics(history)

    return jsonify({
        "success": True,
        "analysis_id": analysis_id,
        "analysis": {
            "food_name": analysis_rec["food_name"],
            "category": analysis_rec["category"],
            "material_name": analysis_rec["material_name"],
            "compatibility_score": analysis_rec["compatibility_score"],
            "created_at": analysis_rec["created_at"],
        },
        "latest_reading": latest,
        "assessment": assessment,
        "aggregates": aggregates,
        "history": history,
    }), 200


@bp.route("/prune", methods=["POST"])
def trigger_prune():
    """Admin/maintenance endpoint to prune old telemetry per retention policy."""
    db_path = current_app.config.get("DATABASE_PATH")
    days = current_app.config.get("IOT_RETENTION_DAYS", 30)
    max_rec = current_app.config.get("IOT_MAX_RECORDS_PER_DEVICE", 5000)

    pruned_count = prune_iot_readings(retention_days=days, max_records_per_device=max_rec, db_path=db_path)
    return jsonify({
        "success": True,
        "message": f"Pruned {pruned_count} historical telemetry records.",
        "pruned_count": pruned_count,
    }), 200
