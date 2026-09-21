"""
IoT Sensor Data Validation Layer.
Validates payloads received from microcontrollers (ESP32) and local simulators.
Rejects invalid types, NaN, infinities, impossible physiological values, and malformed timestamps.
"""

import math
import re
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional


# Validation bounds
TEMP_MIN_CELSIUS = -50.0
TEMP_MAX_CELSIUS = 100.0

HUMIDITY_MIN_PERCENT = 0.0
HUMIDITY_MAX_PERCENT = 100.0

CO2_MIN_PPM = 0.0
CO2_MAX_PPM = 50000.0

DEVICE_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]{1,64}$")


def validate_iot_payload(payload: Any) -> Tuple[bool, Optional[Dict[str, Any]], List[str]]:
    """
    Validate incoming IoT reading JSON payload.

    Returns:
        (is_valid, cleaned_data, error_messages)
    """
    errors: List[str] = []

    if not isinstance(payload, dict):
        return False, None, ["Payload must be a JSON object."]

    cleaned: Dict[str, Any] = {}

    # 1. Device ID
    device_id = payload.get("device_id")
    if device_id is None:
        errors.append("Field 'device_id' is required.")
    elif not isinstance(device_id, str):
        errors.append("Field 'device_id' must be a string.")
    else:
        device_id = device_id.strip()
        if not DEVICE_ID_REGEX.match(device_id):
            errors.append("Field 'device_id' must be 1-64 alphanumeric characters (allowing dashes, underscores, dots).")
        else:
            cleaned["device_id"] = device_id

    # 2. Temperature (°C)
    temp = payload.get("temperature")
    if temp is None:
        errors.append("Field 'temperature' is required.")
    elif not isinstance(temp, (int, float)) or isinstance(temp, bool):
        errors.append("Field 'temperature' must be a numeric value.")
    elif math.isnan(temp) or math.isinf(temp):
        errors.append("Field 'temperature' cannot be NaN or infinite.")
    elif not (TEMP_MIN_CELSIUS <= temp <= TEMP_MAX_CELSIUS):
        errors.append(f"Temperature {temp}°C is out of realistic range ({TEMP_MIN_CELSIUS}°C to {TEMP_MAX_CELSIUS}°C).")
    else:
        cleaned["temperature"] = round(float(temp), 2)

    # 3. Humidity (% RH)
    humidity = payload.get("humidity")
    if humidity is None:
        errors.append("Field 'humidity' is required.")
    elif not isinstance(humidity, (int, float)) or isinstance(humidity, bool):
        errors.append("Field 'humidity' must be a numeric value.")
    elif math.isnan(humidity) or math.isinf(humidity):
        errors.append("Field 'humidity' cannot be NaN or infinite.")
    elif not (HUMIDITY_MIN_PERCENT <= humidity <= HUMIDITY_MAX_PERCENT):
        errors.append(f"Humidity {humidity}% is out of realistic range ({HUMIDITY_MIN_PERCENT}% to {HUMIDITY_MAX_PERCENT}%).")
    else:
        cleaned["humidity"] = round(float(humidity), 2)

    # 4. CO2 (ppm) — Optional, allow None/null
    co2 = payload.get("co2")
    if co2 is not None:
        if not isinstance(co2, (int, float)) or isinstance(co2, bool):
            errors.append("Field 'co2', if provided, must be a numeric value or null.")
        elif math.isnan(co2) or math.isinf(co2):
            errors.append("Field 'co2' cannot be NaN or infinite.")
        elif not (CO2_MIN_PPM <= co2 <= CO2_MAX_PPM):
            errors.append(f"CO2 concentration {co2} ppm is out of realistic range ({CO2_MIN_PPM} to {CO2_MAX_PPM} ppm).")
        else:
            cleaned["co2"] = round(float(co2), 2)
    else:
        cleaned["co2"] = None

    # 5. Timestamp — Optional, ISO8601 string or None
    timestamp = payload.get("timestamp")
    if timestamp is not None:
        if not isinstance(timestamp, str):
            errors.append("Field 'timestamp' must be an ISO8601 string.")
        else:
            ts_str = timestamp.strip()
            # Normalize trailing Z
            if ts_str.endswith("Z"):
                ts_str = ts_str[:-1] + "+00:00"
            try:
                dt = datetime.fromisoformat(ts_str)
                # Store normalized string for SQLite
                cleaned["timestamp"] = dt.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                errors.append(f"Malformed timestamp format '{timestamp}'. Expected ISO8601 (e.g. '2026-09-21T18:30:00Z').")
    else:
        cleaned["timestamp"] = None

    # 6. Analysis ID — Optional, foreign key to recommendation
    analysis_id = payload.get("analysis_id")
    if analysis_id is not None:
        if not isinstance(analysis_id, int) or isinstance(analysis_id, bool) or analysis_id <= 0:
            errors.append("Field 'analysis_id' must be a positive integer.")
        else:
            cleaned["analysis_id"] = analysis_id
    else:
        cleaned["analysis_id"] = None

    # 7. Status & Source Metadata
    source = payload.get("source", "SENSOR OBSERVATION")
    if not isinstance(source, str):
        cleaned["source"] = "SENSOR OBSERVATION"
    elif "SIMULATED" in source.upper():
        cleaned["source"] = "SIMULATED SENSOR DATA"
    else:
        cleaned["source"] = "SENSOR OBSERVATION"

    signal_quality = payload.get("signal_quality")
    if signal_quality is not None and isinstance(signal_quality, (int, float)) and not math.isnan(signal_quality):
        cleaned["signal_quality"] = int(signal_quality)
    else:
        cleaned["signal_quality"] = None

    if errors:
        return False, None, errors

    return True, cleaned, []
