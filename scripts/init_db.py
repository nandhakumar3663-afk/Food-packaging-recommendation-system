#!/usr/bin/env python3
"""
Database initialization script for the Smart Food Packaging Recommendation System.
Creates schema (tables and indices) for SQLite (local) or PostgreSQL (production).
Keeps schema creation separate from reference-data seeding.
Use `--seed` flag to explicitly populate the initial food and packaging material catalogs.
"""

import sys
import argparse
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import Config
from app.models.database import init_database, get_db_connection


def main():
    parser = argparse.ArgumentParser(description="Initialize database schema and indices.")
    parser.add_argument("--seed", action="store_true", help="Explicitly seed reference data after schema initialization")
    args = parser.parse_args()

    if Config.IS_POSTGRES:
        # Mask credentials in log
        db_display = "PostgreSQL (Render Production)"
        print(f"Initializing {db_display} schema...")
        init_database()

        # Verify tables in PostgreSQL
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = [row["table_name"] for row in cursor.fetchall()]
            print("Database initialized successfully.")
            print(f"Created tables ({len(tables)}): {', '.join(tables)}")

            # Verify indices
            cursor.execute("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE schemaname = 'public' 
                ORDER BY indexname;
            """)
            indices = [row["indexname"] for row in cursor.fetchall()]
            print(f"Created indices ({len(indices)}): {', '.join(indices)}")

    else:
        db_path = Config.DATABASE_PATH
        print(f"Initializing SQLite database at: {db_path}")

        # Ensure parent directory exists
        db_path.parent.mkdir(parents=True, exist_ok=True)
        init_database(db_path)

        # Verify tables in SQLite
        with get_db_connection(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
            tables = [row["name"] for row in cursor.fetchall() if not row["name"].startswith("sqlite_")]
            print("Database initialized successfully.")
            print(f"Created tables ({len(tables)}): {', '.join(tables)}")

            # Verify indices
            cursor.execute("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name;")
            indices = [row["name"] for row in cursor.fetchall() if not row["name"].startswith("sqlite_")]
            print(f"Created indices ({len(indices)}): {', '.join(indices)}")

    if args.seed:
        print("\n--- Seeding reference data catalogs ---")
        from scripts.seed_data import seed_database
        seed_database()
        print("Reference data seeding complete.")


if __name__ == "__main__":
    main()
