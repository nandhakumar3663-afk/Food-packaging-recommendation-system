"""
Database management module for SQLite.
Handles connection lifecycles, schema migrations, and CRUD operations.
"""

import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from contextlib import contextmanager

from app.config import Config
from app.models.schemas import FoodItem, PackagingMaterial


@contextmanager
def get_db_connection(db_path: Optional[Path] = None):
    """Context manager for acquiring SQLite connections with foreign key enforcement."""
    path = str(db_path or Config.DATABASE_PATH)
    conn = sqlite3.connect(path, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database(db_path: Optional[Path] = None) -> None:
    """Initialize database tables for the application."""
    path = db_path or Config.DATABASE_PATH
    Path(path).parent.mkdir(parents=True, exist_ok=True)

    with get_db_connection(path) as conn:
        cursor = conn.cursor()

        # Food Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS food (
                food_id INTEGER PRIMARY KEY AUTOINCREMENT,
                food_name TEXT NOT NULL,
                category TEXT NOT NULL,
                moisture REAL NOT NULL,
                fat REAL NOT NULL,
                ph REAL NOT NULL,
                respiration_rate TEXT NOT NULL,
                storage_temperature REAL NOT NULL,
                storage_rh REAL NOT NULL,
                target_shelf_life INTEGER NOT NULL,
                oxygen_sensitivity TEXT NOT NULL,
                moisture_sensitivity TEXT NOT NULL,
                light_sensitivity TEXT NOT NULL,
                source TEXT NOT NULL,
                source_url TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Packaging Material Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS packaging_material (
                material_id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_name TEXT NOT NULL,
                material_category TEXT NOT NULL,
                polymer_type TEXT,
                otr REAL NOT NULL,
                otr_unit TEXT DEFAULT 'cc/(m²·day·atm)',
                otr_test_condition TEXT NOT NULL,
                wvtr REAL NOT NULL,
                wvtr_unit TEXT DEFAULT 'g/(m²·day)',
                wvtr_test_condition TEXT NOT NULL,
                thickness REAL NOT NULL,
                thickness_unit TEXT DEFAULT 'μm',
                oxygen_barrier TEXT NOT NULL,
                moisture_barrier TEXT NOT NULL,
                light_barrier TEXT NOT NULL,
                mechanical_strength TEXT NOT NULL,
                sealability TEXT NOT NULL,
                recyclability REAL NOT NULL,
                renewable_content REAL NOT NULL,
                estimated_cost REAL NOT NULL,
                source TEXT NOT NULL,
                source_url TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Storage Conditions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS storage (
                storage_id INTEGER PRIMARY KEY AUTOINCREMENT,
                temperature REAL NOT NULL,
                humidity REAL NOT NULL,
                storage_type TEXT NOT NULL,
                transport_condition TEXT NOT NULL
            );
        """)

        # Recommendation Log Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recommendation (
                recommendation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                food_id INTEGER,
                food_name TEXT NOT NULL,
                category TEXT NOT NULL,
                selected_material_id INTEGER NOT NULL,
                material_name TEXT NOT NULL,
                recommendation_type TEXT NOT NULL,
                compatibility_score REAL NOT NULL,
                oxygen_score REAL NOT NULL,
                moisture_score REAL NOT NULL,
                strength_score REAL NOT NULL,
                sealability_score REAL NOT NULL,
                shelf_life_score REAL NOT NULL,
                sustainability_score REAL NOT NULL,
                cost_score REAL NOT NULL,
                reason TEXT NOT NULL,
                triggered_rules TEXT,
                input_snapshot TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(selected_material_id) REFERENCES packaging_material(material_id)
            );
        """)

        # IoT Storage Readings Table
        cursor.execute("""
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
        """)

        # Performance indices
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_food_category ON food(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_material_cat ON packaging_material(material_category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rec_food ON recommendation(food_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_iot_timestamp ON iot_readings(timestamp);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_iot_device ON iot_readings(device_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_iot_analysis ON iot_readings(analysis_id);")


# =====================================================================
# Food CRUD
# =====================================================================

def insert_food(food: FoodItem, db_path: Optional[Path] = None) -> int:
    """Insert a food record and return generated food_id."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO food (
                food_name, category, moisture, fat, ph, respiration_rate,
                storage_temperature, storage_rh, target_shelf_life,
                oxygen_sensitivity, moisture_sensitivity, light_sensitivity,
                source, source_url, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            food.food_name, food.category, food.moisture, food.fat, food.ph,
            food.respiration_rate, food.storage_temperature, food.storage_rh,
            food.target_shelf_life, food.oxygen_sensitivity, food.moisture_sensitivity,
            food.light_sensitivity, food.source, food.source_url, food.notes
        ))
        return cursor.lastrowid


def get_all_foods(db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Retrieve all food items."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM food ORDER BY category, food_name ASC")
        return [dict(row) for row in cursor.fetchall()]


def get_food_by_id(food_id: int, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    """Retrieve food item by ID."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM food WHERE food_id = ?", (food_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


# =====================================================================
# Packaging Material CRUD
# =====================================================================

def insert_packaging_material(mat: PackagingMaterial, db_path: Optional[Path] = None) -> int:
    """Insert packaging material record and return generated material_id."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO packaging_material (
                material_name, material_category, polymer_type,
                otr, otr_unit, otr_test_condition,
                wvtr, wvtr_unit, wvtr_test_condition,
                thickness, thickness_unit, oxygen_barrier, moisture_barrier,
                light_barrier, mechanical_strength, sealability,
                recyclability, renewable_content, estimated_cost,
                source, source_url, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            mat.material_name, mat.material_category, mat.polymer_type,
            mat.otr, mat.otr_unit, mat.otr_test_condition,
            mat.wvtr, mat.wvtr_unit, mat.wvtr_test_condition,
            mat.thickness, mat.thickness_unit, mat.oxygen_barrier,
            mat.moisture_barrier, mat.light_barrier, mat.mechanical_strength,
            mat.sealability, mat.recyclability, mat.renewable_content,
            mat.estimated_cost, mat.source, mat.source_url, mat.notes
        ))
        return cursor.lastrowid


def get_all_materials(db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Retrieve all packaging materials."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM packaging_material ORDER BY material_category, material_name ASC")
        return [dict(row) for row in cursor.fetchall()]


def get_material_by_id(material_id: int, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    """Retrieve packaging material by ID."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM packaging_material WHERE material_id = ?", (material_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


# =====================================================================
# Recommendation Logging CRUD
# =====================================================================

def insert_recommendation(
    food_id: Optional[int],
    food_name: str,
    category: str,
    selected_material_id: int,
    material_name: str,
    recommendation_type: str,
    compatibility_score: float,
    sub_scores: Dict[str, float],
    reason: str,
    triggered_rules: List[Dict[str, str]],
    input_snapshot: Dict[str, Any],
    db_path: Optional[Path] = None,
) -> int:
    """Log a generated recommendation in history."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO recommendation (
                food_id, food_name, category, selected_material_id, material_name,
                recommendation_type, compatibility_score, oxygen_score, moisture_score,
                strength_score, sealability_score, shelf_life_score, sustainability_score,
                cost_score, reason, triggered_rules, input_snapshot
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            food_id, food_name, category, selected_material_id, material_name,
            recommendation_type, round(compatibility_score, 2),
            round(sub_scores.get("oxygen", 0.0), 2),
            round(sub_scores.get("moisture", 0.0), 2),
            round(sub_scores.get("mechanical", 0.0), 2),
            round(sub_scores.get("sealability", 0.0), 2),
            round(sub_scores.get("shelf_life", 0.0), 2),
            round(sub_scores.get("sustainability", 0.0), 2),
            round(sub_scores.get("cost", 0.0), 2),
            reason,
            json.dumps(triggered_rules),
            json.dumps(input_snapshot)
        ))
        return cursor.lastrowid


def get_recommendation_history(limit: int = 50, db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Fetch past recommendation evaluations."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.*, p.material_category, p.otr, p.wvtr, p.estimated_cost
            FROM recommendation r
            JOIN packaging_material p ON r.selected_material_id = p.material_id
            ORDER BY r.created_at DESC
            LIMIT ?
        """, (limit,))
        return [dict(row) for row in cursor.fetchall()]


def get_recommendation_by_id(rec_id: int, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    """Fetch a single recommendation record with full joined material details."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.*, p.material_category, p.polymer_type, p.otr, p.wvtr,
                   p.thickness, p.estimated_cost, p.recyclability, p.renewable_content,
                   p.source AS material_source, p.source_url AS material_source_url
            FROM recommendation r
            JOIN packaging_material p ON r.selected_material_id = p.material_id
            WHERE r.recommendation_id = ?
        """, (rec_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


# =====================================================================
# IoT Storage Monitoring CRUD
# =====================================================================

def insert_iot_reading(reading_data: Dict[str, Any], db_path: Optional[Path] = None) -> int:
    """
    Insert an IoT sensor reading into SQLite.
    Returns the generated reading id.
    """
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        
        # If explicit timestamp provided, insert it; otherwise let SQLite default to CURRENT_TIMESTAMP
        if reading_data.get("timestamp"):
            cursor.execute("""
                INSERT INTO iot_readings (
                    device_id, timestamp, temperature, humidity, co2,
                    analysis_id, status, source, signal_quality
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                reading_data["device_id"],
                reading_data["timestamp"],
                round(float(reading_data["temperature"]), 2),
                round(float(reading_data["humidity"]), 2),
                round(float(reading_data["co2"]), 2) if reading_data.get("co2") is not None else None,
                reading_data.get("analysis_id"),
                reading_data.get("status", "NORMAL"),
                reading_data.get("source", "SENSOR OBSERVATION"),
                reading_data.get("signal_quality")
            ))
        else:
            cursor.execute("""
                INSERT INTO iot_readings (
                    device_id, temperature, humidity, co2,
                    analysis_id, status, source, signal_quality
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                reading_data["device_id"],
                round(float(reading_data["temperature"]), 2),
                round(float(reading_data["humidity"]), 2),
                round(float(reading_data["co2"]), 2) if reading_data.get("co2") is not None else None,
                reading_data.get("analysis_id"),
                reading_data.get("status", "NORMAL"),
                reading_data.get("source", "SENSOR OBSERVATION"),
                reading_data.get("signal_quality")
            ))
        return cursor.lastrowid


def get_latest_iot_reading(
    device_id: Optional[str] = None,
    analysis_id: Optional[int] = None,
    db_path: Optional[Path] = None
) -> Optional[Dict[str, Any]]:
    """Fetch the most recent sensor reading matching optional filters."""
    query = "SELECT * FROM iot_readings WHERE 1=1"
    params: List[Any] = []

    if device_id:
        query += " AND device_id = ?"
        params.append(device_id)
    if analysis_id is not None:
        query += " AND analysis_id = ?"
        params.append(analysis_id)

    query += " ORDER BY timestamp DESC, id DESC LIMIT 1"

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        row = cursor.fetchone()
        return dict(row) if row else None


def get_iot_readings(
    device_id: Optional[str] = None,
    analysis_id: Optional[int] = None,
    limit: int = 50,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    db_path: Optional[Path] = None
) -> List[Dict[str, Any]]:
    """Fetch a bounded chronological list of sensor readings."""
    # Bounded query limit
    safe_limit = max(1, min(100, int(limit)))

    query = "SELECT * FROM iot_readings WHERE 1=1"
    params: List[Any] = []

    if device_id:
        query += " AND device_id = ?"
        params.append(device_id)
    if analysis_id is not None:
        query += " AND analysis_id = ?"
        params.append(analysis_id)
    if start_time:
        query += " AND timestamp >= ?"
        params.append(start_time)
    if end_time:
        query += " AND timestamp <= ?"
        params.append(end_time)

    query += " ORDER BY timestamp DESC, id DESC LIMIT ?"
    params.append(safe_limit)

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        # Return in ascending order for smooth charting
        result = [dict(row) for row in rows]
        result.reverse()
        return result


def get_active_devices(
    offline_threshold_seconds: int = 60,
    db_path: Optional[Path] = None
) -> List[Dict[str, Any]]:
    """
    List all known IoT devices, their latest reading timestamp,
    online/offline status, and sensor capabilities.
    """
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                device_id,
                MAX(timestamp) AS last_seen,
                COUNT(*) AS total_readings,
                MAX(CASE WHEN co2 IS NOT NULL THEN 1 ELSE 0 END) AS has_co2,
                (strftime('%s', 'now') - strftime('%s', MAX(timestamp))) AS seconds_since_ping
            FROM iot_readings
            GROUP BY device_id
            ORDER BY last_seen DESC
        """)
        devices = []
        for row in cursor.fetchall():
            d = dict(row)
            sec = d.get("seconds_since_ping")
            is_online = sec is not None and sec <= offline_threshold_seconds
            devices.append({
                "device_id": d["device_id"],
                "last_seen": d["last_seen"],
                "total_readings": d["total_readings"],
                "has_co2": bool(d["has_co2"]),
                "seconds_since_ping": sec,
                "status": "ONLINE" if is_online else "OFFLINE"
            })
        return devices


def prune_iot_readings(
    retention_days: int = 30,
    max_records_per_device: int = 5000,
    db_path: Optional[Path] = None
) -> int:
    """
    Enforce data retention policy:
    1. Delete records older than retention_days.
    2. Ensure no device exceeds max_records_per_device.
    Returns the total count of pruned records.
    """
    total_pruned = 0
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        # 1. Prune by age
        cursor.execute("""
            DELETE FROM iot_readings 
            WHERE timestamp < datetime('now', '-' || ? || ' days');
        """, (retention_days,))
        total_pruned += cursor.rowcount

        # 2. Prune excess per device if over ceiling
        cursor.execute("SELECT DISTINCT device_id FROM iot_readings")
        devices = [row["device_id"] for row in cursor.fetchall()]
        
        for dev in devices:
            cursor.execute("""
                DELETE FROM iot_readings
                WHERE id IN (
                    SELECT id FROM iot_readings
                    WHERE device_id = ?
                    ORDER BY timestamp DESC, id DESC
                    LIMIT -1 OFFSET ?
                );
            """, (dev, max_records_per_device))
            total_pruned += cursor.rowcount

    return total_pruned

