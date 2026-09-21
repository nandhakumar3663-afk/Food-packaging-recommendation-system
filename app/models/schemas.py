"""
Data schemas and type definitions for food packaging entities and recommendations.
"""

from dataclasses import dataclass, asdict, field
from typing import Optional, List, Dict, Any


@dataclass
class FoodItem:
    """Food item domain model."""
    food_id: Optional[int] = None
    food_name: str = ""
    category: str = ""
    moisture: float = 0.0
    fat: float = 0.0
    ph: float = 7.0
    respiration_rate: str = "None"
    storage_temperature: float = 20.0
    storage_rh: float = 65.0
    target_shelf_life: int = 30
    oxygen_sensitivity: str = "Medium"
    moisture_sensitivity: str = "Medium"
    light_sensitivity: str = "Medium"
    source: str = "SYNTHETIC DEMONSTRATION DATA"
    source_url: Optional[str] = None
    notes: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class PackagingMaterial:
    """Packaging material domain model."""
    material_id: Optional[int] = None
    material_name: str = ""
    material_category: str = ""
    polymer_type: Optional[str] = None
    otr: float = 0.0
    otr_unit: str = "cc/(m²·day·atm)"
    otr_test_condition: str = "23°C, 50% RH"
    wvtr: float = 0.0
    wvtr_unit: str = "g/(m²·day)"
    wvtr_test_condition: str = "38°C, 90% RH"
    thickness: float = 25.0
    thickness_unit: str = "μm"
    oxygen_barrier: str = "Moderate"
    moisture_barrier: str = "Moderate"
    light_barrier: str = "Moderate"
    mechanical_strength: str = "Medium"
    sealability: str = "Moderate"
    recyclability: float = 50.0
    renewable_content: float = 0.0
    estimated_cost: float = 0.50
    source: str = "SYNTHETIC DEMONSTRATION DATA"
    source_url: Optional[str] = None
    notes: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class StorageCondition:
    """Storage environment parameters."""
    storage_id: Optional[int] = None
    temperature: float = 20.0
    humidity: float = 65.0
    storage_type: str = "Ambient"
    transport_condition: str = "Standard Ambient"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CompatibilityScore:
    """Detailed score breakdown for a packaging material candidate."""
    total_score: float = 0.0
    oxygen_score: float = 0.0
    moisture_score: float = 0.0
    shelf_life_score: float = 0.0
    mechanical_score: float = 0.0
    sealability_score: float = 0.0
    sustainability_score: float = 0.0
    cost_score: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RuleEvaluationResult:
    """Outcome of rule engine filtering and boundary verification."""
    is_compatible: bool = True
    triggered_rules: List[Dict[str, str]] = field(default_factory=list)
    disqualification_reasons: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    required_barrier_otr: Optional[float] = None
    required_barrier_wvtr: Optional[float] = None
    special_requirements: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RecommendationResult:
    """Single packaging recommendation option."""
    material: PackagingMaterial
    compatibility_score: CompatibilityScore
    recommendation_type: str = "Recommended Match"  # 'Recommended Match', 'Alternative Match', 'Lower-cost Alternative', 'Sustainability-oriented Alternative'
    reason: str = ""
    triggered_rules: List[Dict[str, str]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "material": self.material.to_dict(),
            "compatibility_score": self.compatibility_score.to_dict(),
            "recommendation_type": self.recommendation_type,
            "reason": self.reason,
            "triggered_rules": self.triggered_rules,
        }
