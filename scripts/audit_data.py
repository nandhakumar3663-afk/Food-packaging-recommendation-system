#!/usr/bin/env python3
"""
Data Quality Audit Script for Smart Food Packaging Recommendation System.

Audits food and packaging material records in the SQLite database:
- Counts total commodities and materials.
- Audits data provenance: Literature-backed vs Synthetic demonstration data.
- Identifies missing critical barrier, cost, and sustainability values.
- Validates physiological and physical range boundaries.
- Detects potential duplicate records.
- Outputs a comprehensive tabular quality report.
"""

import sys
from pathlib import Path
from typing import Any, Dict, List

# Ensure app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.database import get_all_foods, get_all_materials, get_db_connection


def audit_database() -> Dict[str, Any]:
    """
    Perform a complete data quality audit on the SQLite database.

    Returns:
        dict: Detailed audit metrics and status flags.
    """
    foods = get_all_foods()
    materials = get_all_materials()

    food_anomalies: List[str] = []
    material_anomalies: List[str] = []

    # 1. Food Data Audit
    food_names = set()
    food_synthetic_count = 0
    food_lit_count = 0

    for f in foods:
        fid = f.get("food_id")
        name = f.get("food_name", "")
        source = str(f.get("source", ""))

        if name.lower() in food_names:
            food_anomalies.append(f"Duplicate food name detected: '{name}' (ID: {fid})")
        food_names.add(name.lower())

        if "SYNTHETIC" in source.upper():
            food_synthetic_count += 1
        else:
            food_lit_count += 1

        # Range checks
        moisture = f.get("moisture")
        if moisture is None or not (0.0 <= moisture <= 100.0):
            food_anomalies.append(f"Food ID {fid} ({name}): invalid moisture {moisture}")

        ph = f.get("ph")
        if ph is None or not (1.0 <= ph <= 14.0):
            food_anomalies.append(f"Food ID {fid} ({name}): invalid pH {ph}")

        shelf_life = f.get("target_shelf_life")
        if shelf_life is None or shelf_life <= 0:
            food_anomalies.append(f"Food ID {fid} ({name}): invalid target_shelf_life {shelf_life}")

    # 2. Material Data Audit
    mat_names = set()
    mat_synthetic_count = 0
    mat_lit_count = 0
    missing_otr = 0
    missing_wvtr = 0
    missing_cost = 0
    missing_recyclability = 0

    for m in materials:
        mid = m.get("material_id")
        name = m.get("material_name", "")
        source = str(m.get("source", ""))

        if name.lower() in mat_names:
            material_anomalies.append(f"Duplicate material name detected: '{name}' (ID: {mid})")
        mat_names.add(name.lower())

        if "SYNTHETIC" in source.upper():
            mat_synthetic_count += 1
        else:
            mat_lit_count += 1

        # Barrier properties
        otr = m.get("otr")
        if otr is None:
            missing_otr += 1
            material_anomalies.append(f"Material ID {mid} ({name}): missing OTR")
        elif otr < 0:
            material_anomalies.append(f"Material ID {mid} ({name}): negative OTR ({otr})")

        wvtr = m.get("wvtr")
        if wvtr is None:
            missing_wvtr += 1
            material_anomalies.append(f"Material ID {mid} ({name}): missing WVTR")
        elif wvtr < 0:
            material_anomalies.append(f"Material ID {mid} ({name}): negative WVTR ({wvtr})")

        # Cost & Sustainability
        cost = m.get("estimated_cost")
        if cost is None:
            missing_cost += 1
            material_anomalies.append(f"Material ID {mid} ({name}): missing estimated_cost")
        elif cost < 0:
            material_anomalies.append(f"Material ID {mid} ({name}): negative cost ({cost})")

        recyc = m.get("recyclability")
        if recyc is None:
            missing_recyclability += 1
            material_anomalies.append(f"Material ID {mid} ({name}): missing recyclability")
        elif not (0.0 <= recyc <= 100.0):
            material_anomalies.append(f"Material ID {mid} ({name}): invalid recyclability ({recyc}%)")

    # Compile report
    total_anomalies = len(food_anomalies) + len(material_anomalies)
    status = "HEALTHY" if total_anomalies == 0 else "ANOMALIES_DETECTED"

    report = {
        "status": status,
        "food_count": len(foods),
        "food_literature_count": food_lit_count,
        "food_synthetic_count": food_synthetic_count,
        "material_count": len(materials),
        "material_literature_count": mat_lit_count,
        "material_synthetic_count": mat_synthetic_count,
        "missing_otr_count": missing_otr,
        "missing_wvtr_count": missing_wvtr,
        "missing_cost_count": missing_cost,
        "missing_recyclability_count": missing_recyclability,
        "food_anomalies": food_anomalies,
        "material_anomalies": material_anomalies,
        "total_anomalies": total_anomalies,
    }

    return report


def print_audit_report(report: Dict[str, Any]) -> None:
    """Print a clean, structured terminal audit report."""
    print("=" * 80)
    print(" SMART FOOD PACKAGING RECOMMENDATION SYSTEM — DATA QUALITY AUDIT")
    print("=" * 80)
    print(f"Audit Status: {report['status']}")
    print(f"Total Anomalies: {report['total_anomalies']}\n")

    print("[+] FOOD COMMODITIES AUDIT:")
    print(f"    Total Records:          {report['food_count']}")
    print(f"    Literature-Backed:      {report['food_literature_count']} ({(report['food_literature_count']/max(1, report['food_count']))*100:.1f}%)")
    print(f"    Synthetic Demonstration:{report['food_synthetic_count']} ({(report['food_synthetic_count']/max(1, report['food_count']))*100:.1f}%)")
    if report["food_anomalies"]:
        print("    Anomalies Found:")
        for a in report["food_anomalies"]:
            print(f"      - {a}")
    else:
        print("    Data Integrity:         PERFECT (All physiological ranges valid)")

    print("\n[+] PACKAGING MATERIALS AUDIT:")
    print(f"    Total Records:          {report['material_count']}")
    print(f"    Literature-Backed:      {report['material_literature_count']} ({(report['material_literature_count']/max(1, report['material_count']))*100:.1f}%)")
    print(f"    Synthetic Demonstration:{report['material_synthetic_count']} ({(report['material_synthetic_count']/max(1, report['material_count']))*100:.1f}%)")
    print(f"    Missing OTR Values:     {report['missing_otr_count']}")
    print(f"    Missing WVTR Values:    {report['missing_wvtr_count']}")
    print(f"    Missing Cost Values:    {report['missing_cost_count']}")
    print(f"    Missing Recyclability:  {report['missing_recyclability_count']}")
    if report["material_anomalies"]:
        print("    Anomalies Found:")
        for a in report["material_anomalies"]:
            print(f"      - {a}")
    else:
        print("    Data Integrity:         PERFECT (All barrier, cost & recyclability metrics present)")

    print("\n" + "=" * 80)
    if report["total_anomalies"] == 0:
        print(" AUDIT RESULT: PASSED (Database is fully verified & ready for inference)")
    else:
        print(f" AUDIT RESULT: FAILED ({report['total_anomalies']} issues detected)")
    print("=" * 80)


def main():
    report = audit_database()
    print_audit_report(report)
    if report["status"] != "HEALTHY":
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
