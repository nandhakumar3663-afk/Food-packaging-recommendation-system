# Data Dictionary

This document details the database schema, data types, physical constraints, units, and definitions for the **Smart Food Packaging Recommendation System**.

Database Engine: **SQLite 3**  
Database File: `data/packaging_system.db`

---

## 1. Table: `food`

Stores physical, biological, and storage parameters for food commodities.

| Column | Type | Nullable | Constraints / Valid Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| `food_id` | `INTEGER` | No | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for food commodity. |
| `food_name` | `TEXT` | No | Length >= 2 | Common name of the food (e.g., "Roasted Whole Coffee Beans"). |
| `category` | `TEXT` | No | `Dairy`, `Produce`, `Meat & Poultry`, `Seafood`, `Bakery`, `Snack Foods`, `Dry Goods & Cereals`, `Beverage`, `Confectionery` | Food category taxonomy. |
| `moisture` | `REAL` | No | `0.0 <= moisture <= 100.0` | Moisture percentage by weight (g water / 100g food). |
| `fat` | `REAL` | No | `0.0 <= fat <= 100.0` | Fat/lipid percentage by weight. `moisture + fat <= 100.0`. |
| `ph` | `REAL` | No | `1.0 <= ph <= 14.0` | Acidity/alkalinity level. |
| `respiration_rate`| `TEXT` | No | `None`, `Low`, `Moderate`, `High`, `Very High` | Metabolic gas exchange activity (critical for fresh produce). |
| `storage_temperature` | `REAL` | No | `-40.0 <= temp <= 60.0` | Recommended storage temperature in °C. |
| `storage_rh` | `REAL` | No | `0.0 <= rh <= 100.0` | Recommended relative humidity percentage (% RH). |
| `target_shelf_life` | `INTEGER` | No | `1 <= days <= 3650` | Desired shelf-life target in days. |
| `oxygen_sensitivity` | `TEXT` | No | `Low`, `Medium`, `High` | Susceptibility to lipid oxidation or enzymatic browning. |
| `moisture_sensitivity` | `TEXT` | No | `Low`, `Medium`, `High` | Susceptibility to staling, crispness loss, or hydration. |
| `light_sensitivity` | `TEXT` | No | `Low`, `Medium`, `High` | Susceptibility to photo-oxidation and nutrient decay. |
| `source` | `TEXT` | No | Citation or `SYNTHETIC DEMONSTRATION DATA` | Literature citation, database ID, or synthetic marker. |
| `source_url` | `TEXT` | Yes | URL | Hyperlink to peer-reviewed paper or USDA record. |
| `notes` | `TEXT` | Yes | Free text | Packaging engineering considerations or failure modes. |
| `created_at` | `TIMESTAMP`| No | Default `CURRENT_TIMESTAMP` | Record creation timestamp. |

---

## 2. Table: `packaging_material`

Stores technical specifications, barrier metrics, mechanical ratings, cost, and sustainability metrics for packaging films and containers.

