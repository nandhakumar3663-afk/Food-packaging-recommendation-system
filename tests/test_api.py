"""
Integration tests for Flask REST API endpoints and Recommendation Service.
"""

import pytest
from app import create_app
from app.config import TestingConfig
from app.models.database import init_database
from scripts.seed_data import seed_database


@pytest.fixture(scope="module")
def app_client(tmp_path_factory):
    """Create and configure a test Flask client with an isolated temporary SQLite database."""
    temp_dir = tmp_path_factory.mktemp("db")
    test_db = temp_dir / "test_api_packaging.db"

    class AppTestConfig(TestingConfig):
        DATABASE_PATH = test_db
        TESTING = True

    # Seed the test database
    seed_database(db_path=test_db)

    app = create_app(AppTestConfig)
    app.config["DATABASE_PATH"] = test_db

    with app.test_client() as client:
        yield client


class TestGeneralEndpoints:
    """Test landing and health check endpoints."""

    def test_index_status(self, app_client):
        resp = app_client.get("/")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "endpoints" in data

    def test_health_check(self, app_client):
        resp = app_client.get("/api/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] in ("healthy", "degraded")
        assert data["hardware_profile"]["cuda_present"] is False
        assert "application" in data
        assert "database" in data
        assert "machine_learning" in data
        assert "iot_service" in data


class TestResourceEndpoints:
    """Test food and packaging materials catalog endpoints."""

    def test_get_foods_success(self, app_client):
        resp = app_client.get("/api/foods")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["count"] >= 10
        assert len(data["foods"]) == data["count"]

    def test_get_food_by_id_valid(self, app_client):
        resp = app_client.get("/api/foods/1")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["food"]["food_id"] == 1

    def test_get_food_by_id_invalid(self, app_client):
        resp = app_client.get("/api/foods/99999")
        assert resp.status_code == 404
        data = resp.get_json()
        assert data["success"] is False
        assert "not found" in data["error"].lower()

    def test_get_materials_success(self, app_client):
        resp = app_client.get("/api/materials")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["count"] >= 12
        assert len(data["materials"]) == data["count"]

    def test_get_material_by_id_valid(self, app_client):
        resp = app_client.get("/api/materials/1")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["material"]["material_id"] == 1

    def test_get_material_by_id_invalid(self, app_client):
        resp = app_client.get("/api/materials/99999")
        assert resp.status_code == 404
        data = resp.get_json()
        assert data["success"] is False
        assert "not found" in data["error"].lower()

    def test_get_presets_success(self, app_client):
        resp = app_client.get("/api/presets")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "presets" in data


class TestAnalyzeEndpoint:
    """Test recommendation execution endpoint POST /api/analyze."""

    def test_analyze_with_full_valid_payload(self, app_client):
        payload = {
            "food_name": "Crisp Potato Chips",
            "category": "Snack Foods",
            "moisture": 1.5,
            "fat": 35.0,
            "ph": 6.2,
            "respiration_rate": "None",
            "target_shelf_life": 120,
            "storage_temperature": 22.0,
            "storage_rh": 50.0,
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "light_sensitivity": "High",
        }
        resp = app_client.post("/api/analyze", json=payload)
        assert resp.status_code == 200
        data = resp.get_json()

        assert data["success"] is True
        assert "recommendation_id" in data
        assert data["analysis"]["food"] == "Crisp Potato Chips"

        # Check 4 neutral options
        recs = data["recommendations"]
        assert "recommended_match" in recs
        assert "alternative_match" in recs
        assert "lower_cost_alternative" in recs
        assert "sustainability_oriented_alternative" in recs

        # Scores should be normalized
        rec_match = recs["recommended_match"]
        assert 0.0 <= rec_match["compatibility_score"] <= 100.0
        assert len(rec_match["reasons"]) > 0
        assert "triggered_rules" in rec_match

    def test_analyze_user_prompt_example_with_food_id(self, app_client):
        """Test the exact example payload provided by the user in prompt."""
        payload = {
            "food_id": 1,
            "moisture": 78,
            "fat": 0.1,
            "ph": 5.8,
            "respiration_rate": "HIGH",
            "target_shelf_life": 15,
            "storage_temperature": 5,
            "storage_rh": 85,
            "storage_type": "CHILLED",
            "transport_condition": "REFRIGERATED",
            "oxygen_sensitivity": "HIGH",
            "moisture_sensitivity": "HIGH",
            "light_sensitivity": "MEDIUM",
        }
        resp = app_client.post("/api/analyze", json=payload)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["recommendation_id"] > 0
        assert "recommended_match" in data["recommendations"]

    def test_analyze_missing_content_type(self, app_client):
        resp = app_client.post("/api/analyze", data="plain text data")
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "application/json" in data["error"]

    def test_analyze_invalid_boundary_values(self, app_client):
        payload = {
            "food_name": "Bad Food",
            "category": "Produce",
            "moisture": -10.0,  # Invalid
            "fat": 0.0,
            "ph": 16.0,         # Invalid
            "respiration_rate": "None",
            "target_shelf_life": 10,
            "storage_temperature": 20.0,
            "storage_rh": 60.0,
            "oxygen_sensitivity": "Low",
            "moisture_sensitivity": "Low",
            "light_sensitivity": "Low",
        }
        resp = app_client.post("/api/analyze", json=payload)
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert len(data["errors"]) >= 2
        assert any("Moisture" in e for e in data["errors"])
        assert any("pH" in e for e in data["errors"])

    def test_analyze_missing_required_fields(self, app_client):
        payload = {
            "food_name": "Incomplete Item"
            # Missing category, moisture, etc.
        }
        resp = app_client.post("/api/analyze", json=payload)
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert any("Missing required field" in e for e in data["errors"])


class TestHistoryEndpoints:
    """Test recommendation history retrieval endpoints."""

    def test_get_history_list(self, app_client):
        resp = app_client.get("/api/history")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "history" in data
        assert data["count"] >= 1  # From previous POST /api/analyze tests

    def test_get_history_with_limit(self, app_client):
        resp = app_client.get("/api/history?limit=1")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["limit"] == 1
        assert len(data["history"]) <= 1

    def test_get_history_item_valid(self, app_client):
        # Fetch list to obtain an existing rec_id
        list_resp = app_client.get("/api/history")
        history = list_resp.get_json()["history"]
        rec_id = history[0]["recommendation_id"]

        resp = app_client.get(f"/api/history/{rec_id}")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["recommendation"]["recommendation_id"] == rec_id
        assert "material_category" in data["recommendation"]

    def test_get_history_item_invalid(self, app_client):
        resp = app_client.get("/api/history/99999")
        assert resp.status_code == 404
        data = resp.get_json()
        assert data["success"] is False
        assert "not found" in data["error"].lower()


class TestFrontendPages:
    """Test frontend template page rendering."""

    def test_home_page(self, app_client):
        resp = app_client.get("/home")
        assert resp.status_code == 200
        html = resp.get_data(as_text=True)
        assert "SMART FOOD PACKAGING" in html
        assert "Start Analysis" in html

    def test_root_browser_accept(self, app_client):
        resp = app_client.get("/", headers={"Accept": "text/html,application/xhtml+xml"})
        assert resp.status_code == 200
        html = resp.get_data(as_text=True)
        assert "SMART FOOD PACKAGING" in html

    def test_analyze_page(self, app_client):
        resp = app_client.get("/analyze")
        assert resp.status_code == 200
        html = resp.get_data(as_text=True)
        assert "Food Packaging Analysis" in html
        assert "preset-select" in html

    def test_results_page(self, app_client):
        resp = app_client.get("/results")
        assert resp.status_code == 200
        html = resp.get_data(as_text=True)
        assert "Recommendation Results" in html

    def test_compare_page(self, app_client):
        resp = app_client.get("/compare")
        assert resp.status_code == 200
        html = resp.get_data(as_text=True)
        assert "Materials Catalog Matrix" in html

    def test_history_page(self, app_client):
        resp = app_client.get("/history")
        assert resp.status_code == 200
        html = resp.get_data(as_text=True)
        assert "Recommendation History" in html

    def test_report_page(self, app_client):
        resp = app_client.get("/report")
        assert resp.status_code == 200
        html = resp.get_data(as_text=True)
        assert "SMART FOOD PACKAGING REPORT" in html

    def test_report_page_with_id(self, app_client):
        resp = app_client.get("/report/1")
        assert resp.status_code == 200
        html = resp.get_data(as_text=True)
        assert "SMART FOOD PACKAGING REPORT" in html
