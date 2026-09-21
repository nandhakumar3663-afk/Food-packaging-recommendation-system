"""
Analysis & Recommendation Execution Routes.
Handles packaging suitability analysis requests and preset lookups.
"""

from flask import Blueprint, jsonify, request, current_app
from app.services.recommendation_service import RecommendationService
from app.models.database import get_all_foods

bp = Blueprint("analysis", __name__, url_prefix="/api")


@bp.route("/analyze", methods=["POST"])
def analyze_food_packaging():
    """
    Primary recommendation endpoint.
    Accepts food and storage properties, validates input, applies rule engine filters,
    calculates compatibility scores, logs recommendation, and returns recommendations.
    """
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Request body must be valid application/json."
        }), 400

    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({
            "success": False,
            "error": "Request payload must be a JSON object."
        }), 400

    db_path = current_app.config.get("DATABASE_PATH")
    rules_path = current_app.config.get("RULES_FILE")

    service = RecommendationService(db_path=db_path, rules_path=rules_path)
    success, result, errors = service.analyze_and_recommend(payload)

    if not success:
        return jsonify({
            "success": False,
            "error": "Validation or processing error.",
            "errors": errors or []
        }), 400

    return jsonify(result), 200


@bp.route("/presets", methods=["GET"])
def get_presets():
    """Return available preset food commodities for quick testing."""
    db_path = current_app.config.get("DATABASE_PATH")
    foods = get_all_foods(db_path=db_path)
    return jsonify({
        "success": True,
        "count": len(foods),
        "presets": foods,
    }), 200
