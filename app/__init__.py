"""
Application factory for the Smart Food Packaging Recommendation System.
Phase 8 — Final Release.
"""

import logging
import os
from flask import Flask, jsonify, request
from app.config import Config


def _configure_logging(app: Flask):
    """Configure structured application logging.

    Logs API errors, IoT ingestion events, database errors, model loading,
    and important system events. Never logs passwords, secrets, or credentials.
    """
    log_level = logging.DEBUG if app.debug else logging.INFO
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)

    # Application logger
    app.logger.setLevel(log_level)
    # Remove default handlers to avoid duplicates
    app.logger.handlers.clear()
    app.logger.addHandler(console_handler)

    # Configure module-level loggers
    for module_name in ["app.routes", "app.services", "app.models", "ml.inference"]:
        module_logger = logging.getLogger(module_name)
        module_logger.setLevel(log_level)
        if not module_logger.handlers:
            module_logger.addHandler(console_handler)


def create_app(config_class=Config) -> Flask:
    """Flask application factory."""
    app = Flask(
        __name__,
        template_folder=str(Config.PROJECT_ROOT / "templates"),
        static_folder=str(Config.PROJECT_ROOT / "static"),
    )
    app.config.from_object(config_class)

    # CORS support for React dev server and production
    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin") or "*"
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    # Configure structured logging
    _configure_logging(app)
    app.logger.info("Smart Food Packaging Recommendation System starting...")
    app.logger.info("Hardware profile: CPU-Only (No CUDA / No NVIDIA)")

    # Register Blueprints
    from app.routes.main import bp as main_bp
    from app.routes.analysis import bp as analysis_bp
    from app.routes.recommendation import bp as recommendation_bp
    from app.routes.iot import bp as iot_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(recommendation_bp)
    app.register_blueprint(iot_bp)

    # Centralized JSON Error Handling
    @app.errorhandler(400)
    def bad_request_error(error):
        return jsonify({
            "success": False,
            "error": getattr(error, "description", "Bad Request"),
        }), 400

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "success": False,
            "error": getattr(error, "description", "The requested resource was not found."),
        }), 404

    @app.errorhandler(405)
    def method_not_allowed_error(error):
        return jsonify({
            "success": False,
            "error": getattr(error, "description", "HTTP method not allowed for this endpoint."),
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f"Internal Server Error: {error}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An internal server error occurred.",
        }), 500

    app.logger.info("Application factory initialization complete.")
    return app

