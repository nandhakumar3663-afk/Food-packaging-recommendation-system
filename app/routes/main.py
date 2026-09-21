"""
Main informational and health check routes.
"""

from flask import Blueprint, jsonify

bp = Blueprint("main", __name__)


@bp.route("/", methods=["GET"])
def index():
    """Application welcome and status endpoint."""
    return jsonify({
        "success": True,
        "name": "Smart Food Packaging Recommendation System API",
        "version": "1.0.0",
        "status": "online",
        "mode": "Phase 2 - CPU Hybrid Engine (No ML / No CUDA)",
        "endpoints": [
            "/api/foods",
            "/api/materials",
            "/api/analyze",
            "/api/history",
            "/api/presets",
            "/api/health",
        ]
    }), 200


@bp.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "cpu_target": "AMD Ryzen 5 5500U",
        "cuda_present": False,
        "database": "SQLite",
    }), 200
