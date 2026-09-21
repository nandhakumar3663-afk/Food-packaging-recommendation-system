"""
Domain constants, reference ranges, and enumeration mappings for packaging and food science.
"""

# Valid categories for Food
FOOD_CATEGORIES = [
    "Dairy",
    "Produce",
    "Meat & Poultry",
    "Seafood",
    "Bakery",
    "Snack Foods",
    "Dry Goods & Cereals",
    "Beverage",
    "Confectionery",
]

# Respiration rates
RESPIRATION_RATES = ["None", "Low", "Moderate", "High", "Very High"]

# Sensitivity levels
SENSITIVITY_LEVELS = ["Low", "Medium", "High"]

# Packaging Material Categories
MATERIAL_CATEGORIES = [
    "Rigid Plastic",
    "Flexible Film",
    "Bio-polymer",
    "Paper & Paperboard",
    "Glass",
    "Metal",
    "Multi-layer Laminate",
]

# Qualitative barrier scale
BARRIER_LEVELS = ["Poor", "Moderate", "Good", "Excellent"]

# Qualitative mechanical strength scale
STRENGTH_LEVELS = ["Low", "Medium", "High", "Very High"]

# Qualitative sealability scale
SEALABILITY_LEVELS = ["Poor", "Moderate", "Good", "Excellent"]

# Storage types
STORAGE_TYPES = [
    "Ambient",
    "Refrigerated",
    "Frozen",
    "Controlled Atmosphere",
]

# Transportation conditions
TRANSPORT_CONDITIONS = [
    "Standard Ambient",
    "Cold Chain",
    "Ventilated",
    "Frozen Logistics",
]

# Numerical score mappings for qualitative barrier levels (0 - 100)
BARRIER_NUMERIC_MAP = {
    "Poor": 25.0,
    "Moderate": 55.0,
    "Good": 80.0,
    "Excellent": 100.0,
}

# Numerical score mappings for mechanical strength (0 - 100)
STRENGTH_NUMERIC_MAP = {
    "Low": 25.0,
    "Medium": 55.0,
    "High": 80.0,
    "Very High": 100.0,
}

# Standard test units
STANDARD_UNITS = {
    "otr": "cc/(m²·day·atm)",
    "wvtr": "g/(m²·day)",
    "thickness": "μm",
    "temperature": "°C",
    "humidity": "% RH",
    "cost": "$/m²",
}
