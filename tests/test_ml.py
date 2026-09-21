"""
Unit & Integration Tests for Machine Learning Pipeline (Phase 4).
Tests dataset preparation, Random Forest training/inference, XGBoost comparison,
and hybrid rule-engine veto behavior.
Strictly CPU-only execution.
"""

import pytest
from pathlib import Path
import numpy as np
import pandas as pd

from ml.training.train_random_forest import encode_features, FEATURE_COLUMNS
from ml.inference.predictor import MLPredictor
from app.services.recommendation_service import RecommendationService

class TestMLPipeline:
    """Test suite for machine learning training and inference components."""

    @pytest.fixture
    def predictor(self):
        return MLPredictor()

    def test_feature_columns_and_encoding(self):
        sample_df = pd.DataFrame([{
            "moisture": 75.0,
            "fat": 5.0,
            "ph": 4.5,
            "respiration_rate": "High",
            "storage_temperature": 4.0,
            "storage_rh": 85.0,
            "target_shelf_life": 14,
            "oxygen_sensitivity": "Medium",
            "moisture_sensitivity": "High",
            "light_sensitivity": "Low",
        }])
        encoded = encode_features(sample_df)
        assert list(encoded.columns) == FEATURE_COLUMNS
        assert encoded["respiration_rate_encoded"].iloc[0] == 3
        assert encoded["oxygen_sensitivity_encoded"].iloc[0] == 2
        assert encoded["moisture_sensitivity_encoded"].iloc[0] == 3
        assert encoded["light_sensitivity_encoded"].iloc[0] == 1

    def test_predictor_singleton_initialization(self, predictor):
        assert predictor.model is not None
        assert predictor.label_encoder is not None
        assert predictor.feature_schema is not None
        assert len(predictor.label_encoder.classes_) > 5

    def test_inference_prediction_schema(self, predictor):
        food_sample = {
            "moisture": 1.5,
            "fat": 34.0,
            "ph": 6.2,
            "respiration_rate": "None",
            "storage_temperature": 22.0,
            "storage_rh": 50.0,
            "target_shelf_life": 120,
            "oxygen_sensitivity": "High",
            "moisture_sensitivity": "High",
            "light_sensitivity": "High",
        }
        res = predictor.predict(food_sample)
        assert res["model_name"] == "RandomForestClassifier"
        assert "top_predicted_material" in res
        assert 0.0 <= res["confidence"] <= 1.0
        assert isinstance(res["probabilities"], dict)
        assert res["training_data_status"] == "SYNTHETIC DEMONSTRATION DATA"

    def test_model_artifacts_exist(self):
        base_dir = Path(__file__).resolve().parent.parent
        artifacts_dir = base_dir / "ml" / "artifacts"
        assert (artifacts_dir / "random_forest_model.joblib").exists()
        assert (artifacts_dir / "xgboost_model.joblib").exists()
        assert (artifacts_dir / "label_encoder.joblib").exists()
        assert (artifacts_dir / "feature_schema.json").exists()
        assert (artifacts_dir / "model_metrics.json").exists()
        assert (artifacts_dir / "model_comparison.json").exists()

    def test_hybrid_rule_veto_produce_respiration(self):
        """
        Verify that domain rule R004 vetoes impermeable materials even if predicted,
        preventing anaerobic spoilage.
        """
        rec_service = RecommendationService()
        # High respiration produce
        payload = {
            "food_name": "Fresh Strawberries",
            "category": "Produce",
            "moisture": 91.0,
            "fat": 0.3,
            "ph": 3.5,
            "respiration_rate": "High",
            "target_shelf_life": 8,
            "storage_temperature": 2.0,
            "storage_rh": 90.0,
            "oxygen_sensitivity": "Low",
            "moisture_sensitivity": "Medium",
            "light_sensitivity": "Low",
        }
        success, response, errors = rec_service.analyze_and_recommend(payload)
        assert success is True
        assert errors is None
        
        # Candidate materials that are impermeable (like Glass or Alu foil) must be in disqualified
        rec = response["recommendations"]["recommended_match"]["material"]
        # The recommended match must not be zero-permeability glass or hermetic foil for respiring berries
        assert rec["otr"] > 0
        assert "ml_assessment" in response
        assert response["ml_assessment"]["model_name"] == "RandomForestClassifier"
