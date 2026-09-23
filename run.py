#!/usr/bin/env python3
"""
Server entry point for the Smart Food Packaging Recommendation System.
Phase 8 — Final Release. Runs the lightweight Flask application locally on CPU.

Environment Variables:
    FLASK_ENV   — "development", "production", or "testing" (default: development)
    FLASK_DEBUG — Set to "1" to enable debug mode
    HOST        — Server bind address (default 127.0.0.1)
    PORT        — Server bind port (default 5000)
    SECRET_KEY  — Flask session secret key
"""

import os
from app import create_app
from app.config import Config, DevelopmentConfig, ProductionConfig

# Select configuration based on environment
_config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": Config,
}
env = os.environ.get("FLASK_ENV", "development").lower()
config_class = _config_map.get(env, Config)

app = create_app(config_class)

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"

    print(f"╔══════════════════════════════════════════════════════════════╗")
    print(f"║  Smart Food Packaging Recommendation System                 ║")
    print(f"║  Phase 8 — Final Release                                    ║")
    print(f"║  Hardware: CPU Only (AMD Ryzen 5 5500U, No CUDA)            ║")
    url_str = f"http://{host}:{port}"
    print(f"║  Listening: {url_str:<46s}║")
    print(f"╚══════════════════════════════════════════════════════════════╝")

    app.run(host=host, port=port, debug=debug)

