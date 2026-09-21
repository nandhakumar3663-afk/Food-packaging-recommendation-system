#!/usr/bin/env python3
"""
Database initialization script for the Smart Food Packaging Recommendation System.
Creates the SQLite database file, tables, and indices.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import Config
from app.models.database import init_database, get_db_connection


def main():
    db_path = Config.DATABASE_PATH
    print(f"Initializing SQLite database at: {db_path}")

    # Ensure parent directory exists
    db_path.parent.mkdir(parents=True, exist_ok=True)

    init_database(db_path)

    # Verify tables
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = [row["name"] for row in cursor.fetchall() if not row["name"].startswith("sqlite_")]
        print(f"Database initialized successfully.")
        print(f"Created tables ({len(tables)}): {', '.join(tables)}")

        # Verify indices
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name;")
        indices = [row["name"] for row in cursor.fetchall() if not row["name"].startswith("sqlite_")]
        print(f"Created indices ({len(indices)}): {', '.join(indices)}")


if __name__ == "__main__":
    main()
