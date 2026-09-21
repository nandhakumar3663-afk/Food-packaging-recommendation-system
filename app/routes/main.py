"""
Main informational, health check, and frontend template page routes.
"""

from flask import Blueprint, jsonify, render_template, request

bp = Blueprint("main", __name__)


@bp.route("/", methods=["GET"])
def index():
    """
    Landing page for browsers; returns API status JSON for API clients
    to ensure 100% backward compatibility with test suites and REST clients.
    """
    accept = request.headers.get("Accept", "")
    # Check if a browser requesting HTML
    if "text/html" in accept and "application/json" not in accept:
        return render_template("index.html")

    # Default to JSON for API test clients and curl
    return jsonify({
        "success": True,
        "name": "Smart Food Packaging Recommendation System API",
        "version": "1.0.0",
        "status": "online",
        "mode": "Phase 3 - Frontend & Hybrid Rule/Scoring Engine (No ML / No CUDA)",
        "endpoints": [
            "/api/foods",
            "/api/materials",
            "/api/analyze",
            "/api/history",
            "/api/presets",
            "/api/health",
        ],
        "pages": [
            "/",
            "/home",
            "/analyze",
            "/results",
            "/compare",
            "/history",
            "/report",
        ]
    }), 200


@bp.route("/home", methods=["GET"])
def home_page():
    """Unconditionally renders the landing page HTML."""
    return render_template("index.html")


@bp.route("/analyze", methods=["GET"])
def analyze_page():
    """Interactive food properties and packaging analysis page."""
    return render_template("analyze.html")


@bp.route("/results", methods=["GET"])
def results_page():
    """Recommendation results dashboard."""
    return render_template("results.html")


@bp.route("/compare", methods=["GET"])
def compare_page():
    """Interactive packaging material comparison page."""
    return render_template("compare.html")


@bp.route("/history", methods=["GET"])
def history_page():
    """Historical recommendation analyses log page."""
    return render_template("history.html")


@bp.route("/report", methods=["GET"])
@bp.route("/report/<int:rec_id>", methods=["GET"])
def report_page(rec_id: int = None):
    """Clean, printable evaluation report."""
    return render_template("report.html", rec_id=rec_id)


@bp.route("/monitor", methods=["GET"])
def monitor_page():
    """Real-time IoT storage monitoring dashboard."""
    return render_template("monitor.html")


@bp.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "cpu_target": "AMD Ryzen 5 5500U",
        "cuda_present": False,
        "database": "SQLite",
    }), 200
