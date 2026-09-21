"""
Cost Analysis Service for Food Packaging Recommendation System.
Provides transparent material cost categorization, consumer unit cost estimation,
and economic scoring without fabricating volatile market commodity prices.
"""

from typing import Dict, Any, Optional

class CostService:
    """Evaluates material economic properties and estimates package-level costs."""

    DEFAULT_UNIT_PACKAGE_AREA_SQM = 0.05  # Standard ~200g snack/food pouch surface area (0.05 m²)
    REFERENCE_MAX_COST_PER_SQM = 2.50     # Reference normalization ceiling for high-end foils/glass

    @classmethod
    def classify_cost_status(cls, material: Dict[str, Any]) -> str:
        """
        Classify the provenance and reliability of the material's cost figure.
        """
        source = str(material.get("source", "")).upper()
        cost = material.get("estimated_cost")

        if cost is None or cost <= 0:
            return "Unknown / Not Available"
        if "SYNTHETIC" in source:
            return "Synthetic Demonstration Cost"
        if any(lit in source for lit in ["ROBERTSON", "MASSEY", "RHIM", "USDA"]):
            return "Literature/Source-Backed Cost"
        return "Estimated Benchmark Cost"

    @classmethod
    def get_cost_tier(cls, cost_per_sqm: float) -> str:
        """Categorize cost per square meter into commercial pricing tiers."""
        if cost_per_sqm < 0.35:
            return "Budget-Friendly (Commodity Polymer)"
        elif cost_per_sqm <= 0.80:
            return "Moderate / Standard Commercial Barrier"
        else:
            return "Premium High-Barrier / Specialized Composite"

    @classmethod
    def calculate_cost_score(cls, cost_per_sqm: float) -> float:
        """
        Inverted economic efficiency score: Lower cost yields higher score (0-100%).
        Uses a smooth power curve to ensure realistic distribution across commodity films.
        """
        if cost_per_sqm <= 0:
            return 50.0
        ratio = min(1.0, max(0.0, cost_per_sqm / cls.REFERENCE_MAX_COST_PER_SQM))
        score = 100.0 * (1.0 - (ratio ** 0.8))
        return round(max(5.0, min(100.0, score)), 2)

    @classmethod
    def analyze_cost(
        cls,
        material: Dict[str, Any],
        custom_area_sqm: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generate full economic analysis for a packaging material candidate.
        """
        area = custom_area_sqm if (custom_area_sqm and custom_area_sqm > 0) else cls.DEFAULT_UNIT_PACKAGE_AREA_SQM
        cost_sqm = float(material.get("estimated_cost", 0.0))
        status = cls.classify_cost_status(material)
        tier = cls.get_cost_tier(cost_sqm)
        score = cls.calculate_cost_score(cost_sqm)
        estimated_unit_cost = round(cost_sqm * area, 4)

        return {
            "cost_per_sqm": cost_sqm,
            "unit": "USD / m²",
            "cost_status": status,
            "cost_tier": tier,
            "cost_efficiency_score": score,
            "estimated_unit_package_cost": estimated_unit_cost,
            "assumed_package_area_sqm": area,
            "cost_transparency_note": (
                "Unit package cost is estimated based on baseline flat-sheet literature figures. "
                "Actual commercial prices fluctuate with resin indices, conversion tooling, and purchase volume."
            )
        }
