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

        # Performance indices
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_food_category ON food(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_material_cat ON packaging_material(material_category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rec_food ON recommendation(food_id);")


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
