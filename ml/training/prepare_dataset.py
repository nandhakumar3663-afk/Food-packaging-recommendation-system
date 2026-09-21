"""
Dataset Preparation for Food Packaging Recommendation ML Pipeline.
Generates a structured, balanced demonstration dataset anchored to empirical domain
knowledge from Robertson (2012) and Massey (2003).

PROVENANCE:
Explicitly labeled as SYNTHETIC DEMONSTRATION DATA.
Used strictly for software architecture verification and model demonstration.
"""

import json
from pathlib import Path
from typing import List, Dict, Any
import pandas as pd

# Metadata annotation
METADATA = {
    "dataset_name": "Food Packaging Demonstration Training Dataset",
    "version": "1.0.0",
    "provenance": "SYNTHETIC DEMONSTRATION DATA",
    "authoritative_sources_referenced": [
        "Robertson, G. L. (2012). Food Packaging: Principles and Practice (3rd ed.). CRC Press.",
        "Massey, L. K. (2003). Permeability Properties of Plastics and Elastomers (2nd ed.). Plastics Design Library.",
        "Rhim, J. W. et al. (2006). Bio-nanocomposites for food packaging applications.",
        "USDA Agricultural Handbook 66 (Hardenburg et al., 1986)"
    ],
    "notes": (
        "Demonstration dataset mapping varied food preservation profiles to primary suitable packaging "
        "materials. Generated to demonstrate the machine learning pipeline and hybrid rule-ML architecture. "
        "Not clinical or laboratory physical shelf-life trial data."
    )
}

# The 12 canonical materials in the database
MATERIALS = [
    "EVOH Multi-layer Barrier Film (PE/EVOH/PE)",
    "Metallized PET Film (Met-PET)",
    "Biaxially Oriented PET (BOPET)",
    "High-Density Polyethylene Film (HDPE)",
    "Low-Density Polyethylene Film (LDPE)",
    "Biaxially Oriented Polypropylene (BOPP)",
    "Polylactic Acid Film (PLA)",
    "Glass Container (Amber / Flint Jar)",
    "Aluminum Foil Laminate (PET/Al-Foil/PE)",
    "Aseptic Paperboard Composite (Tetra-style Carton)",
    "Perforated LDPE Produce Pouch (Synthetic Benchmark)",
    "Kraft Paper + Bio-PBS Coating (Synthetic Benchmark)"
]

