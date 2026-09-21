"""
Data Provenance Service for Food Packaging Recommendation System.
Classifies and contextualizes packaging specifications into verified literature,
synthetic benchmarks, and estimated metrics.
"""

from typing import Dict, Any, List

class ProvenanceService:
    """Standardizes provenance tracking for material properties."""

    @staticmethod
    def classify_source(source_text: str) -> str:
        """Categorize data origin into standard provenance tiers."""
        txt = (source_text or "").upper()
        if not txt or txt == "N/A":
            return "NOT AVAILABLE"
        if "SYNTHETIC" in txt:
            return "SYNTHETIC DEMONSTRATION DATA"
        if any(w in txt for w in ["ROBERTSON", "MASSEY", "RHIM", "USDA", "CRC PRESS", "SCIENCE"]):
            return "LITERATURE-BACKED"
        return "ESTIMATED"

    @classmethod
    def format_material_provenance(cls, material: Dict[str, Any]) -> Dict[str, Any]:
        """
        Produce a structured provenance report for all technical specifications of a material.
        """
        source_str = material.get("source", "Unknown")
        source_url = material.get("source_url")
        classification = cls.classify_source(source_str)

        return {
            "overall_classification": classification,
            "primary_source_citation": source_str,
            "source_url": source_url,
            "properties": {
                "otr": {
                    "value": material.get("otr"),
                    "unit": material.get("otr_unit", "cc/(m²·day·atm)"),
                    "test_condition": material.get("otr_test_condition", "23°C, 50% RH"),
                    "classification": classification
                },
                "wvtr": {
                    "value": material.get("wvtr"),
                    "unit": material.get("wvtr_unit", "g/(m²·day)"),
                    "test_condition": material.get("wvtr_test_condition", "38°C, 90% RH"),
                    "classification": classification
                },
                "thickness": {
                    "value": material.get("thickness"),
                    "unit": material.get("thickness_unit", "μm"),
                    "classification": classification
                },
                "estimated_cost": {
                    "value": material.get("estimated_cost"),
                    "unit": "USD / m²",
                    "classification": classification
                },
                "recyclability": {
                    "value": material.get("recyclability"),
                    "unit": "%",
                    "classification": classification
                },
                "renewable_content": {
                    "value": material.get("renewable_content"),
                    "unit": "%",
                    "classification": classification
                }
            }
        }
