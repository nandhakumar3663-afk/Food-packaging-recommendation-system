"""
Transparent Rule Engine for Food Packaging Requirements.
Loads declarative YAML rules and evaluates food attributes against packaging barriers.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import yaml

from app.config import Config
from app.utils.constants import BARRIER_LEVELS, FOOD_CATEGORIES


BARRIER_RANK = {
    "Poor": 0,
    "Moderate": 1,
    "Good": 2,
    "Excellent": 3,
}


class RuleEngine:
    """Evaluates domain rules from YAML and filters incompatible packaging candidates."""

    def __init__(self, rules_path: Optional[Path] = None):
        self.rules_path = rules_path or Config.RULES_FILE
        self.rules = self._load_rules()

    def _load_rules(self) -> List[Dict[str, Any]]:
        """Load rules from YAML configuration."""
        if not Path(self.rules_path).exists():
            return []
        with open(self.rules_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
            return data.get("rules", [])

    def _check_condition(self, condition: Dict[str, Any], food: Dict[str, Any]) -> bool:
        """Evaluate single condition block against food properties."""
        field = condition.get("field")
        op = condition.get("operator")
        val = condition.get("value")

        food_val = food.get(field)
        if food_val is None:
            return False

        # Evaluate primary condition
        primary_match = self._compare(food_val, op, val)
        if not primary_match:
            return False

        # Evaluate optional secondary AND condition
        and_field = condition.get("and_field")
        if and_field:
            and_op = condition.get("and_operator")
            and_val = condition.get("and_value")
            second_val = food.get(and_field)
            if second_val is None:
                return False
            return self._compare(second_val, and_op, and_val)

        return True

    @staticmethod
    def _compare(actual: Any, op: str, expected: Any) -> bool:
        """Helper to perform operator comparisons safely."""
        try:
            if op == "==":
                return actual == expected
            elif op == "!=":
                return actual != expected
            elif op == ">=":
                return float(actual) >= float(expected)
            elif op == "<=":
                return float(actual) <= float(expected)
            elif op == ">":
                return float(actual) > float(expected)
            elif op == "<":
                return float(actual) < float(expected)
            elif op == "in":
                return actual in expected
            elif op == "not in":
                return actual not in expected
        except (ValueError, TypeError):
            return False
        return False

    def evaluate_food_rules(self, food: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate all rules against food input and derive aggregated constraints.
        Returns:
            {
                "triggered_rules": [...],
                "constraints": {
                    "max_otr": float or None,
                    "min_otr": float or None,
                    "max_wvtr": float or None,
                    "min_oxygen_barrier_rank": int,
                    "min_moisture_barrier_rank": int,
                    "min_light_barrier_rank": int,
                    "disallowed_categories": [...],
                    "disallowed_polymer_types": [...],
                },
                "warnings": [...]
            }
        """
        triggered = []
        warnings = []
        max_otr: Optional[float] = None
        min_otr: Optional[float] = None
        max_wvtr: Optional[float] = None
        min_o2_rank = 0
        min_wvtr_rank = 0
        min_light_rank = 0
        disallowed_cats = set()
        disallowed_polymers = set()

        for rule in self.rules:
            cond = rule.get("condition", {})
            if self._check_condition(cond, food):
                triggered.append({
                    "id": rule.get("id"),
                    "name": rule.get("name"),
                    "explanation": rule.get("explanation"),
                })

                constraints = rule.get("constraints", {})

                # OTR constraints
                if "max_otr" in constraints:
                    val = float(constraints["max_otr"])
                    max_otr = val if max_otr is None else min(max_otr, val)
                if "min_otr" in constraints:
                    val = float(constraints["min_otr"])
                    min_otr = val if min_otr is None else max(min_otr, val)

                # WVTR constraints
                if "max_wvtr" in constraints:
                    val = float(constraints["max_wvtr"])
                    max_wvtr = val if max_wvtr is None else min(max_wvtr, val)

                # Barrier rank constraints
                if "min_oxygen_barrier_rank" in constraints:
                    min_o2_rank = max(min_o2_rank, int(constraints["min_oxygen_barrier_rank"]))
                if "min_moisture_barrier_rank" in constraints:
                    min_wvtr_rank = max(min_wvtr_rank, int(constraints["min_moisture_barrier_rank"]))
                if "min_light_barrier_rank" in constraints:
                    min_light_rank = max(min_light_rank, int(constraints["min_light_barrier_rank"]))

                # Disallowed materials
                if "disallowed_categories" in constraints:
                    disallowed_cats.update(constraints["disallowed_categories"])
                if "disallowed_polymer_types" in constraints:
                    disallowed_polymers.update(constraints["disallowed_polymer_types"])

        # Check for conflict between produce respiration and strict oxygen barrier
        if min_otr is not None and max_otr is not None and min_otr > max_otr:
            warnings.append(
                f"Conflicting barrier constraints detected: produce respiration requires OTR >= {min_otr} "
                f"but fat/shelf-life rules requested OTR <= {max_otr}. "
                "Produce respiration permeability prioritised to avoid anaerobic decay."
            )
            # Prioritize produce safety over anaerobic seal
            max_otr = None

        return {
            "triggered_rules": triggered,
            "constraints": {
                "max_otr": max_otr,
                "min_otr": min_otr,
                "max_wvtr": max_wvtr,
                "min_oxygen_barrier_rank": min_o2_rank,
                "min_moisture_barrier_rank": min_wvtr_rank,
                "min_light_barrier_rank": min_light_rank,
                "disallowed_categories": list(disallowed_cats),
                "disallowed_polymer_types": list(disallowed_polymers),
            },
            "warnings": warnings,
        }

    def filter_candidates(
        self, food: Dict[str, Any], materials: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
        """
        Filter candidate packaging materials based on evaluated food rules.
        Returns:
            (compatible_candidates, disqualified_candidates, rule_summary)
        """
        rule_summary = self.evaluate_food_rules(food)
        c = rule_summary["constraints"]

        compatible = []
        disqualified = []

        for mat in materials:
            reasons = []

            mat_cat = mat.get("material_category", "")
            poly_type = mat.get("polymer_type", "")
            otr = float(mat.get("otr", 0.0))
            wvtr = float(mat.get("wvtr", 0.0))
            o2_barrier = mat.get("oxygen_barrier", "Poor")
            wv_barrier = mat.get("moisture_barrier", "Poor")
            light_barrier = mat.get("light_barrier", "Poor")

            o2_rank = BARRIER_RANK.get(o2_barrier, 0)
            wv_rank = BARRIER_RANK.get(wv_barrier, 0)
            light_rank = BARRIER_RANK.get(light_barrier, 0)

            # Check disallowed category
            if mat_cat in c["disallowed_categories"]:
                reasons.append(f"Material category '{mat_cat}' is restricted for this food profile.")

            # Check disallowed polymer
            if poly_type and poly_type in c["disallowed_polymer_types"]:
                reasons.append(f"Polymer type '{poly_type}' is restricted under target storage temperatures.")

            # Check max OTR
            if c["max_otr"] is not None and otr > c["max_otr"]:
                reasons.append(
                    f"OTR of {otr} cc/(m²·day·atm) exceeds maximum allowable limit of {c['max_otr']}."
                )

            # Check min OTR (for produce respiration)
            if c["min_otr"] is not None and otr < c["min_otr"]:
                # If packaging is hermetic (OTR < min_otr), it causes anaerobic suffocation unless macro-perforated
                reasons.append(
                    f"OTR of {otr} is too low for respiring produce; requires minimum OTR of {c['min_otr']} to avoid anaerobic spoilage."
                )

            # Check max WVTR
            if c["max_wvtr"] is not None and wvtr > c["max_wvtr"]:
                reasons.append(
                    f"WVTR of {wvtr} g/(m²·day) exceeds maximum allowable limit of {c['max_wvtr']}."
                )

            # Check minimum barrier ranks
            if o2_rank < c["min_oxygen_barrier_rank"]:
                reasons.append(f"Oxygen barrier rating '{o2_barrier}' is lower than required threshold.")
            if wv_rank < c["min_moisture_barrier_rank"]:
                reasons.append(f"Moisture barrier rating '{wv_barrier}' is lower than required threshold.")
            if light_rank < c["min_light_barrier_rank"]:
                reasons.append(f"Light barrier rating '{light_barrier}' is lower than required threshold.")

            if reasons:
                disqualified.append({
                    "material": mat,
                    "reasons": reasons,
                })
            else:
                compatible.append(mat)

        return compatible, disqualified, rule_summary
