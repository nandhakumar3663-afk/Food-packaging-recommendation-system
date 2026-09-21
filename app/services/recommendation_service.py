"""
Recommendation Service.
Orchestrates input validation, domain rule evaluation, multi-criteria compatibility scoring,
and candidate selection for food packaging materials.
"""

from typing import Dict, Any, Tuple, Optional, List
from pathlib import Path

from app.config import Config
from app.models.database import (
    get_food_by_id,
    get_all_materials,
    insert_recommendation,
)
from app.utils.validation import validate_food_input
from app.services.rule_engine import RuleEngine
from app.services.scoring_engine import ScoringEngine
from ml.inference.predictor import MLPredictor


class RecommendationService:
    """Core recommendation orchestrator combining database, rules, and scoring."""

    # Normalization mappings for case-insensitivity and standard synonyms
    SENSITIVITY_MAP = {
        "low": "Low",
        "medium": "Medium",
        "moderate": "Medium",
        "high": "High",
    }

    RESPIRATION_MAP = {
        "none": "None",
        "low": "Low",
        "moderate": "Moderate",
        "medium": "Moderate",
        "high": "High",
        "very high": "Very High",
        "very_high": "Very High",
    }

    STORAGE_TYPE_MAP = {
        "ambient": "Ambient",
        "refrigerated": "Refrigerated",
        "chilled": "Refrigerated",
        "frozen": "Frozen",
        "controlled atmosphere": "Controlled Atmosphere",
        "controlled_atmosphere": "Controlled Atmosphere",
    }

    TRANSPORT_MAP = {
        "standard": "Standard Ambient",
        "standard ambient": "Standard Ambient",
        "standard_ambient": "Standard Ambient",
        "ambient": "Standard Ambient",
        "refrigerated": "Cold Chain",
        "cold chain": "Cold Chain",
        "cold_chain": "Cold Chain",
        "ventilated": "Ventilated",
        "frozen": "Frozen Logistics",
        "frozen logistics": "Frozen Logistics",
        "frozen_logistics": "Frozen Logistics",
    }

    def __init__(self, db_path: Optional[Path] = None, rules_path: Optional[Path] = None):
        self.db_path = db_path or Config.DATABASE_PATH
        self.rule_engine = RuleEngine(rules_path=rules_path or Config.RULES_FILE)
        self.scoring_engine = ScoringEngine()
        self.ml_predictor = MLPredictor()

    def _normalize_input(self, raw_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize payload: lookup food_id preset defaults and standardize enum casing.
        """
        data = dict(raw_input)

        # Lookup food preset if food_id is provided
        food_id = data.get("food_id")
        if food_id is not None:
            try:
                food_rec = get_food_by_id(int(food_id), db_path=self.db_path)
                if food_rec:
                    # Inherit defaults for missing fields
                    for key, val in food_rec.items():
                        if key not in ["food_id", "created_at", "source", "source_url", "notes"]:
                            if key not in data or data[key] is None or data[key] == "":
                                data[key] = val
            except (ValueError, TypeError):
                pass

        # Normalize sensitivity enums
        for field in ["oxygen_sensitivity", "moisture_sensitivity", "light_sensitivity"]:
            if field in data and isinstance(data[field], str):
                key = data[field].strip().lower()
                data[field] = self.SENSITIVITY_MAP.get(key, data[field].capitalize())

        # Normalize respiration rate
        if "respiration_rate" in data and isinstance(data["respiration_rate"], str):
            key = data["respiration_rate"].strip().lower()
            data["respiration_rate"] = self.RESPIRATION_MAP.get(key, data["respiration_rate"])

        # Normalize storage type
        if "storage_type" in data and isinstance(data["storage_type"], str):
            key = data["storage_type"].strip().lower()
            data["storage_type"] = self.STORAGE_TYPE_MAP.get(key, data["storage_type"])

        # Normalize transport condition
        if "transport_condition" in data and isinstance(data["transport_condition"], str):
            key = data["transport_condition"].strip().lower()
            data["transport_condition"] = self.TRANSPORT_MAP.get(key, data["transport_condition"])

        return data

    @staticmethod
    def _format_reasons(
        material: Dict[str, Any],
        food: Dict[str, Any],
        sub_scores: Dict[str, float],
        triggered_rules: List[Dict[str, str]],
    ) -> List[str]:
        """Generate human-readable justification reasons."""
        reasons = []

        # Barrier justifications
        if food.get("oxygen_sensitivity") == "High":
            reasons.append(
                f"Selected for high oxygen protection (OTR: {material.get('otr')} {material.get('otr_unit', 'cc/(m²·day·atm)')}) "
                f"to mitigate lipid oxidation and sensory deterioration."
            )
        elif material.get("oxygen_barrier") in ["Good", "Excellent"]:
            reasons.append(f"Provides reliable {material.get('oxygen_barrier').lower()} oxygen barrier performance.")

        if food.get("moisture_sensitivity") == "High":
            reasons.append(
                f"Low water vapor transmission (WVTR: {material.get('wvtr')} {material.get('wvtr_unit', 'g/(m²·day)')}) "
                "prevents moisture loss or crispness degradation."
            )

        if food.get("target_shelf_life", 0) >= 180:
            reasons.append(
                f"Barrier integrity supports long-term shelf stability for requested {food.get('target_shelf_life')} days."
            )

        if material.get("recyclability", 0) >= 75.0:
            reasons.append(f"High post-consumer recyclability profile ({material.get('recyclability')}%).")

        if material.get("renewable_content", 0) >= 50.0:
            reasons.append(f"Contains {material.get('renewable_content')}% bio-based renewable content.")

        if sub_scores.get("cost", 0) >= 75.0:
            reasons.append(f"Favorable economic cost structure (${material.get('estimated_cost')}/m²).")

        if not reasons:
            reasons.append("Balanced multi-attribute performance meeting all domain constraints.")

        return reasons

    def analyze_and_recommend(
        self, raw_input: Dict[str, Any]
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[List[str]]]:
        """
        Execute full recommendation workflow:
        Input validation -> Candidate filtering -> Scoring -> Categorization -> DB logging.

        Returns:
            (is_success, response_data_or_None, error_list_or_None)
        """
        # 1. Normalize input
        food_data = self._normalize_input(raw_input)

        # 2. Validate input
        is_valid, errors = validate_food_input(food_data)
        if not is_valid:
            return False, None, errors

        # 3. Retrieve all candidate materials from database
        all_materials = get_all_materials(db_path=self.db_path)
        if not all_materials:
            return False, None, ["No packaging materials found in database. Please run seed script."]

        # 4. Evaluate domain rules and filter materials
        compatible, disqualified, rule_summary = self.rule_engine.filter_candidates(
            food_data, all_materials
        )

        # 5. Machine Learning candidate evaluation & Hard Rule Veto Check
        ml_result = self.ml_predictor.predict(food_data)
        top_ml_material = ml_result["top_predicted_material"]
        ml_probs = ml_result.get("probabilities", {})

        disqualified_map = {d["material"]["material_name"]: d["reasons"] for d in disqualified}
        rule_veto_occurred = top_ml_material in disqualified_map
        veto_details = None
        if rule_veto_occurred:
            reasons_str = "; ".join(disqualified_map[top_ml_material])
            veto_details = (
                f"Machine-learning candidate model suggested '{top_ml_material}', but it was vetoed "
                f"by domain safety rules ({reasons_str}) to ensure food safety and preservation."
            )

        # Fallback if no materials meet 100% of strict constraints
        evaluation_pool = compatible if compatible else all_materials
        active_warnings = list(rule_summary.get("warnings", []))
        if veto_details:
            active_warnings.append(veto_details)
        if not compatible:
            active_warnings.append(
                "No materials fully satisfied all strict barrier constraints. "
                "Evaluating closest candidate materials with compromise warnings."
            )

        # 6. Compute multi-criteria scores for candidate pool (hybridizing domain scoring + ML probability)
        scored_candidates = []
        for mat in evaluation_pool:
            default_score = self.scoring_engine.calculate_compatibility(mat, food_data)
            cost_score = self.scoring_engine.calculate_compatibility(
                mat, food_data, custom_weights=Config.SCORING_WEIGHTS_COST_PRIORITY
            )
            sust_score = self.scoring_engine.calculate_compatibility(
                mat, food_data, custom_weights=Config.SCORING_WEIGHTS_SUSTAINABILITY_PRIORITY
            )

            cand_ml_prob = ml_probs.get(mat["material_name"], 0.0)
            # Hybrid compatibility score: 85% domain multi-criteria + 15% ML learned confidence
            hybrid_score = round(0.85 * default_score.total_score + 0.15 * (cand_ml_prob * 100.0), 2)

            reasons = self._format_reasons(
                mat, food_data, default_score.to_dict(), rule_summary["triggered_rules"]
            )
            if mat["material_name"] == top_ml_material and not rule_veto_occurred:
                reasons.append(
                    f"Supported by machine-learning pattern recognition (model confidence: {round(cand_ml_prob * 100, 1)}%)."
                )

            scored_candidates.append({
                "material": mat,
                "compatibility_score": hybrid_score,
                "domain_score": default_score.total_score,
                "ml_confidence": round(cand_ml_prob * 100.0, 1),
                "is_ml_top_pick": (mat["material_name"] == top_ml_material and not rule_veto_occurred),
                "cost_priority_score": cost_score.total_score,
                "sustainability_priority_score": sust_score.total_score,
                "subscores": {
                    "oxygen": default_score.oxygen_score,
                    "moisture": default_score.moisture_score,
                    "mechanical": default_score.mechanical_score,
                    "sealability": default_score.sealability_score,
                    "shelf_life": default_score.shelf_life_score,
                    "sustainability": default_score.sustainability_score,
                    "cost": default_score.cost_score,
                },
                "triggered_rules": rule_summary["triggered_rules"],
                "reasons": reasons,
                "warnings": active_warnings,
            })

        # 7. Rank candidates
        # Recommended Match: highest overall hybrid score
        scored_by_default = sorted(
            scored_candidates, key=lambda x: x["compatibility_score"], reverse=True
        )
        recommended_match = scored_by_default[0]

        # Alternative Match: runner-up in overall score
        alternative_match = (
            scored_by_default[1] if len(scored_by_default) > 1 else recommended_match
        )

        # Lower-Cost Alternative: highest score under cost-priority profile
        scored_by_cost = sorted(
            scored_candidates, key=lambda x: (x["cost_priority_score"], -x["material"]["estimated_cost"]), reverse=True
        )
        lower_cost_alt = next(
            (c for c in scored_by_cost if c["material"]["material_id"] != recommended_match["material"]["material_id"]),
            scored_by_cost[0],
        )

        # Sustainability-Oriented Alternative: highest score under sustainability profile
        scored_by_sust = sorted(
            scored_candidates,
            key=lambda x: (x["sustainability_priority_score"], x["subscores"]["sustainability"]),
            reverse=True,
        )
        sustainability_alt = next(
            (c for c in scored_by_sust if c["material"]["material_id"] != recommended_match["material"]["material_id"]),
            scored_by_sust[0],
        )

        # 8. Persist recommendation in SQLite history
        rec_id = insert_recommendation(
            food_id=raw_input.get("food_id"),
            food_name=food_data["food_name"],
            category=food_data["category"],
            selected_material_id=recommended_match["material"]["material_id"],
            material_name=recommended_match["material"]["material_name"],
            recommendation_type="Recommended Match",
            compatibility_score=recommended_match["compatibility_score"],
            sub_scores=recommended_match["subscores"],
            reason="; ".join(recommended_match["reasons"][:2]),
            triggered_rules=recommended_match["triggered_rules"],
            input_snapshot=food_data,
            db_path=self.db_path,
        )

        # Clean representation helper (removes internal priority scoring keys)
        def clean_candidate(cand_dict: Dict[str, Any], label: str) -> Dict[str, Any]:
            res = dict(cand_dict)
            res["recommendation_type"] = label
            res.pop("cost_priority_score", None)
            res.pop("sustainability_priority_score", None)
            return res

        # 9. Build structured response
        response = {
            "success": True,
            "recommendation_id": rec_id,
            "analysis": {
                "food": food_data["food_name"],
                "category": food_data["category"],
                "target_shelf_life": food_data["target_shelf_life"],
                "storage": {
                    "temperature": food_data["storage_temperature"],
                    "rh": food_data["storage_rh"],
                    "storage_type": food_data.get("storage_type", "Ambient"),
                    "transport_condition": food_data.get("transport_condition", "Standard Ambient"),
                },
            },
            "constraints": rule_summary["constraints"],
            "candidate_count": len(compatible),
            "disqualified_count": len(disqualified),
            "ml_assessment": {
                "model_name": ml_result["model_name"],
                "model_architecture": ml_result["model_architecture"],
                "top_predicted_material": top_ml_material,
                "confidence": ml_result["confidence"],
                "rule_veto_occurred": rule_veto_occurred,
                "veto_details": veto_details,
                "training_data_status": ml_result["training_data_status"],
                "disclaimer": ml_result["disclaimer"],
            },
            "recommendations": {
                "recommended_match": clean_candidate(recommended_match, "Recommended Match"),
                "alternative_match": clean_candidate(alternative_match, "Alternative Match"),
                "lower_cost_alternative": clean_candidate(lower_cost_alt, "Lower-cost Alternative"),
                "sustainability_oriented_alternative": clean_candidate(
                    sustainability_alt, "Sustainability-oriented Alternative"
                ),
            },
            "disqualified_materials": [
                {
                    "material_name": d["material"]["material_name"],
                    "reasons": d["reasons"],
                }
                for d in disqualified
            ],
        }

        return True, response, None
