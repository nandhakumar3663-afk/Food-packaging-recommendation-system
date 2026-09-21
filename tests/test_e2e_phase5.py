"""
End-to-End and Unit Test Suite for Phase 5:
Decision Intelligence, Cost, Sustainability, Reporting, and Data Quality.
"""

import json
from pathlib import Path
import pytest

from app import create_app
from app.services.cost_service import CostService
from app.services.sustainability_service import SustainabilityService
from app.services.provenance_service import ProvenanceService
from app.services.recommendation_service import RecommendationService
from scripts.audit_data import audit_database


@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    return app.test_client()


# ============================================================================
# 1. Cost Service Tests
# ============================================================================
def test_cost_service_standard():
    material = {"material_name": "BOPP Film", "estimated_cost": 0.20}
    res = CostService.analyze_cost(material)

    assert res["cost_per_sqm"] == 0.20
    assert pytest.approx(res["estimated_unit_package_cost"], 0.0001) == 0.0100  # 0.20 * 0.05
    assert "Budget" in res["cost_tier"]
    assert 0 <= res["cost_efficiency_score"] <= 100


def test_cost_service_tiers():
    budget_mat = {"estimated_cost": 0.20}
    mod_mat = {"estimated_cost": 0.50}
    prem_mat = {"estimated_cost": 0.90}

    assert "Budget" in CostService.get_cost_tier(budget_mat["estimated_cost"])
    assert "Moderate" in CostService.get_cost_tier(mod_mat["estimated_cost"])
    assert "Premium" in CostService.get_cost_tier(prem_mat["estimated_cost"])


def test_cost_service_missing():
    mat = {"estimated_cost": None}
    status = CostService.classify_cost_status(mat)
    assert status == "Unknown / Not Available"


# ============================================================================
# 2. Sustainability Service Tests
# ============================================================================
def test_sustainability_service_standard():
    mat = {
        "material_name": "Kraft Paper + Bio-PBS",
        "polymer_type": "Paper/PBS",
        "recyclability": 60.0,
        "renewable_content": 85.0,
    }
    res = SustainabilityService.evaluate_sustainability(mat)

    # 60 * 0.40 + 85 * 0.35 + 85 * 0.25 = 24 + 29.75 + 21.25 = 75.0
    assert 70.0 <= res["project_sustainability_index"] <= 80.0
    assert res["components"]["recyclability_rate"] == 60.0
    assert res["components"]["renewable_bio_content"] == 85.0
    assert "ISO 14040" in res["certification_disclaimer"]


def test_sustainability_service_mono_plastic():
    mat = {
        "material_name": "HDPE Film",
        "polymer_type": "HDPE",
        "recyclability": 90.0,
        "renewable_content": 0.0,
    }
    res = SustainabilityService.evaluate_sustainability(mat)
    assert res["project_sustainability_index"] > 50.0
    assert "Mechanical" in res["components"]["end_of_life_pathway"]


# ============================================================================
# 3. Provenance Service Tests
# ============================================================================
def test_provenance_service_literature():
    source_str = "Robertson, G. L. (2012) Food Packaging: Principles and Practice"
    tier = ProvenanceService.classify_source(source_str)
    assert tier == "LITERATURE-BACKED"


def test_provenance_service_synthetic():
    source_str = "SYNTHETIC DEMONSTRATION DATA (Benchmark)"
    tier = ProvenanceService.classify_source(source_str)
    assert tier == "SYNTHETIC DEMONSTRATION DATA"


# ============================================================================
# 4. Multi-Objective Preference Profiles & Consistency
# ============================================================================
def test_preference_profiles_execution(app):
    with app.app_context():
        service = RecommendationService()
        sample_input = {
            "food_name": "Potato Chips",
            "category": "Snack Foods",
            "moisture": 2.0,
            "fat": 35.0,
            "ph": 6.2,
            "respiration_rate": "None",
            "target_shelf_life": 120,
            "storage_temperature": 22.0,
            "storage_rh": 65.0,
            "storage_type": "Ambient",
            "transport_condition": "Standard Ambient",
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "light_sensitivity": "High",
        }

        # Run under all three profiles
        ok1, res_balanced, _ = service.analyze_and_recommend(dict(sample_input, preference_profile="balanced"))
        ok2, res_cost, _ = service.analyze_and_recommend(dict(sample_input, preference_profile="cost_priority"))
        ok3, res_sust, _ = service.analyze_and_recommend(dict(sample_input, preference_profile="sustainability_priority"))

        assert ok1 and ok2 and ok3
        assert res_balanced["recommendations"]["recommended_match"] is not None
        assert res_cost["recommendations"]["recommended_match"] is not None
        assert res_sust["recommendations"]["recommended_match"] is not None

        # Verify packaging requirements populated
        pkg_reqs = res_balanced["packaging_requirements"]
        assert "Strict gas barrier" in pkg_reqs["critical_o2_barrier_needed"]
        assert "Low WVTR" in pkg_reqs["critical_wvtr_barrier_needed"]

        # Verify profile comparison exists
        prof_comp = res_balanced["profile_comparison"]
        assert "balanced" in prof_comp
        assert "cost_priority" in prof_comp
        assert "sustainability_priority" in prof_comp


