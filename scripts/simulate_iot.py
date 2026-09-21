#!/usr/bin/env python3
"""
IoT Telemetry Simulator for Smart Food Packaging Recommendation System.

Simulates an ESP32 hardware node transmitting real-time temperature, humidity,
and optional CO2 data over HTTP to /api/iot/readings.
Explicitly labels all generated records as 'SIMULATED SENSOR DATA' to prevent
pollution of real physical observation records.

Usage Examples:
    # Single normal reading
    python scripts/simulate_iot.py

    # Simulate temperature abuse (warning state)
    python scripts/simulate_iot.py --mode warning --temp 16.5

    # Continuous stream sending every 5 seconds
    python scripts/simulate_iot.py --continuous --interval 5
"""

import argparse
import json
import random
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path


def generate_reading(
    device_id: str,
    mode: str,
    analysis_id: int,
    temp_override: float = None,
    hum_override: float = None,
    co2_override: float = None,
) -> dict:
    """Generate a single structured telemetry dictionary."""
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    if mode == "warning":
        # Elevated temperature / thermal breach
        base_temp = temp_override if temp_override is not None else random.uniform(14.0, 22.0)
        base_hum = hum_override if hum_override is not None else random.uniform(40.0, 95.0)
        base_co2 = co2_override if co2_override is not None else random.choice([None, random.uniform(1200.0, 3500.0)])
    elif mode == "watch":
        # Moderate condition drift
        base_temp = temp_override if temp_override is not None else random.uniform(7.0, 9.5)
        base_hum = hum_override if hum_override is not None else random.uniform(70.0, 78.0)
        base_co2 = co2_override if co2_override is not None else random.choice([None, random.uniform(600.0, 1100.0)])
    else:
        # Standard normal refrigerated / controlled storage
        base_temp = temp_override if temp_override is not None else random.uniform(3.5, 4.8)
        base_hum = hum_override if hum_override is not None else random.uniform(82.0, 87.0)
        base_co2 = co2_override if co2_override is not None else random.choice([None, random.uniform(380.0, 520.0)])

    payload = {
        "device_id": device_id,
        "timestamp": now_utc,
        "temperature": round(base_temp, 2),
        "humidity": round(base_hum, 2),
        "co2": round(base_co2, 2) if base_co2 is not None else None,
        "analysis_id": analysis_id if analysis_id > 0 else None,
        "signal_quality": random.randint(-75, -50),
        "source": "SIMULATED SENSOR DATA",
    }
    return payload


def post_reading(host: str, payload: dict) -> dict:
    """Send JSON payload via HTTP POST to the ingestion API."""
    url = f"{host.rstrip('/')}/api/iot/readings"
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5.0) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description="IoT Telemetry Simulator")
    parser.add_argument("--host", default="http://127.0.0.1:5000", help="Flask server URL")
    parser.add_argument("--device-id", default="ESP32-SIM-01", help="Device identifier")
    parser.add_argument("--analysis-id", type=int, default=1, help="Linked recommendation analysis ID")
    parser.add_argument("--mode", choices=["normal", "watch", "warning"], default="normal", help="Simulation state")
    parser.add_argument("--temp", type=float, default=None, help="Explicit temperature override (°C)")
    parser.add_argument("--humidity", type=float, default=None, help="Explicit humidity override (%% RH)")
    parser.add_argument("--co2", type=float, default=None, help="Explicit CO2 override (ppm)")
    parser.add_argument("--count", type=int, default=1, help="Number of telemetry packets to send")
    parser.add_argument("--interval", type=float, default=3.0, help="Seconds between packets")
    parser.add_argument("--continuous", action="store_true", help="Run indefinitely in an event loop")

    args = parser.parse_args()

    print("=" * 80)
    print(" SMART FOOD PACKAGING RECOMMENDATION SYSTEM — IOT TELEMETRY SIMULATOR")
    print("=" * 80)
    print(f"Target Server:   {args.host}")
    print(f"Device ID:       {args.device_id}")
    print(f"Linked Analysis: #{args.analysis_id if args.analysis_id > 0 else 'None'}")
    print(f"Mode:            {args.mode.upper()}")
    print(f"Data Tag:        SIMULATED SENSOR DATA (Explicitly labeled)")
    print("-" * 80)

    sent = 0
    try:
        while True:
            payload = generate_reading(
                device_id=args.device_id,
                mode=args.mode,
                analysis_id=args.analysis_id,
                temp_override=args.temp,
                hum_override=args.humidity,
                co2_override=args.co2,
            )

            try:
                res = post_reading(args.host, payload)
                sent += 1
                status = res.get("status", "UNKNOWN")
                print(
                    f"[{payload['timestamp']}] Packet #{sent} -> Temp: {payload['temperature']}°C | "
                    f"RH: {payload['humidity']}% | CO2: {payload['co2'] or 'Unavailable'} | "
                    f"Status: {status} -> DB ID: #{res.get('reading_id')}"
                )
            except urllib.error.URLError as e:
                print(f"[ERROR] Could not connect to {args.host}/api/iot/readings: {e}")
            except Exception as e:
                print(f"[ERROR] Failed transmission: {e}")

            if not args.continuous:
                if sent >= args.count:
                    break

            time.sleep(args.interval)

    except KeyboardInterrupt:
        print("\n[STOP] Simulation stopped by user.")

    print(f"\nSimulation complete. Total simulated packets transmitted: {sent}\n")


if __name__ == "__main__":
    main()
