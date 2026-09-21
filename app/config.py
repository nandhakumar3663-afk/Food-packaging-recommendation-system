"""
Application configuration for the Smart Food Packaging Recommendation System.
Configures database paths, scoring weights, and domain rule parameters.

Environment Variables (optional, for deployment):
    SECRET_KEY          — Flask session secret (defaults to dev key if unset)
    DATABASE_PATH       — Absolute path to SQLite database file
    HOST                — Server bind address (default 127.0.0.1)
    PORT                — Server bind port (default 5000)
    FLASK_DEBUG         — Set to "1" to enable debug mode
"""

import os
from pathlib import Path

# Base paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
_DEFAULT_DB = DATA_DIR / "packaging_system.db"
DATABASE_PATH = Path(os.environ.get("DATABASE_PATH", str(_DEFAULT_DB)))
RULES_FILE = PROJECT_ROOT / "rules" / "packaging_rules.yaml"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)


class Config:
    """Base application configuration."""
    PROJECT_ROOT = PROJECT_ROOT
    DATA_DIR = DATA_DIR
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart-packaging-dev-key-change-in-production")
    DATABASE_URI = f"sqlite:///{DATABASE_PATH}"
    DATABASE_PATH = DATABASE_PATH
    RULES_FILE = RULES_FILE
    DEBUG = False
    TESTING = False

    # Server binding
    HOST = os.environ.get("HOST", "127.0.0.1")
    PORT = int(os.environ.get("PORT", 5000))

    # Default project-defined compatibility scoring weights (must sum to 1.0)
    SCORING_WEIGHTS = {
        "oxygen": 0.25,
        "moisture": 0.20,
        "shelf_life": 0.15,
        "mechanical": 0.10,
        "sealability": 0.10,
        "sustainability": 0.10,
        "cost": 0.10,
    }

    # Cost-oriented profile weights
    SCORING_WEIGHTS_COST_PRIORITY = {
        "oxygen": 0.20,
        "moisture": 0.15,
        "shelf_life": 0.10,
        "mechanical": 0.10,
        "sealability": 0.10,
        "sustainability": 0.05,
        "cost": 0.30,
    }

    # Sustainability-oriented profile weights
    SCORING_WEIGHTS_SUSTAINABILITY_PRIORITY = {
        "oxygen": 0.20,
        "moisture": 0.15,
        "shelf_life": 0.10,
        "mechanical": 0.10,
        "sealability": 0.10,
        "sustainability": 0.30,
        "cost": 0.05,
    }

    # IoT Storage Monitoring Configuration
    IOT_OFFLINE_THRESHOLD_SECONDS = 60
    IOT_MAX_QUERY_LIMIT = 100
    IOT_RETENTION_DAYS = 30
    IOT_MAX_RECORDS_PER_DEVICE = 5000


class DevelopmentConfig(Config):
    """Development configuration with debug enabled."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration — DEBUG disabled, secrets required from env."""
    DEBUG = False

    @classmethod
    def init_app(cls):
        """Validate that critical production settings are configured."""
        if cls.SECRET_KEY == "smart-packaging-dev-key-change-in-production":
            import warnings
            warnings.warn(
                "SECRET_KEY is using the default development value. "
                "Set the SECRET_KEY environment variable for production.",
                stacklevel=2,
            )


class TestingConfig(Config):
    """Testing configuration with in-memory or temporary database."""
    TESTING = True
    DATABASE_PATH = DATA_DIR / "test_packaging_system.db"
    DATABASE_URI = f"sqlite:///{DATA_DIR / 'test_packaging_system.db'}"
