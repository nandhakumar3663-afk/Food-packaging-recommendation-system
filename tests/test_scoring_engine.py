"""
Unit tests for the project-defined compatibility scoring engine.
"""

import pytest
from app.services.scoring_engine import ScoringEngine
from app.config import Config


@pytest.fixture
def scoring_engine():
    return ScoringEngine()


@pytest.fixture
def test_material():
    return {
        "material_name": "EVOH Barrier Film",
        "otr": 3.5,
        "wvtr": 4.0,
        "oxygen_barrier": "Excellent",
        "moisture_barrier": "Good",
        "mechanical_strength": "High",
        "sealability": "Good",
        "recyclability": 30.0,
        "renewable_content": 0.0,
        "estimated_cost": 0.85,
    }


@pytest.fixture
def test_food():
    return {
        "food_name": "Roasted Coffee Beans",
        "oxygen_sensitivity": "High",
        "moisture_sensitivity": "High",
        "target_shelf_life": 270,
    }


def test_score_range_and_subscores(scoring_engine, test_material, test_food):
    """Verify that all scores are normalized within [0.0, 100.0]."""
    score = scoring_engine.calculate_compatibility(test_material, test_food)

    assert 0.0 <= score.total_score <= 100.0
    assert 0.0 <= score.oxygen_score <= 100.0
    assert 0.0 <= score.moisture_score <= 100.0
    assert 0.0 <= score.shelf_life_score <= 100.0
    assert 0.0 <= score.mechanical_score <= 100.0
    assert 0.0 <= score.sealability_score <= 100.0
    assert 0.0 <= score.sustainability_score <= 100.0
    assert 0.0 <= score.cost_score <= 100.0

    # EVOH has excellent oxygen barrier for high sensitivity food -> oxygen score should be very high
    assert score.oxygen_score >= 90.0


def test_custom_profile_cost_priority(scoring_engine, test_material, test_food):
    """Verify that shifting to cost priority profile modifies the total compatibility score."""
    default_score = scoring_engine.calculate_compatibility(test_material, test_food)
    cost_score = scoring_engine.calculate_compatibility(
        test_material, test_food, custom_weights=Config.SCORING_WEIGHTS_COST_PRIORITY
    )

    # Since EVOH is moderately expensive ($0.85), increasing cost weight should decrease total score
    assert cost_score.total_score < default_score.total_score


def test_sustainability_score_calculation():
    """Verify weighted calculation of sustainability score."""
    eco_material = {
        "recyclability": 80.0,
        "renewable_content": 100.0,
        "estimated_cost": 0.50,
        "otr": 100.0,
        "wvtr": 20.0,
        "oxygen_barrier": "Moderate",
        "moisture_barrier": "Moderate",
        "mechanical_strength": "Medium",
        "sealability": "Moderate",
    }
    food = {"oxygen_sensitivity": "Medium", "moisture_sensitivity": "Medium", "target_shelf_life": 30}
    engine = ScoringEngine()
    score = engine.calculate_compatibility(eco_material, food)

    # (0.6 * 80) + (0.4 * 100) = 48 + 40 = 88.0
    assert score.sustainability_score == 88.0