def test_recommendation_determinism(app):
    with app.app_context():
        service = RecommendationService()
        sample_input = {
            "food_name": "Fresh Strawberries",
            "category": "Produce",
            "moisture": 90.0,
            "fat": 0.5,
            "ph": 3.6,
            "respiration_rate": "High",
            "target_shelf_life": 10,
            "storage_temperature": 4.0,
            "storage_rh": 90.0,
            "storage_type": "Refrigerated",
            "transport_condition": "Cold Chain",
            "oxygen_sensitivity": "Medium",
            "moisture_sensitivity": "Medium",
            "light_sensitivity": "Low",
            "preference_profile": "balanced",
        }

        _, run1, _ = service.analyze_and_recommend(sample_input)
        _, run2, _ = service.analyze_and_recommend(sample_input)

        mat1 = run1["recommendations"]["recommended_match"]["material"]["material_name"]
        mat2 = run2["recommendations"]["recommended_match"]["material"]["material_name"]
        assert mat1 == mat2

        score1 = run1["recommendations"]["recommended_match"]["compatibility_score"]
        score2 = run2["recommendations"]["recommended_match"]["compatibility_score"]
        assert score1 == score2


# ============================================================================
# 5. API Analyze & History Round-Trip
# ============================================================================
def test_api_analyze_with_profile(client):
    payload = {
        "food_name": "Artisan Bread",
        "category": "Bakery",
        "moisture": 38.0,
        "fat": 3.0,
        "ph": 5.5,
        "respiration_rate": "None",
        "target_shelf_life": 7,
        "storage_temperature": 20.0,
        "storage_rh": 55.0,
        "storage_type": "Ambient",
        "transport_condition": "Standard Ambient",
        "oxygen_sensitivity": "Medium",
        "moisture_sensitivity": "High",
        "light_sensitivity": "Low",
        "preference_profile": "cost_priority",
    }

    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True

    # Check that packaging requirements and profile comparison exist
    assert "packaging_requirements" in data
    assert "profile_comparison" in data

    primary = data["recommendations"]["recommended_match"]
    assert "cost_analysis" in primary
    assert "sustainability_analysis" in primary
    assert "provenance" in primary

    rec_id = data["recommendation_id"]

    # Verify history round-trip
    hist_res = client.get(f"/api/history/{rec_id}")
    assert hist_res.status_code == 200
    hist_data = hist_res.get_json()
    assert hist_data["success"] is True
    assert hist_data["recommendation"]["food_name"] == "Artisan Bread"


# ============================================================================
# 6. Data Quality Audit Script
# ============================================================================
def test_audit_database_script():
    report = audit_database()
    assert report["status"] == "HEALTHY"
    assert report["total_anomalies"] == 0
    assert report["food_count"] >= 10
    assert report["material_count"] >= 12
    assert report["missing_otr_count"] == 0
    assert report["missing_wvtr_count"] == 0
    assert report["missing_cost_count"] == 0


# ============================================================================
# 7. Model Metadata JSON Artifact
# ============================================================================
def test_model_metadata_registry():
    meta_path = Path(__file__).resolve().parent.parent / "ml" / "artifacts" / "model_metadata.json"
    assert meta_path.exists()

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["model_name"] == "Smart Food Packaging Hybrid Classifier"
    assert meta["model_version"] == "1.0.0"
    assert "models" in meta
    assert "RandomForestClassifier" in meta["models"]["primary"]["name"]
    assert meta["hardware_environment"]["cuda_enabled"] is False
    assert len(meta["features"]) == 10
