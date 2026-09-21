#!/usr/bin/env python3
"""
Server entry point for the Smart Food Packaging Recommendation System.
Runs the lightweight Flask application locally on CPU.
"""

import os
from app import create_app
from app.config import Config

app = create_app(Config)

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"

    print(f"Starting Smart Food Packaging Recommendation System...")
    print(f"Hardware profile: CPU Only (AMD Ryzen 5 5500U, No CUDA)")
    print(f"Listening on: http://{host}:{port}")

    app.run(host=host, port=port, debug=debug)