| Column | Type | Nullable | Constraints / Valid Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| `material_id` | `INTEGER` | No | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for packaging material. |
| `material_name` | `TEXT` | No | Non-empty | Technical trade or generic name (e.g., "EVOH Multi-layer Barrier Film"). |
| `material_category` | `TEXT` | No | `Rigid Plastic`, `Flexible Film`, `Bio-polymer`, `Paper & Paperboard`, `Glass`, `Metal`, `Multi-layer Laminate` | Structural material category. |
| `polymer_type` | `TEXT` | Yes | `PET`, `HDPE`, `LDPE`, `PP`, `EVOH`, `PLA`, etc. | Principal base polymer or composite structure. |
| `otr` | `REAL` | No | `otr >= 0.0` | Oxygen Transmission Rate in `cc/(m²·day·atm)`. |
| `otr_unit` | `TEXT` | No | Default `cc/(m²·day·atm)` | Measurement unit for OTR. |
| `otr_test_condition` | `TEXT` | No | Standard condition string | Standard temperature and RH condition (e.g. `23°C, 50% RH`). |
| `wvtr` | `REAL` | No | `wvtr >= 0.0` | Water Vapor Transmission Rate in `g/(m²·day)`. |
| `wvtr_unit` | `TEXT` | No | Default `g/(m²·day)` | Measurement unit for WVTR. |
| `wvtr_test_condition`| `TEXT` | No | Standard condition string | Standard condition (e.g. `38°C, 90% RH` ASTM F1249). |
| `thickness` | `REAL` | No | `1.0 <= thickness <= 50000.0` | Film or wall thickness in micrometers (μm). |
| `thickness_unit` | `TEXT` | No | Default `μm` | Measurement unit for thickness. |
| `oxygen_barrier` | `TEXT` | No | `Poor`, `Moderate`, `Good`, `Excellent` | Qualitative classification of oxygen protection. |
| `moisture_barrier` | `TEXT` | No | `Poor`, `Moderate`, `Good`, `Excellent` | Qualitative classification of moisture protection. |
| `light_barrier` | `TEXT` | No | `Poor`, `Moderate`, `Good`, `Excellent` | Qualitative classification of UV/visible light protection. |
| `mechanical_strength` | `TEXT` | No | `Low`, `Medium`, `High`, `Very High` | Tensile and puncture resistance capability. |
| `sealability` | `TEXT` | No | `Poor`, `Moderate`, `Good`, `Excellent` | Hermetic heat-seal reliability. |
| `recyclability` | `REAL` | No | `0.0 <= recyclability <= 100.0` | Post-consumer recycling compatibility rating (%). |
| `renewable_content` | `REAL` | No | `0.0 <= renewable <= 100.0` | Percentage of bio-based or renewable feedstock (%). |
| `estimated_cost` | `REAL` | No | `0.01 <= cost <= 1000.0` | Estimated relative material cost in USD per m² ($/m²). |
| `source` | `TEXT` | No | Citation or `SYNTHETIC DEMONSTRATION DATA` | Literature citation or synthetic label. |
| `source_url` | `TEXT` | Yes | URL | Reference link. |
| `notes` | `TEXT` | Yes | Free text | Engineering remarks, MAP suitability, handling notes. |
| `created_at` | `TIMESTAMP`| No | Default `CURRENT_TIMESTAMP` | Record creation timestamp. |

---

## 3. Table: `storage`

Stores storage and logistical parameters.

| Column | Type | Description |
| :--- | :--- | :--- |
| `storage_id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique identifier. |
| `temperature`| `REAL NOT NULL` | Ambient or storage temperature (°C). |
| `humidity` | `REAL NOT NULL` | Ambient or storage humidity (% RH). |
| `storage_type` | `TEXT NOT NULL` | `Ambient`, `Refrigerated`, `Frozen`, `Controlled Atmosphere`. |
| `transport_condition` | `TEXT NOT NULL` | `Standard Ambient`, `Cold Chain`, `Ventilated`, `Frozen Logistics`. |

---

## 4. Table: `recommendation`

Maintains an immutable historical audit log of all generated packaging evaluations.

| Column | Type | Description |
| :--- | :--- | :--- |
| `recommendation_id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique recommendation transaction ID. |
| `food_id` | `INTEGER` | Optional reference to preset food item (`NULL` if custom user input). |
| `food_name` | `TEXT NOT NULL` | Name of the evaluated food. |
| `category` | `TEXT NOT NULL` | Category of the evaluated food. |
| `selected_material_id`| `INTEGER NOT NULL` | Foreign key referencing `packaging_material(material_id)`. |
| `material_name` | `TEXT NOT NULL` | Snapshot of selected packaging material name. |
| `recommendation_type` | `TEXT NOT NULL` | Match category: `Recommended Match`, `Alternative Match`, `Lower-cost Alternative`, `Sustainability-oriented Alternative`. |
| `compatibility_score` | `REAL NOT NULL` | Project-defined overall score (0.0 - 100.0%). |
| `oxygen_score` | `REAL NOT NULL` | Sub-score for oxygen barrier adequacy (0 - 100). |
| `moisture_score` | `REAL NOT NULL` | Sub-score for water vapor barrier adequacy (0 - 100). |
| `strength_score` | `REAL NOT NULL` | Sub-score for puncture/tensile strength (0 - 100). |
| `sealability_score` | `REAL NOT NULL` | Sub-score for heat-seal reliability (0 - 100). |
| `shelf_life_score` | `REAL NOT NULL` | Sub-score for target shelf-life alignment (0 - 100). |
| `sustainability_score`| `REAL NOT NULL` | Sub-score for recyclability and renewable content (0 - 100). |
| `cost_score` | `REAL NOT NULL` | Sub-score for economic suitability (0 - 100). |
| `reason` | `TEXT NOT NULL` | Human-readable explanation synthesized from rules and metrics. |
| `triggered_rules` | `TEXT` | JSON-encoded array of triggered rule IDs and explanations. |
| `input_snapshot` | `TEXT` | JSON-encoded input payload for reproducibility. |
| `created_at` | `TIMESTAMP` | Record creation timestamp. |
