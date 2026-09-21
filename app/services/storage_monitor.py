"""
Storage Condition Monitoring Service.
Compares real-time IoT sensor telemetry against baseline packaging analysis conditions.
Evaluates operational risk states (NORMAL, WATCH, WARNING, UNKNOWN) and produces
scientifically objective advisories without making unsupported food safety or spoilage claims.
"""

import json
from typing import Dict, Any, List, Optional, Tuple


class StorageMonitor:
    """Evaluates telemetry data against packaging analysis baseline assumptions."""

    # Tolerances relative to analysis baseline
    TEMP_TOLERANCE_WATCH = 2.0     # ±2°C drift triggers WATCH
    TEMP_TOLERANCE_WARNING = 5.0   # ±5°C drift triggers WARNING
    
    HUMIDITY_TOLERANCE_WATCH = 8.0   # ±8% RH drift triggers WATCH
    HUMIDITY_TOLERANCE_WARNING = 15.0 # ±15% RH drift triggers WARNING

    @classmethod
    def evaluate_reading(
        cls,
        observed_reading: Optional[Dict[str, Any]],
        analysis_record: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate a single telemetry reading against an analysis baseline.

        Returns:
            dict containing:
                - status: 'NORMAL', 'WATCH', 'WARNING', or 'UNKNOWN'
                - reason: Plain-English explanation
                - temp_status: Individual temperature rating
                - humidity_status: Individual humidity rating
                - co2_status: CO2 sensor status
                - deviations: Numerical delta from baseline
        """
        # If no reading available or sensor offline
        if not observed_reading:
            return {
                "status": "UNKNOWN",
                "condition_label": "No Recent Sensor Data",
                "reason": "Sensor telemetry is currently unavailable. No readings recorded within active monitoring window.",
                "action_advisory": "Ensure device is powered on and connected to local network.",
                "temp_status": "UNKNOWN",
                "humidity_status": "UNKNOWN",
                "co2_status": "UNAVAILABLE",
                "observed": None,
                "baseline": None,
                "deviations": None,
            }

        obs_temp = observed_reading.get("temperature")
        obs_humidity = observed_reading.get("humidity")
        obs_co2 = observed_reading.get("co2")

        if obs_temp is None or obs_humidity is None:
            return {
                "status": "UNKNOWN",
                "condition_label": "Sensor Data Incomplete",
                "reason": "Telemetry record contains missing or uninitialized temperature/humidity fields.",
                "action_advisory": "Inspect sensor wiring and communication link.",
                "temp_status": "UNKNOWN",
                "humidity_status": "UNKNOWN",
                "co2_status": "AVAILABLE" if obs_co2 is not None else "UNAVAILABLE",
                "observed": observed_reading,
                "baseline": None,
                "deviations": None,
            }

        # Extract baseline assumptions from analysis record if linked
        target_temp = 20.0
        target_humidity = 60.0
        storage_type = "Ambient"
        food_name = "Generic Food Product"
        analysis_id = None

        if analysis_record:
            analysis_id = analysis_record.get("recommendation_id")
            food_name = analysis_record.get("food_name", food_name)
            
            snap = analysis_record.get("input_snapshot")
            if isinstance(snap, str):
                try:
                    snap = json.loads(snap)
                except Exception:
                    snap = {}
            elif not isinstance(snap, dict):
                snap = {}

            target_temp = float(snap.get("storage_temperature", target_temp))
            target_humidity = float(snap.get("storage_rh", target_humidity))
            storage_type = snap.get("storage_type", storage_type)

        # Compute deviations
        temp_delta = round(obs_temp - target_temp, 2)
        humidity_delta = round(obs_humidity - target_humidity, 2)

        # 1. Temperature evaluation
        abs_temp_drift = abs(temp_delta)
        if abs_temp_drift > cls.TEMP_TOLERANCE_WARNING:
            t_status = "WARNING"
            t_msg = f"Observed temperature ({obs_temp}°C) differs significantly from analysis baseline ({target_temp}°C) by {temp_delta:+.1f}°C."
        elif abs_temp_drift > cls.TEMP_TOLERANCE_WATCH:
            t_status = "WATCH"
            t_msg = f"Observed temperature ({obs_temp}°C) deviates moderately from analysis baseline ({target_temp}°C) by {temp_delta:+.1f}°C."
        else:
            t_status = "NORMAL"
            t_msg = f"Observed temperature ({obs_temp}°C) aligns closely with analysis condition ({target_temp}°C)."

        # Special check: Refrigerated/Frozen thermal abuse
        if storage_type in ["Refrigerated", "Chilled"] and obs_temp > 8.0:
            t_status = "WARNING"
            t_msg = f"Refrigerated product observed at elevated temperature ({obs_temp}°C). Exceeds cold chain parameters."
        elif storage_type == "Frozen" and obs_temp > -10.0:
            t_status = "WARNING"
            t_msg = f"Frozen product observed at elevated temperature ({obs_temp}°C). Exceeds frozen chain parameters."

        # 2. Humidity evaluation
        abs_hum_drift = abs(humidity_delta)
        if abs_hum_drift > cls.HUMIDITY_TOLERANCE_WARNING:
            h_status = "WARNING"
            h_msg = f"Observed relative humidity ({obs_humidity}%) differs significantly from analysis baseline ({target_humidity}%) by {humidity_delta:+.1f}%."
        elif abs_hum_drift > cls.HUMIDITY_TOLERANCE_WATCH:
            h_status = "WATCH"
            h_msg = f"Observed relative humidity ({obs_humidity}%) deviates moderately from analysis baseline ({target_humidity}%) by {humidity_delta:+.1f}%."
        else:
            h_status = "NORMAL"
            h_msg = f"Observed humidity ({obs_humidity}%) aligns with analysis condition ({target_humidity}%)."

        # 3. Overall composite state
        reasons = []
        if t_status == "WARNING" or h_status == "WARNING":
            overall_status = "WARNING"
            condition_label = "Storage Condition Requires Review"
            action_advisory = "Storage condition requires review. Environmental parameters have shifted beyond the envelope assumed during initial packaging analysis."
            if t_status == "WARNING": reasons.append(t_msg)
            if h_status == "WARNING": reasons.append(h_msg)
        elif t_status == "WATCH" or h_status == "WATCH":
            overall_status = "WATCH"
            condition_label = "Condition Drift Observed"
            action_advisory = "Storage conditions show moderate variance. Monitor trend to verify stability."
            if t_status == "WATCH": reasons.append(t_msg)
            if h_status == "WATCH": reasons.append(h_msg)
        else:
            overall_status = "NORMAL"
            condition_label = "Storage Conditions Compatible"
            action_advisory = "Current conditions remain fully compatible with the assumptions used during packaging analysis."
            reasons.append(t_msg)
            reasons.append(h_msg)

        co2_status = "AVAILABLE" if obs_co2 is not None else "UNAVAILABLE"

        return {
            "status": overall_status,
            "condition_label": condition_label,
            "reason": " ".join(reasons),
            "action_advisory": action_advisory,
            "temp_status": t_status,
            "humidity_status": h_status,
            "co2_status": co2_status,
            "observed": {
                "temperature": obs_temp,
                "humidity": obs_humidity,
                "co2": obs_co2,
                "timestamp": observed_reading.get("timestamp"),
                "device_id": observed_reading.get("device_id"),
                "source": observed_reading.get("source", "SENSOR OBSERVATION"),
            },
            "baseline": {
                "analysis_id": analysis_id,
                "food_name": food_name,
                "target_temperature": target_temp,
                "target_humidity": target_humidity,
                "storage_type": storage_type,
            } if analysis_record else None,
            "deviations": {
                "temperature_delta": temp_delta,
                "humidity_delta": humidity_delta,
            }
        }

    @classmethod
    def calculate_aggregate_metrics(
        cls, readings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compute statistical summary over a series of readings for report generation.
        """
        if not readings:
            return {
                "reading_count": 0,
                "has_data": False,
                "message": "No historical telemetry recorded for this monitoring period."
            }

        temps = [r["temperature"] for r in readings if r.get("temperature") is not None]
        humidities = [r["humidity"] for r in readings if r.get("humidity") is not None]
        co2s = [r["co2"] for r in readings if r.get("co2") is not None]

        timestamps = [r["timestamp"] for r in readings if r.get("timestamp")]

        return {
            "reading_count": len(readings),
            "has_data": True,
            "earliest_timestamp": min(timestamps) if timestamps else None,
            "latest_timestamp": max(timestamps) if timestamps else None,
            "temperature": {
                "min": min(temps) if temps else None,
                "avg": round(sum(temps) / len(temps), 2) if temps else None,
                "max": max(temps) if temps else None,
                "unit": "°C"
            },
            "humidity": {
                "min": min(humidities) if humidities else None,
                "avg": round(sum(humidities) / len(humidities), 2) if humidities else None,
                "max": max(humidities) if humidities else None,
                "unit": "% RH"
            },
            "co2": {
                "available": len(co2s) > 0,
                "min": min(co2s) if co2s else None,
                "avg": round(sum(co2s) / len(co2s), 2) if co2s else None,
                "max": max(co2s) if co2s else None,
                "unit": "ppm" if len(co2s) > 0 else "N/A"
            }
        }
