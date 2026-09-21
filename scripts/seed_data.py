#!/usr/bin/env python3
"""
Seed script to load verified literature and labeled synthetic data into SQLite.
Validates all entries against domain constraints before insertion.
"""

import sys
import json
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import Config
from app.models.database import (
    init_database,
    insert_food,
    insert_packaging_material,
    get_all_foods,
    get_all_materials,
    get_db_connection,
)
from app.models.schemas import FoodItem, PackagingMaterial
from app.utils.validation import validate_food_input, validate_material_input


def seed_database(db_path=None):
    """Load JSON sample records into the database after validating schemas."""
    target_path = db_path or Config.DATABASE_PATH
    print(f"Seeding database at: {target_path}")

    # Ensure schema is initialized
    init_database(target_path)

    # Clean existing data to prevent duplicate seeds
    with get_db_connection(target_path) as conn:
        conn.execute("DELETE FROM recommendation;")
        conn.execute("DELETE FROM packaging_material;")
        conn.execute("DELETE FROM food;")
        conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('food', 'packaging_material', 'recommendation');")

    sample_dir = Config.PROJECT_ROOT / "data" / "sample"
    foods_file = sample_dir / "sample_foods.json"
    materials_file = sample_dir / "sample_materials.json"

    # 1. Seed Packaging Materials
    with open(materials_file, "r", encoding="utf-8") as f:
        materials_data = json.load(f)

    inserted_materials = 0
    for idx, mat_dict in enumerate(materials_data, 1):
        is_valid, errors = validate_material_input(mat_dict)
        if not is_valid:
            raise ValueError(f"Material #{idx} ('{mat_dict.get('material_name')}') validation failed: {errors}")

        mat = PackagingMaterial(**mat_dict)
        insert_packaging_material(mat, target_path)
        inserted_materials += 1

    print(f"Inserted {inserted_materials} packaging materials successfully.")

    # 2. Seed Foods
    with open(foods_file, "r", encoding="utf-8") as f:
        foods_data = json.load(f)

    inserted_foods = 0
    for idx, food_dict in enumerate(foods_data, 1):
        is_valid, errors = validate_food_input(food_dict)
        if not is_valid:
            raise ValueError(f"Food #{idx} ('{food_dict.get('food_name')}') validation failed: {errors}")

        food = FoodItem(**food_dict)
        insert_food(food, target_path)
        inserted_foods += 1

    print(f"Inserted {inserted_foods} food commodities successfully.")

    # Verification summary
    all_f = get_all_foods(target_path)
    all_m = get_all_materials(target_path)
    print(f"Total foods in DB: {len(all_f)}")
    print(f"Total packaging materials in DB: {len(all_m)}")


if __name__ == "__main__":
    seed_database()
