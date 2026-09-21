"""
Recommendation & Resource Routes.
Handles food catalog, packaging materials, and historical recommendation lookups.
"""

from flask import Blueprint, jsonify, request, current_app
from app.models.database import (
    get_all_foods,
    get_food_by_id,
    get_all_materials,
    get_material_by_id,
    get_recommendation_history,
    get_recommendation_by_id,
)

bp = Blueprint("recommendation", __name__, url_prefix="/api")


@bp.route("/foods", methods=["GET"])
def list_foods():
    """Retrieve all food commodities in database."""
    db_path = current_app.config.get("DATABASE_PATH")
    foods = get_all_foods(db_path=db_path)
    return jsonify({
        "success": True,
        "count": len(foods),
        "foods": foods,
    }), 200


@bp.route("/foods/<int:food_id>", methods=["GET"])
def get_food(food_id: int):
    """Retrieve a single food commodity by ID."""
    db_path = current_app.config.get("DATABASE_PATH")
    food = get_food_by_id(food_id, db_path=db_path)
    if not food:
        return jsonify({
            "success": False,
            "error": f"Food commodity with ID {food_id} not found."
        }), 404
    return jsonify({
        "success": True,
        "food": food,
    }), 200


@bp.route("/materials", methods=["GET"])
def list_materials():
    """Retrieve all packaging materials in database."""
    db_path = current_app.config.get("DATABASE_PATH")
    materials = get_all_materials(db_path=db_path)
    return jsonify({
        "success": True,
        "count": len(materials),
        "materials": materials,
    }), 200


@bp.route("/materials/<int:material_id>", methods=["GET"])
def get_material(material_id: int):
    """Retrieve a single packaging material by ID."""
    db_path = current_app.config.get("DATABASE_PATH")
    material = get_material_by_id(material_id, db_path=db_path)
    if not material:
        return jsonify({
            "success": False,
            "error": f"Packaging material with ID {material_id} not found."
        }), 404
    return jsonify({
        "success": True,
        "material": material,
    }), 200


@bp.route("/history", methods=["GET"])
def list_history():
    """Retrieve past recommendation analyses with optional limit parameter."""
    db_path = current_app.config.get("DATABASE_PATH")
    try:
        limit = int(request.args.get("limit", 20))
        # Prevent excessive memory consumption
        limit = max(1, min(limit, 100))
    except (ValueError, TypeError):
        limit = 20

    history = get_recommendation_history(limit=limit, db_path=db_path)
    return jsonify({
        "success": True,
        "count": len(history),
        "limit": limit,
        "history": history,
    }), 200


@bp.route("/history/<int:rec_id>", methods=["GET"])
def get_history_item(rec_id: int):
    """Retrieve details of a single past recommendation."""
    db_path = current_app.config.get("DATABASE_PATH")
    item = get_recommendation_by_id(rec_id, db_path=db_path)
    if not item:
        return jsonify({
            "success": False,
            "error": f"Recommendation record with ID {rec_id} not found."
        }), 404
    return jsonify({
        "success": True,
        "recommendation": item,
    }), 200
