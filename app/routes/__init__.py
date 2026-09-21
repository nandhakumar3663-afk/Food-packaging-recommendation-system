"""Routes package."""
from app.routes.main import bp as main_bp
from app.routes.analysis import bp as analysis_bp
from app.routes.recommendation import bp as recommendation_bp

__all__ = ["main_bp", "analysis_bp", "recommendation_bp"]
