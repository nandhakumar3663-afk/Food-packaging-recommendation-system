"""
Application factory for the Smart Food Packaging Recommendation System.
"""

import logging
from flask import Flask, jsonify
from app.config import Config


def create_app(config_class=Config) -> Flask:
    """Flask application factory."""
    app = Flask(
        __name__,
        template_folder=str(Config.PROJECT_ROOT / "templates"),
        static_folder=str(Config.PROJECT_ROOT / "static"),
    )
    app.config.from_object(config_class)

    # Configure structured logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # Register Blueprints
    from app.routes.main import bp as main_bp
    from app.routes.analysis import bp as analysis_bp
    from app.routes.recommendation import bp as recommendation_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(recommendation_bp)

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

    return app
