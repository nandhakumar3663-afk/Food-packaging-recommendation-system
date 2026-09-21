"""
Sustainability Evaluation Service for Food Packaging Recommendation System.
Computes a transparent, project-defined Sustainability Index incorporating
recyclability, bio-renewable content, and end-of-life recovery pathways.
"""

from typing import Dict, Any

class SustainabilityService:
    """Calculates project-defined circularity and sustainability indices."""

    # Explicit pathway mappings and circularity scoring (0 - 100)
    END_OF_LIFE_PATHWAYS = {
        "Inorganic Glass": {
            "pathway": "Closed-Loop Bottle/Jar Recycling",
            "score": 95.0,
            "description": "Infinitely recyclable into food-grade containers without property degradation."
        },
        "Paperboard/Al/PE": {
            "pathway": "Specialized Hydrapulping & Carton Recycling",
            "score": 70.0,
            "description": "High fiber recovery in carton recycling plants; foil/polymer separation required."
        },
        "Paper/PBS": {
            "pathway": "Paper Stream Recycling / Industrial Composting",
            "score": 85.0,
            "description": "High renewable kraft content with biodegradable aliphatic polyester coating."
        },
        "PLA": {
            "pathway": "Industrial Organic Composting (ASTM D6400)",
            "score": 65.0,
            "description": "100% bio-based corn/cassava starch polyester; requires commercial high-heat composting."
        },
        "HDPE": {
            "pathway": "Mechanical Rigid/Film Polyolefin Recycling",
            "score": 80.0,
            "description": "Established curbside mechanical recycling infrastructure with high demand for post-consumer resin."
        },
        "LDPE": {
            "pathway": "Clean Flexible Film Recycling Stream",
            "score": 75.0,
            "description": "Widely recyclable through retail film return drop-offs and agricultural film recycling."
        },
        "PP": {
            "pathway": "Polypropylene Mechanical Recycling Stream",
            "score": 75.0,
            "description": "High melt strength thermoplastic with expanding curbside collection programs."
        },
        "PET": {
            "pathway": "PET Mechanical Flake / Thermal Recycling",
            "score": 75.0,
            "description": "Clear film recyclable; metallized thin coating acceptable in limited percentages."
        },
        "EVOH": {
            "pathway": "Multi-layer Barrier Film Recovery",
            "score": 35.0,
            "description": "Coextruded barrier film; compatible with polyolefin streams only when tie-layer compatible."
        },
        "Alu-Laminate": {
            "pathway": "Multi-material Energy Recovery / Chemical Delamination",
            "score": 25.0,
            "description": "Foil/polymer composite is difficult to separate mechanically; typically destined for thermal recovery."
        }
    }

    @classmethod
    def get_end_of_life_details(cls, polymer_type: str) -> Dict[str, Any]:
        """Lookup end-of-life pathway and score for a given polymer or substrate."""
        clean_key = (polymer_type or "").strip()
        return cls.END_OF_LIFE_PATHWAYS.get(clean_key, {
            "pathway": "General Solid Waste / Mixed Mechanical Stream",
            "score": 50.0,
            "description": "Standard mixed polymer waste stream."
        })

    @classmethod
    def evaluate_sustainability(cls, material: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compute the Project-Defined Sustainability Index and component breakdown.
        Weights: Recyclability (40%), Renewable Content (35%), End-of-Life Pathway (25%).
        """
        recyc = float(material.get("recyclability", 0.0))
        renew = float(material.get("renewable_content", 0.0))
        polymer = material.get("polymer_type", "")

        eol_info = cls.get_end_of_life_details(polymer)
        eol_score = eol_info["score"]

        # Weighted index formula
        index_val = (0.40 * recyc) + (0.35 * renew) + (0.25 * eol_score)
        index_val = round(min(100.0, max(0.0, index_val)), 1)

        # Qualitative circularity rating
        if index_val >= 80.0:
            rating = "High Circularity (Eco-Preferred)"
        elif index_val >= 60.0:
            rating = "Moderate Circularity (Standard Commercial)"
        elif index_val >= 40.0:
            rating = "Transition Substrate (Mixed Components)"
        else:
            rating = "Low Circularity (Hard-to-Recycle Composite)"

        return {
            "project_sustainability_index": index_val,
            "sustainability_tier": rating,
            "components": {
                "recyclability_rate": recyc,
                "renewable_bio_content": renew,
                "end_of_life_score": eol_score,
                "end_of_life_pathway": eol_info["pathway"],
                "pathway_description": eol_info["description"]
            },
            "formula_weights": {
                "recyclability": 0.40,
                "renewable_content": 0.35,
                "end_of_life_pathway": 0.25
            },
            "certification_disclaimer": (
                "The Sustainability Index is a project-defined decision heuristic based on literature "
                "data. It does NOT represent an official ISO 14040/14044 Life Cycle Assessment (LCA), "
                "EPD, or certified third-party eco-label."
            )
        }
