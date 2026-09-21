"""
Unit tests for the transparent Rule Engine.
Tests individual rule activation, barrier constraints derivation, and candidate filtering.
"""

import pytest
from app.services.rule_engine import RuleEngine


@pytest.fixture
def rule_engine():
    return RuleEngine()


@pytest.fixture
def sample_materials():
    return [
        {
            "material_id": 1,
            "material_name": "EVOH Multi-layer Film",
            "material_category": "Flexible Film",
            "polymer_type": "EVOH",
            "otr": 3.5,
            "wvtr": 4.0,
            "oxygen_barrier": "Excellent",
            "moisture_barrier": "Good",
            "light_barrier": "Moderate",
        },
        {
            "material_id": 2,
            "material_name": "Standard LDPE Film",
            "material_category": "Flexible Film",
            "polymer_type": "LDPE",
            "otr": 7000.0,
            "wvtr": 18.0,
            "oxygen_barrier": "Poor",
            "moisture_barrier": "Moderate",
            "light_barrier": "Poor",
        },
        {
            "material_id": 3,
            "material_name": "Perforated Produce Film",
            "material_category": "Flexible Film",
            "polymer_type": "LDPE",
            "otr": 8500.0,
            "wvtr": 35.0,
            "oxygen_barrier": "Poor",
            "moisture_barrier": "Poor",
            "light_barrier": "Poor",
        },
        {
            "material_id": 4,
            "material_name": "Uncoated Tinplate Can",
            "material_category": "Metal",
            "polymer_type": None,
            "otr": 0.0,
            "wvtr": 0.0,
            "oxygen_barrier": "Excellent",
            "moisture_barrier": "Excellent",
            "light_barrier": "Excellent",
        }
    ]


def test_high_fat_and_oxygen_sensitivity_triggers_r001(rule_engine, sample_materials):
    """Rule 1: High fat + high oxygen sensitivity triggers max OTR <= 50."""
    food = {
        "food_name": "Potato Chips",
        "category": "Snack Foods",
        "fat": 35.0,
        "oxygen_sensitivity": "High",
        "moisture_sensitivity": "Low",
        "respiration_rate": "None",
        "target_shelf_life": 90,
        "ph": 6.0,
        "storage_temperature": 22.0,
        "light_sensitivity": "Low",
    }
    compatible, disqualified, summary = rule_engine.filter_candidates(food, sample_materials)

    # R001 should be triggered
    triggered_ids = [r["id"] for r in summary["triggered_rules"]]
    assert "R001_HIGH_FAT_OXIDATION" in triggered_ids
    assert summary["constraints"]["max_otr"] <= 50.0

    # EVOH (OTR 3.5) should be compatible; LDPE (OTR 7000) should be disqualified
    compat_names = [m["material_name"] for m in compatible]
    assert "EVOH Multi-layer Film" in compat_names
    assert "Standard LDPE Film" not in compat_names


def test_produce_respiration_requires_permeability_r004(rule_engine, sample_materials):
    """Rule 4: Produce with moderate/high respiration requires gas transmission (min OTR)."""
    food = {
        "food_name": "Fresh Strawberries",
        "category": "Produce",
        "fat": 0.3,
        "oxygen_sensitivity": "Low",
        "moisture_sensitivity": "Medium",
        "respiration_rate": "High",
        "target_shelf_life": 10,
        "ph": 3.5,
        "storage_temperature": 2.0,
        "light_sensitivity": "Low",
    }
    compatible, disqualified, summary = rule_engine.filter_candidates(food, sample_materials)

    triggered_ids = [r["id"] for r in summary["triggered_rules"]]
    assert "R004_PRODUCE_RESPIRATION_VENTILATION" in triggered_ids
    assert summary["constraints"]["min_otr"] >= 150.0

    # EVOH (OTR 3.5) and Metal (OTR 0.0) are too airtight and should be disqualified
    disqualified_names = [d["material"]["material_name"] for d in disqualified]
    assert "EVOH Multi-layer Film" in disqualified_names
    assert "Uncoated Tinplate Can" in disqualified_names

    # Perforated Produce Film (OTR 8500) should be compatible
    compat_names = [m["material_name"] for m in compatible]
    assert "Perforated Produce Film" in compat_names


def test_acidic_food_restricts_bare_metal_r007(rule_engine, sample_materials):
    """Rule 7: Low pH (<= 4.5) disallows bare metal."""
    food = {
        "food_name": "Tomato Paste",
        "category": "Produce",
        "fat": 0.5,
        "oxygen_sensitivity": "Low",
        "moisture_sensitivity": "Low",
        "respiration_rate": "None",
        "target_shelf_life": 30,
        "ph": 4.1,
        "storage_temperature": 20.0,
        "light_sensitivity": "Low",
    }
    compatible, disqualified, summary = rule_engine.filter_candidates(food, sample_materials)

    triggered_ids = [r["id"] for r in summary["triggered_rules"]]
    assert "R007_ACIDIC_FOOD_INERTNESS" in triggered_ids
    assert "Metal" in summary["constraints"]["disallowed_categories"]

    disqualified_names = [d["material"]["material_name"] for d in disqualified]
    assert "Uncoated Tinplate Can" in disqualified_names