def generate_demonstration_records() -> List[Dict[str, Any]]:
    """
    Construct 144 diverse food profiles mapped to suitable packaging materials.
    Covers varied moisture, fat, pH, respiration rates, shelf life, and storage conditions.
    """
    records = []
    
    # Archetype 1: Fresh High-Respiration Produce (Berries, leafy greens, mushrooms)
    # Primary match: Perforated LDPE Produce Pouch (R004 gas exchange)
    for i in range(12):
        records.append({
            "food_name": f"Fresh Produce Item {i+1}",
            "category": "Produce",
            "moisture": round(88.0 + (i % 8) * 0.8, 1),
            "fat": round(0.2 + (i % 3) * 0.2, 1),
            "ph": round(3.8 + (i % 6) * 0.4, 2),
            "respiration_rate": "High" if i % 2 == 0 else "Very High",
            "storage_temperature": round(2.0 + (i % 4) * 1.0, 1),
            "storage_rh": round(90.0 + (i % 3) * 2.0, 1),
            "target_shelf_life": 7 + (i % 10),
            "oxygen_sensitivity": "Low",
            "moisture_sensitivity": "Medium" if i % 2 == 0 else "High",
            "light_sensitivity": "Low",
            "storage_type": "Refrigerated",
            "transport_condition": "Cold Chain",
            "recommended_material": "Perforated LDPE Produce Pouch (Synthetic Benchmark)"
        })

    # Archetype 2: Fresh Low/Mod-Respiration Produce & Root Vegetables (Carrots, apples, citrus)
    # Primary match: Low-Density Polyethylene Film (LDPE) or PLA
    for i in range(12):
        records.append({
            "food_name": f"Root/Pome Produce {i+1}",
            "category": "Produce",
            "moisture": round(82.0 + (i % 6) * 1.0, 1),
            "fat": round(0.1 + (i % 2) * 0.2, 1),
            "ph": round(4.2 + (i % 5) * 0.3, 2),
            "respiration_rate": "Low" if i % 2 == 0 else "Moderate",
            "storage_temperature": round(4.0 + (i % 5) * 1.5, 1),
            "storage_rh": round(85.0 + (i % 4) * 2.0, 1),
            "target_shelf_life": 21 + (i % 20),
            "oxygen_sensitivity": "Low",
            "moisture_sensitivity": "Medium",
            "light_sensitivity": "Low",
            "storage_type": "Refrigerated",
            "transport_condition": "Cold Chain",
            "recommended_material": "Low-Density Polyethylene Film (LDPE)"
        })

    # Archetype 3: High-Fat Crisp Snacks (Potato chips, extruded snacks, fried plantain chips)
    # Requires high moisture and oxygen barrier, lipid rancidity protection.
    # Primary match: Metallized PET Film (Met-PET) or BOPP
    for i in range(12):
        records.append({
            "food_name": f"Crispy Snack Item {i+1}",
            "category": "Snack Foods",
            "moisture": round(1.2 + (i % 4) * 0.5, 1),
            "fat": round(32.0 + (i % 6) * 1.8, 1),
            "ph": round(5.8 + (i % 5) * 0.2, 2),
            "respiration_rate": "None",
            "storage_temperature": round(20.0 + (i % 5) * 1.0, 1),
            "storage_rh": round(45.0 + (i % 5) * 3.0, 1),
            "target_shelf_life": 120 + (i % 60),
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "light_sensitivity": "High",
            "storage_type": "Ambient",
            "transport_condition": "Standard Ambient",
            "recommended_material": "Metallized PET Film (Met-PET)"
        })

    # Archetype 4: Ambient Dry Goods & Cereals (Biscuits, crackers, noodles)
    # Primary match: Biaxially Oriented Polypropylene (BOPP)
    for i in range(12):
        records.append({
            "food_name": f"Dry Cereal/Biscuit {i+1}",
            "category": "Dry Goods & Cereals",
            "moisture": round(3.5 + (i % 4) * 0.8, 1),
            "fat": round(8.0 + (i % 6) * 1.5, 1),
            "ph": round(6.0 + (i % 4) * 0.2, 2),
            "respiration_rate": "None",
            "storage_temperature": round(21.0 + (i % 4) * 1.0, 1),
            "storage_rh": round(50.0 + (i % 5) * 2.0, 1),
            "target_shelf_life": 180 + (i % 90),
            "oxygen_sensitivity": "Medium",
            "moisture_sensitivity": "High",
            "light_sensitivity": "Medium",
            "storage_type": "Ambient",
            "transport_condition": "Standard Ambient",
            "recommended_material": "Biaxially Oriented Polypropylene (BOPP)"
        })

    # Archetype 5: Chilled Fresh Red Meat & Poultry (High moisture, mod fat, MAP gas retention)
    # Primary match: EVOH Multi-layer Barrier Film (PE/EVOH/PE)
    for i in range(12):
        records.append({
            "food_name": f"Chilled Fresh Meat {i+1}",
            "category": "Meat & Poultry",
            "moisture": round(68.0 + (i % 5) * 1.2, 1),
            "fat": round(12.0 + (i % 6) * 2.0, 1),
            "ph": round(5.5 + (i % 4) * 0.15, 2),
            "respiration_rate": "None",
            "storage_temperature": round(1.0 + (i % 3) * 0.8, 1),
            "storage_rh": round(85.0 + (i % 3) * 2.0, 1),
            "target_shelf_life": 14 + (i % 7),
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "Medium",
            "light_sensitivity": "Medium",
            "storage_type": "Refrigerated",
            "transport_condition": "Cold Chain",
            "recommended_material": "EVOH Multi-layer Barrier Film (PE/EVOH/PE)"
        })

    # Archetype 6: Aged Cheeses & Dairy Blocks (Vacuum/gas flush, moderate moisture, high fat)
    # Primary match: EVOH Multi-layer Barrier Film (PE/EVOH/PE)
    for i in range(12):
        records.append({
            "food_name": f"Aged Cheese Block {i+1}",
            "category": "Dairy",
            "moisture": round(36.0 + (i % 4) * 1.5, 1),
            "fat": round(31.0 + (i % 5) * 1.5, 1),
            "ph": round(5.1 + (i % 4) * 0.1, 2),
            "respiration_rate": "None",
            "storage_temperature": round(4.0 + (i % 3) * 1.0, 1),
            "storage_rh": round(80.0 + (i % 4) * 2.0, 1),
            "target_shelf_life": 90 + (i % 30),
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "Medium",
            "light_sensitivity": "Medium",
            "storage_type": "Refrigerated",
            "transport_condition": "Cold Chain",
            "recommended_material": "EVOH Multi-layer Barrier Film (PE/EVOH/PE)"
        })

    # Archetype 7: Highly Acidic Liquid Condiments & Preserves (Tomato paste, citrus preserves, pickles)
    # Low pH, long shelf life, hermetic barrier. R007 bare metal restriction applies.
    # Primary match: Glass Container (Amber / Flint Jar)
    for i in range(12):
        records.append({
            "food_name": f"Acidic Preserve {i+1}",
            "category": "Condiments & Sauces",
            "moisture": round(65.0 + (i % 6) * 3.0, 1),
            "fat": round(0.5 + (i % 3) * 0.5, 1),
            "ph": round(3.1 + (i % 5) * 0.2, 2),
            "respiration_rate": "None",
            "storage_temperature": round(20.0 + (i % 4) * 1.5, 1),
            "storage_rh": round(60.0 + (i % 5) * 2.0, 1),
            "target_shelf_life": 365 + (i % 180),
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "light_sensitivity": "Medium",
            "storage_type": "Ambient",
            "transport_condition": "Standard Ambient",
            "recommended_material": "Glass Container (Amber / Flint Jar)"
        })

    # Archetype 8: Ultra-Sensitive Hygroscopic Powders (Infant formula, whole milk powder, freeze-dried coffee)
    # Extremely low moisture, high fat, 1-year+ shelf life, zero light/oxygen/moisture tolerance.
    # Primary match: Aluminum Foil Laminate (PET/Al-Foil/PE)
    for i in range(12):
        records.append({
            "food_name": f"Hygroscopic Powder {i+1}",
            "category": "Dairy",
            "moisture": round(2.2 + (i % 3) * 0.5, 1),
            "fat": round(24.0 + (i % 6) * 1.5, 1),
            "ph": round(6.5 + (i % 4) * 0.1, 2),
            "respiration_rate": "None",
            "storage_temperature": round(20.0 + (i % 4) * 1.0, 1),
            "storage_rh": round(45.0 + (i % 4) * 2.0, 1),
            "target_shelf_life": 365 + (i % 180),
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "light_sensitivity": "High",
            "storage_type": "Ambient",
            "transport_condition": "Standard Ambient",
            "recommended_material": "Aluminum Foil Laminate (PET/Al-Foil/PE)"
        })

    # Archetype 9: Shelf-Stable Liquid Beverages & Dairy (UHT Milk, Plant Milks, Juices)
    # Aseptic packaging, moderate-to-long shelf life, ambient distribution.
    # Primary match: Aseptic Paperboard Composite (Tetra-style Carton)
    for i in range(12):
        records.append({
            "food_name": f"Aseptic Beverage {i+1}",
            "category": "Beverages",
            "moisture": round(87.0 + (i % 4) * 1.5, 1),
            "fat": round(3.2 + (i % 4) * 0.8, 1),
            "ph": round(4.5 + (i % 5) * 0.5, 2),
            "respiration_rate": "None",
            "storage_temperature": round(22.0 + (i % 4) * 1.0, 1),
            "storage_rh": round(55.0 + (i % 5) * 2.0, 1),
            "target_shelf_life": 180 + (i % 90),
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "light_sensitivity": "High",
            "storage_type": "Ambient",
            "transport_condition": "Standard Ambient",
            "recommended_material": "Aseptic Paperboard Composite (Tetra-style Carton)"
        })

    # Archetype 10: Eco-Conscious Dry Grains & Legumes (Organic oats, lentils, rice)
    # Low moisture, non-sensitive, ambient shelf life, high sustainability priority.
    # Primary match: Kraft Paper + Bio-PBS Coating (Synthetic Benchmark)
    for i in range(12):
        records.append({
            "food_name": f"Organic Grain/Legume {i+1}",
            "category": "Dry Goods & Cereals",
            "moisture": round(11.0 + (i % 4) * 0.8, 1),
            "fat": round(2.0 + (i % 4) * 0.5, 1),
            "ph": round(6.4 + (i % 3) * 0.2, 2),
            "respiration_rate": "None",
            "storage_temperature": round(20.0 + (i % 4) * 1.0, 1),
            "storage_rh": round(50.0 + (i % 5) * 2.0, 1),
            "target_shelf_life": 240 + (i % 60),
            "oxygen_sensitivity": "Low",
            "moisture_sensitivity": "Medium",
            "light_sensitivity": "Low",
            "storage_type": "Ambient",
            "transport_condition": "Standard Ambient",
            "recommended_material": "Kraft Paper + Bio-PBS Coating (Synthetic Benchmark)"
        })

    # Archetype 11: General Dry Bulk / Granular Foods (Sugar, salt, dry beans)
    # Durable moisture barrier, cost efficiency, ambient.
    # Primary match: High-Density Polyethylene Film (HDPE)
    for i in range(12):
        records.append({
            "food_name": f"Bulk Dry Food {i+1}",
            "category": "Dry Goods & Cereals",
            "moisture": round(4.0 + (i % 4) * 1.0, 1),
            "fat": round(0.5 + (i % 3) * 0.5, 1),
            "ph": round(6.5 + (i % 3) * 0.2, 2),
            "respiration_rate": "None",
            "storage_temperature": round(22.0 + (i % 4) * 1.0, 1),
            "storage_rh": round(55.0 + (i % 4) * 2.0, 1),
            "target_shelf_life": 300 + (i % 60),
            "oxygen_sensitivity": "Low",
            "moisture_sensitivity": "High",
            "light_sensitivity": "Low",
            "storage_type": "Ambient",
            "transport_condition": "Standard Ambient",
            "recommended_material": "High-Density Polyethylene Film (HDPE)"
        })

    # Archetype 12: High-Clarity Short-Cycle Fresh Produce & Deli (Salad bowls, grab-and-go deli)
    # Bio-based priority, short shelf life, cold chain.
    # Primary match: Polylactic Acid Film (PLA)
    for i in range(12):
        records.append({
            "food_name": f"Fresh Deli Salad {i+1}",
            "category": "Produce",
            "moisture": round(85.0 + (i % 5) * 1.0, 1),
            "fat": round(1.5 + (i % 4) * 0.5, 1),
            "ph": round(5.2 + (i % 4) * 0.3, 2),
            "respiration_rate": "Low",
            "storage_temperature": round(4.0 + (i % 3) * 0.5, 1),
            "storage_rh": round(80.0 + (i % 4) * 2.0, 1),
            "target_shelf_life": 5 + (i % 5),
            "oxygen_sensitivity": "Low",
            "moisture_sensitivity": "Low",
            "light_sensitivity": "Low",
            "storage_type": "Refrigerated",
            "transport_condition": "Cold Chain",
            "recommended_material": "Polylactic Acid Film (PLA)"
        })

    return records

def save_dataset(output_dir: Path) -> None:
    """Save the dataset to CSV and JSON formats with clear provenance headers."""
    output_dir.mkdir(parents=True, exist_ok=True)
    records = generate_demonstration_records()
    df = pd.DataFrame(records)

    csv_path = output_dir / "training_data.csv"
    json_path = output_dir / "training_data.json"
    metadata_path = output_dir / "dataset_metadata.json"

    df.to_csv(csv_path, index=False)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump({**METADATA, "total_records": len(records), "classes_represented": sorted(list(df["recommended_material"].unique()))}, f, indent=2)

    print(f"Generated {len(records)} demonstration records across {df['recommended_material'].nunique()} material classes.")
    print(f"Saved CSV: {csv_path}")
    print(f"Saved JSON: {json_path}")
    print(f"Saved Metadata: {metadata_path}")

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent.parent
    data_dir = base_dir / "data"
    save_dataset(data_dir)
