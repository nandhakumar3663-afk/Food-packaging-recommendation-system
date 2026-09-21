"""
Application configuration for the Smart Food Packaging Recommendation System.
Configures database paths, scoring weights, and domain rule parameters.
"""

from pathlib import Path

# Base paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATABASE_PATH = DATA_DIR / "packaging_system.db"
RULES_FILE = PROJECT_ROOT / "rules" / "packaging_rules.yaml"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

class Config:
    """Base application configuration."""
    PROJECT_ROOT = PROJECT_ROOT
    DATA_DIR = DATA_DIR
    SECRET_KEY = "smart-packaging-ai-dev-secret-key"
    DATABASE_URI = f"sqlite:///{DATABASE_PATH}"
    DATABASE_PATH = DATABASE_PATH
    RULES_FILE = RULES_FILE
    DEBUG = False
    TESTING = False

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


class TestingConfig(Config):
    """Testing configuration with in-memory or temporary database."""
    TESTING = True
    DATABASE_PATH = DATA_DIR / "test_packaging_system.db"
    DATABASE_URI = f"sqlite:///{DATA_DIR / 'test_packaging_system.db'}"
