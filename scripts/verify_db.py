#!/usr/bin/env python3
"""
Verification script to query and display all records in SQLite database.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.database import get_all_foods, get_all_materials, get_db_connection


def main():
    print("=" * 80)
    print("DATABASE QUERY VERIFICATION")
    print("=" * 80)

    # 1. Query Foods
    foods = get_all_foods()
    print(f"\n[+] Total Food Commodities Loaded: {len(foods)}")
    for f in foods:
        print(
            f"  ID: {f['food_id']:<2} | {f['food_name']:<32} | {f['category']:<20} | "
            f"Moisture: {f['moisture']:<4}% | Fat: {f['fat']:<4}% | pH: {f['ph']:<4} | "
            f"Shelf-life: {f['target_shelf_life']:<3}d | O2: {f['oxygen_sensitivity']:<6}"
        )
        print(f"      Source: {f['source']}")

    # 2. Query Packaging Materials
    materials = get_all_materials()
    print(f"\n[+] Total Packaging Materials Loaded: {len(materials)}")
    for m in materials:
        print(
            f"  ID: {m['material_id']:<2} | {m['material_name']:<48} | {m['material_category']:<20} | "
            f"OTR: {m['otr']:<7} {m['otr_unit']} | WVTR: {m['wvtr']:<5} {m['wvtr_unit']} | "
            f"Cost: ${m['estimated_cost']:<4}/m² | Recyc: {m['recyclability']}%"
        )
        print(f"      Test: {m['otr_test_condition']} / {m['wvtr_test_condition']} | Source: {m['source']}")

    # 3. Provenance Audit
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS total, SUM(CASE WHEN source LIKE '%SYNTHETIC%' THEN 1 ELSE 0 END) AS synthetic FROM packaging_material;")
        row = cursor.fetchone()
        print("\n[+] Provenance Audit:")
        print(f"    Total Materials: {row['total']} | Literature-Backed: {row['total'] - row['synthetic']} | Labeled Synthetic: {row['synthetic']}")

        cursor.execute("SELECT COUNT(*) AS total, SUM(CASE WHEN source LIKE '%SYNTHETIC%' THEN 1 ELSE 0 END) AS synthetic FROM food;")
        row_f = cursor.fetchone()
        print(f"    Total Foods:     {row_f['total']} | Literature-Backed: {row_f['total'] - row_f['synthetic']} | Labeled Synthetic: {row_f['synthetic']}")


if __name__ == "__main__":
    main()
