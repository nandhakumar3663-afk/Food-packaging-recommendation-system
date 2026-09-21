"""
Input validation layer for food packaging parameters and storage conditions.
Enforces physical domain boundaries, valid enum choices, and returns clear, structured errors.
"""

from typing import Dict, Any, List, Tuple
from app.utils.constants import (
    FOOD_CATEGORIES,
    RESPIRATION_RATES,
    SENSITIVITY_LEVELS,
    STORAGE_TYPES,
    TRANSPORT_CONDITIONS,
    MATERIAL_CATEGORIES,
    BARRIER_LEVELS,
    STRENGTH_LEVELS,
    SEALABILITY_LEVELS,
)


class ValidationError(Exception):
    """Exception raised when input data fails domain validation."""
    def __init__(self, errors: List[str]):
        super().__init__("; ".join(errors))
        self.errors = errors


def validate_food_input(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate food properties and storage input.
    Returns (is_valid, list_of_error_messages).
    """
    errors: List[str] = []

    # Required field presence check
    required_fields = [
        "food_name",
        "category",
        "moisture",
        "fat",
        "ph",
        "respiration_rate",
        "storage_temperature",
        "storage_rh",
        "target_shelf_life",
        "oxygen_sensitivity",
        "moisture_sensitivity",
        "light_sensitivity",
    ]

    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            errors.append(f"Missing required field: '{field}'")

    if errors:
        return False, errors

    # Name validation
    food_name = str(data.get("food_name", "")).strip()
    if len(food_name) < 2:
        errors.append("Field 'food_name' must be at least 2 characters long.")

    # Category validation
    category = data.get("category")
    if category not in FOOD_CATEGORIES:
        errors.append(
            f"Invalid category '{category}'. Must be one of: {', '.join(FOOD_CATEGORIES)}"
        )

    # Moisture validation: 0.0% to 100.0%
    try:
        moisture = float(data.get("moisture"))
        if not (0.0 <= moisture <= 100.0):
            errors.append(f"Moisture must be between 0.0 and 100.0%, received: {moisture}")
    except (ValueError, TypeError):
        errors.append(f"Moisture must be a valid number, received: {data.get('moisture')}")

    # Fat validation: 0.0% to 100.0%
    try:
        fat = float(data.get("fat"))
        if not (0.0 <= fat <= 100.0):
            errors.append(f"Fat must be between 0.0 and 100.0%, received: {fat}")
    except (ValueError, TypeError):
        errors.append(f"Fat must be a valid number, received: {data.get('fat')}")

    # Total moisture + fat check (can't exceed 100% of food composition)
    try:
        moisture = float(data.get("moisture", 0))
        fat = float(data.get("fat", 0))
        if moisture + fat > 100.0:
            errors.append(
                f"Combined moisture ({moisture}%) and fat ({fat}%) cannot exceed 100.0%."
            )
    except (ValueError, TypeError):
        pass

    # pH validation: 1.0 to 14.0
    try:
        ph = float(data.get("ph"))
        if not (1.0 <= ph <= 14.0):
            errors.append(f"pH must be between 1.0 and 14.0, received: {ph}")
    except (ValueError, TypeError):
        errors.append(f"pH must be a valid number, received: {data.get('ph')}")

    # Respiration rate
    respiration = data.get("respiration_rate")
    if respiration not in RESPIRATION_RATES:
        errors.append(
            f"Invalid respiration rate '{respiration}'. Must be one of: {', '.join(RESPIRATION_RATES)}"
        )

    # Storage Temperature: -40.0°C to 60.0°C
    try:
        temp = float(data.get("storage_temperature"))
        if not (-40.0 <= temp <= 60.0):
            errors.append(f"Storage temperature must be between -40°C and 60°C, received: {temp}")
    except (ValueError, TypeError):
        errors.append(
            f"Storage temperature must be a valid number, received: {data.get('storage_temperature')}"
        )

    # Relative Humidity: 0.0% to 100.0%
    try:
        rh = float(data.get("storage_rh"))
        if not (0.0 <= rh <= 100.0):
            errors.append(f"Storage RH must be between 0% and 100%, received: {rh}")
    except (ValueError, TypeError):
        errors.append(f"Storage RH must be a valid number, received: {data.get('storage_rh')}")

    # Target shelf life: >= 1 day, integer
    try:
        shelf_life = int(data.get("target_shelf_life"))
        if shelf_life < 1 or shelf_life > 3650:
            errors.append(
                f"Target shelf life must be between 1 and 3650 days (10 years), received: {shelf_life}"
            )
    except (ValueError, TypeError):
        errors.append(
            f"Target shelf life must be a positive integer, received: {data.get('target_shelf_life')}"
        )

    # Sensitivity levels
    for sens_field in ["oxygen_sensitivity", "moisture_sensitivity", "light_sensitivity"]:
        val = data.get(sens_field)
        if val not in SENSITIVITY_LEVELS:
            errors.append(
                f"Invalid {sens_field} '{val}'. Must be one of: {', '.join(SENSITIVITY_LEVELS)}"
            )

    # Storage type (optional or default)
    if "storage_type" in data and data["storage_type"] is not None:
        if data["storage_type"] not in STORAGE_TYPES:
            errors.append(
                f"Invalid storage_type '{data['storage_type']}'. Must be one of: {', '.join(STORAGE_TYPES)}"
            )

    # Transport condition (optional or default)
    if "transport_condition" in data and data["transport_condition"] is not None:
        if data["transport_condition"] not in TRANSPORT_CONDITIONS:
            errors.append(
                f"Invalid transport_condition '{data['transport_condition']}'. Must be one of: {', '.join(TRANSPORT_CONDITIONS)}"
            )

    return (len(errors) == 0, errors)


def validate_material_input(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate packaging material attributes.
    Returns (is_valid, list_of_error_messages).
    """
    errors: List[str] = []

    required_fields = [
        "material_name",
        "material_category",
        "otr",
        "wvtr",
        "thickness",
        "oxygen_barrier",
        "moisture_barrier",
        "light_barrier",
        "mechanical_strength",
        "sealability",
        "recyclability",
        "renewable_content",
        "estimated_cost",
        "source",
    ]

    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            errors.append(f"Missing required material field: '{field}'")

    if errors:
        return False, errors

    # Category validation
    category = data.get("material_category")
    if category not in MATERIAL_CATEGORIES:
        errors.append(
            f"Invalid material category '{category}'. Must be one of: {', '.join(MATERIAL_CATEGORIES)}"
        )

    # Non-negative numeric validations
    numeric_checks = [
        ("otr", 0.0, 100000.0, "OTR"),
        ("wvtr", 0.0, 10000.0, "WVTR"),
        ("thickness", 1.0, 50000.0, "Thickness (μm)"),
        ("recyclability", 0.0, 100.0, "Recyclability (%)"),
        ("renewable_content", 0.0, 100.0, "Renewable content (%)"),
        ("estimated_cost", 0.01, 1000.0, "Estimated cost ($/m²)"),
    ]

    for field, min_val, max_val, label in numeric_checks:
        try:
            val = float(data.get(field))
            if not (min_val <= val <= max_val):
                errors.append(f"{label} must be between {min_val} and {max_val}, received: {val}")
        except (ValueError, TypeError):
            errors.append(f"{label} must be a valid numeric value, received: {data.get(field)}")

    # Qualitative rating checks
    for barrier in ["oxygen_barrier", "moisture_barrier", "light_barrier", "sealability"]:
        val = data.get(barrier)
        if val not in BARRIER_LEVELS:
            errors.append(
                f"Invalid {barrier} '{val}'. Must be one of: {', '.join(BARRIER_LEVELS)}"
            )

    strength = data.get("mechanical_strength")
    if strength not in STRENGTH_LEVELS:
        errors.append(
            f"Invalid mechanical_strength '{strength}'. Must be one of: {', '.join(STRENGTH_LEVELS)}"
        )

    # Provenance requirements
    source = str(data.get("source", "")).strip()
    if len(source) < 3:
        errors.append("Field 'source' must be specified (cite literature or label as SYNTHETIC DEMONSTRATION DATA).")

    return (len(errors) == 0, errors)
