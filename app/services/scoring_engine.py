"""
Scoring Engine for Computing Project-Defined Packaging Compatibility.
Implements a multi-attribute weighted scoring model for candidate packaging materials.
"""

from typing import Dict, Any, Optional
from app.config import Config
from app.models.schemas import CompatibilityScore
from app.utils.constants import (
    BARRIER_NUMERIC_MAP,
    STRENGTH_NUMERIC_MAP,
)


class ScoringEngine:
    """Computes transparent, project-defined compatibility scores for packaging materials."""

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or Config.SCORING_WEIGHTS

    @staticmethod
    def _calc_oxygen_score(mat: Dict[str, Any], food: Dict[str, Any]) -> float:
        """
        Evaluate oxygen barrier adequacy.
        High sensitivity food needs low OTR (< 20 = 100 score, > 200 = low score).
        Low sensitivity food is less demanding.
        """
        otr = float(mat.get("otr", 100.0))
        sens = food.get("oxygen_sensitivity", "Medium")

        # Base rating from qualitative level
        barrier_str = mat.get("oxygen_barrier", "Moderate")
        base = BARRIER_NUMERIC_MAP.get(barrier_str, 50.0)

        # Quantitative OTR penalty/bonus
        if sens == "High":
            if otr <= 5.0:
                q_score = 100.0
            elif otr <= 25.0:
                q_score = 90.0
            elif otr <= 100.0:
                q_score = 65.0
            elif otr <= 500.0:
                q_score = 40.0
            else:
                q_score = 15.0
        elif sens == "Medium":
            if otr <= 50.0:
                q_score = 95.0
            elif otr <= 300.0:
                q_score = 80.0
            elif otr <= 1500.0:
                q_score = 60.0
            else:
                q_score = 35.0
        else:  # Low sensitivity
            if otr <= 2000.0:
                q_score = 95.0
            else:
                q_score = 75.0

        # Blended qualitative and quantitative metric
        return round(0.5 * base + 0.5 * q_score, 2)

    @staticmethod
    def _calc_moisture_score(mat: Dict[str, Any], food: Dict[str, Any]) -> float:
        """Evaluate water vapor barrier adequacy."""
        wvtr = float(mat.get("wvtr", 10.0))
        sens = food.get("moisture_sensitivity", "Medium")

        barrier_str = mat.get("moisture_barrier", "Moderate")
        base = BARRIER_NUMERIC_MAP.get(barrier_str, 50.0)

        if sens == "High":
            if wvtr <= 1.0:
                q_score = 100.0
            elif wvtr <= 5.0:
                q_score = 88.0
            elif wvtr <= 15.0:
                q_score = 60.0
            elif wvtr <= 50.0:
                q_score = 30.0
            else:
                q_score = 10.0
        elif sens == "Medium":
            if wvtr <= 8.0:
                q_score = 95.0
            elif wvtr <= 25.0:
                q_score = 80.0
            elif wvtr <= 80.0:
                q_score = 55.0
            else:
                q_score = 30.0
        else:  # Low
            if wvtr <= 100.0:
                q_score = 95.0
            else:
                q_score = 75.0

        return round(0.5 * base + 0.5 * q_score, 2)

    @staticmethod
    def _calc_shelf_life_score(mat: Dict[str, Any], food: Dict[str, Any]) -> float:
        """
        Evaluate material longevity potential against target shelf life.
        Long target shelf life (>180 days) requires high barrier integrity.
        """
        target_days = int(food.get("target_shelf_life", 30))
        otr = float(mat.get("otr", 100.0))
        wvtr = float(mat.get("wvtr", 10.0))

        if target_days <= 14:
            return 95.0
        elif target_days <= 60:
            return 90.0 if (otr <= 2000 and wvtr <= 50) else 65.0
        elif target_days <= 180:
            return 95.0 if (otr <= 100 and wvtr <= 15) else (75.0 if otr <= 500 else 50.0)
        else:  # Long shelf life (> 180 days)
            if otr <= 10.0 and wvtr <= 3.0:
                return 98.0
            elif otr <= 50.0 and wvtr <= 8.0:
                return 80.0
            else:
                return 45.0

    @staticmethod
    def _calc_mechanical_score(mat: Dict[str, Any]) -> float:
        """Evaluate puncture/tensile strength rating."""
        strength = mat.get("mechanical_strength", "Medium")
        return STRENGTH_NUMERIC_MAP.get(strength, 55.0)

    @staticmethod
    def _calc_sealability_score(mat: Dict[str, Any]) -> float:
        """Evaluate hermetic heat seal integrity."""
        seal = mat.get("sealability", "Moderate")
        return BARRIER_NUMERIC_MAP.get(seal, 55.0)

    @staticmethod
    def _calc_sustainability_score(mat: Dict[str, Any]) -> float:
        """
        Combined sustainability score:
        60% weight on recyclability, 40% on bio-based/renewable content.
        """
        recyc = float(mat.get("recyclability", 0.0))
        renew = float(mat.get("renewable_content", 0.0))
        score = (0.6 * recyc) + (0.4 * renew)
        return round(min(100.0, max(0.0, score)), 2)

    @staticmethod
    def _calc_cost_score(mat: Dict[str, Any]) -> float:
        """
        Inverted cost score: Lower cost per m² yields higher economic score.
        Reference max cost = $2.50/m² for index normalization.
        """
        cost = float(mat.get("estimated_cost", 0.50))
        max_ref = 2.50
        ratio = min(1.0, max(0.0, cost / max_ref))
        # Non-linear curve so moderate cost materials score well (e.g. $0.50 -> 80)
        score = 100.0 * (1.0 - (ratio ** 0.8))
        return round(max(5.0, score), 2)

    def calculate_compatibility(
        self,
        mat: Dict[str, Any],
        food: Dict[str, Any],
        custom_weights: Optional[Dict[str, float]] = None
    ) -> CompatibilityScore:
        """
        Calculate individual dimension scores and total weighted compatibility score.
        """
        w = custom_weights or self.weights

        s_o2 = self._calc_oxygen_score(mat, food)
        s_wv = self._calc_moisture_score(mat, food)
        s_shelf = self._calc_shelf_life_score(mat, food)
        s_mech = self._calc_mechanical_score(mat)
        s_seal = self._calc_sealability_score(mat)
        s_sust = self._calc_sustainability_score(mat)
        s_cost = self._calc_cost_score(mat)

        total = (
            w.get("oxygen", 0.25) * s_o2 +
            w.get("moisture", 0.20) * s_wv +
            w.get("shelf_life", 0.15) * s_shelf +
            w.get("mechanical", 0.10) * s_mech +
            w.get("sealability", 0.10) * s_seal +
            w.get("sustainability", 0.10) * s_sust +
            w.get("cost", 0.10) * s_cost
        )

        return CompatibilityScore(
            total_score=round(min(100.0, max(0.0, total)), 2),
            oxygen_score=s_o2,
            moisture_score=s_wv,
            shelf_life_score=s_shelf,
            mechanical_score=s_mech,
            sealability_score=s_seal,
            sustainability_score=s_sust,
            cost_score=s_cost,
        )
