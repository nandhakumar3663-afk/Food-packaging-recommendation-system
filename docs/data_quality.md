# Data Quality & Provenance Governance

## Overview

The Smart Food Packaging Recommendation System enforces rigorous data quality governance. All physical properties, barrier metrics, and shelf-life characteristics maintain explicit source tracking and are audited regularly using automated validation scripts.

---

## 1. Data Provenance Tiers

Every record in the `food` and `packaging_material` tables is tagged with an authoritative provenance tier:

| Provenance Tier | Criteria | Examples in Database |
|:---|:---|:---|
| **LITERATURE-BACKED** | Sourced directly from peer-reviewed literature, standard reference textbooks, or official USDA / FAO databases. | Massey (2003), Robertson (2012), USDA Food Data Central |
| **SYNTHETIC DEMONSTRATION DATA** | Explicitly synthesized benchmark values to test edge cases or rare materials where peer-reviewed empirical data is absent. | Kraft Paper + Bio-PBS Coating, Perforated Produce Pouch |
| **ESTIMATED** | Derived through physical barrier extrapolation, rule-of-thumb engineering formulas, or average vendor catalog rates. | Unit package costs ($0.05 m² conversion), baseline seal strengths |
| **NOT AVAILABLE** | Parameter is currently unknown or unmeasured. | Flagged as `None` / `N/A` with system alerts |

---

## 2. Automated Data Quality Audit Script

The system includes a dedicated audit CLI script:

```bash
python scripts/audit_data.py
```

### Audit Scope:
1. **Commodity Completeness:**
   - Counts all food items in `food`.
   - Verifies physiological ranges:
     - $0.0 \le \text{Moisture} \le 100.0\%$
     - $1.0 \le \text{pH} \le 14.0$
     - $\text{Target Shelf Life} > 0$ days
2. **Material Completeness:**
   - Verifies all packaging materials in `packaging_material`.
   - Checks presence and range validity of:
     - $\text{OTR} \ge 0$
     - $\text{WVTR} \ge 0$
     - $\text{Estimated Cost} \ge 0$
     - $0.0 \le \text{Recyclability} \le 100.0\%$
3. **Provenance Breakdown:**
   - Quantifies the ratio of literature-backed vs synthetic demonstration records.
4. **Duplicate Detection:**
   - Checks for duplicate commodity or material names.

### Current Audit Output:
- **Total Foods:** 10 records (80.0% Literature-Backed, 20.0% Synthetic Demonstration).
- **Total Materials:** 12 records (83.3% Literature-Backed, 16.7% Synthetic Demonstration).
- **Missing Barrier Values:** 0
- **Missing Cost Values:** 0
- **Missing Recyclability Values:** 0
- **Data Integrity Status:** `HEALTHY` (0 anomalies detected).
