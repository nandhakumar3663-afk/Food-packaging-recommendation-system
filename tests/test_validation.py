"""
Unit tests for domain validation layer (food input & packaging material attributes).
"""

import pytest
from app.utils.validation import validate_food_input, validate_material_input


@pytest.fixture
def valid_food_payload():
    return {
        "food_name": "Roasted Coffee Beans",
        "category": "Dry Goods & Cereals",
        "moisture": 2.5,
        "fat": 15.0,
        "ph": 5.2,
        "respiration_rate": "None",
        "storage_temperature": 20.0,
        "storage_rh": 50.0,
        "target_shelf_life": 180,
        "oxygen_sensitivity": "High",
        "moisture_sensitivity": "High",
        "light_sensitivity": "High",
    }


@pytest.fixture
def valid_material_payload():
    return {
        "material_name": "EVOH Barrier Film",
        "material_category": "Flexible Film",
        "polymer_type": "EVOH",
        "otr": 3.5,
        "otr_unit": "cc/(m²·day·atm)",
        "otr_test_condition": "23°C, 65% RH",
        "wvtr": 4.0,
        "wvtr_unit": "g/(m²·day)",
        "wvtr_test_condition": "38°C, 90% RH",
        "thickness": 60.0,
        "thickness_unit": "μm",
        "oxygen_barrier": "Excellent",
        "moisture_barrier": "Good",
        "light_barrier": "Moderate",
        "mechanical_strength": "High",
        "sealability": "Good",
        "recyclability": 30.0,
        "renewable_content": 0.0,
        "estimated_cost": 0.85,
        "source": "Robertson, G. L. (2012). Food Packaging: Principles and Practice.",
    }


class TestFoodValidation:
    """Test suite for food input validation."""

    def test_valid_food_passes(self, valid_food_payload):
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is True
        assert len(errors) == 0

    def test_missing_required_field(self, valid_food_payload):
        del valid_food_payload["food_name"]
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("Missing required field: 'food_name'" in err for err in errors)

    def test_negative_moisture_rejected(self, valid_food_payload):
        valid_food_payload["moisture"] = -5.0
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("Moisture must be between 0.0 and 100.0%" in err for err in errors)

    def test_excessive_moisture_rejected(self, valid_food_payload):
        valid_food_payload["moisture"] = 105.0
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("Moisture must be between 0.0 and 100.0%" in err for err in errors)

    def test_moisture_plus_fat_exceeds_100(self, valid_food_payload):
        valid_food_payload["moisture"] = 60.0
        valid_food_payload["fat"] = 55.0
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("cannot exceed 100.0%" in err for err in errors)

    def test_invalid_ph_ranges(self, valid_food_payload):
        # pH < 1.0
        valid_food_payload["ph"] = 0.5
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("pH must be between 1.0 and 14.0" in err for err in errors)

        # pH > 14.0
        valid_food_payload["ph"] = 15.0
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("pH must be between 1.0 and 14.0" in err for err in errors)

    def test_invalid_category(self, valid_food_payload):
        valid_food_payload["category"] = "NonExistentCategory"
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("Invalid category 'NonExistentCategory'" in err for err in errors)

    def test_invalid_shelf_life(self, valid_food_payload):
        valid_food_payload["target_shelf_life"] = 0
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("Target shelf life must be between 1 and 3650 days" in err for err in errors)

    def test_invalid_temperature_bounds(self, valid_food_payload):
        valid_food_payload["storage_temperature"] = -60.0  # Absurd cryogenic temp
        is_valid, errors = validate_food_input(valid_food_payload)
        assert is_valid is False
        assert any("Storage temperature must be between -40°C and 60°C" in err for err in errors)


class TestMaterialValidation:
    """Test suite for packaging material validation."""

    def test_valid_material_passes(self, valid_material_payload):
        is_valid, errors = validate_material_input(valid_material_payload)
        assert is_valid is True
        assert len(errors) == 0

    def test_negative_otr_rejected(self, valid_material_payload):
        valid_material_payload["otr"] = -10.0
        is_valid, errors = validate_material_input(valid_material_payload)
        assert is_valid is False
        assert any("OTR must be between" in err for err in errors)

    def test_negative_wvtr_rejected(self, valid_material_payload):
        valid_material_payload["wvtr"] = -1.0
        is_valid, errors = validate_material_input(valid_material_payload)
        assert is_valid is False
        assert any("WVTR must be between" in err for err in errors)

    def test_invalid_barrier_qualitative_rating(self, valid_material_payload):
        valid_material_payload["oxygen_barrier"] = "SuperDuper"
        is_valid, errors = validate_material_input(valid_material_payload)
        assert is_valid is False
        assert any("Invalid oxygen_barrier 'SuperDuper'" in err for err in errors)

    def test_missing_source_rejected(self, valid_material_payload):
        valid_material_payload["source"] = ""
        is_valid, errors = validate_material_input(valid_material_payload)
        assert is_valid is False
        assert any("source" in err.lower() for err in errors)

        valid_material_payload["source"] = "ab"  # Too short (< 3 chars)
        is_valid, errors = validate_material_input(valid_material_payload)
        assert is_valid is False
        assert any("Field 'source' must be specified" in err for err in errors)
