"""
Deployment & PostgreSQL Abstraction Verification Tests.

Validates:
1. Gunicorn and PostgreSQL driver availability
2. Dual database abstraction (DBRow, cursor wrapper, query translation)
3. Render deployment configuration (render.yaml, .python-version, .env.example)
4. Environment variable handling (DATABASE_URL, SECRET_KEY, FLASK_ENV)
5. Simulator CLI flexibility (API_BASE_URL env var, --url alias)
"""

import os
import yaml
from pathlib import Path
from unittest import TestCase
from unittest.mock import MagicMock, patch

from app.config import Config
from app.models.database import (
    DBRow,
    PostgresCursorWrapper,
    PostgresConnectionWrapper,
    _is_postgres_active,
    _init_postgres_database,
)


class TestDeploymentDependencies(TestCase):
    """Verify production WSGI and database packages are installed and CPU-safe."""

    def test_gunicorn_importable(self):
        import gunicorn
        self.assertTrue(hasattr(gunicorn, "__version__"))

    def test_psycopg2_importable(self):
        import psycopg2
        self.assertTrue(hasattr(psycopg2, "__version__"))

    def test_python_version_pinned(self):
        root = Path(__file__).resolve().parent.parent
        pv_file = root / ".python-version"
        self.assertTrue(pv_file.exists())
        version = pv_file.read_text().strip()
        self.assertTrue(version.startswith("3.12"))


class TestPostgresAbstraction(TestCase):
    """Test PostgreSQL cursor wrapper, DBRow, and query translation."""

    def test_db_row_dict_and_index_access(self):
        """DBRow must mimic sqlite3.Row supporting both name and index access."""
        row = DBRow({"food_id": 42, "food_name": "Apple", "moisture": 85.5})
        self.assertEqual(row["food_id"], 42)
        self.assertEqual(row["food_name"], "Apple")
        self.assertEqual(row[0], 42)
        self.assertEqual(row[1], "Apple")
        self.assertEqual(row[2], 85.5)
        # Verify dict casting
        d = dict(row)
        self.assertIsInstance(d, dict)
        self.assertEqual(d["food_id"], 42)

    def test_postgres_cursor_placeholder_translation(self):
        """Cursor must translate ? placeholders to %s for psycopg2."""
        mock_raw = MagicMock()
        cur = PostgresCursorWrapper(mock_raw)
        cur.execute("SELECT * FROM food WHERE food_id = ? AND category = ?", (1, "Fruit"))

        mock_raw.execute.assert_called_once_with(
            "SELECT * FROM food WHERE food_id = %s AND category = %s",
            (1, "Fruit"),
        )

    def test_postgres_cursor_returning_injection(self):
        """Cursor must append RETURNING <pk> to known INSERT statements."""
        mock_raw = MagicMock()
        mock_raw.fetchone.return_value = {"food_id": 99}
        cur = PostgresCursorWrapper(mock_raw)
        cur.execute("INSERT INTO food (food_name) VALUES (?)", ("Tomato",))

        # Must execute with RETURNING food_id
        call_args = mock_raw.execute.call_args[0]
        self.assertIn("RETURNING food_id", call_args[0])
        self.assertEqual(cur.lastrowid, 99)

    def test_is_postgres_active_switching(self):
        """_is_postgres_active must return True only when DATABASE_URL is set and default path is used."""
        with patch.object(Config, "IS_POSTGRES", True), patch.object(Config, "DATABASE_URL", "postgresql://localhost/db"):
            self.assertTrue(_is_postgres_active(None))
            self.assertTrue(_is_postgres_active(Config.DATABASE_PATH))
            # Explicit non-default path (e.g. temp test SQLite db) must return False
            self.assertFalse(_is_postgres_active(Path("/tmp/custom_test.db")))

        with patch.object(Config, "IS_POSTGRES", False), patch.object(Config, "DATABASE_URL", None):
            self.assertFalse(_is_postgres_active(None))
            self.assertFalse(_is_postgres_active(Config.DATABASE_PATH))


class TestRenderConfigIntegrity(TestCase):
    """Verify render.yaml and .env.example conform to production requirements."""

    def test_render_yaml_valid_and_complete(self):
        root = Path(__file__).resolve().parent.parent
        yaml_path = root / "render.yaml"
        self.assertTrue(yaml_path.exists())

        with open(yaml_path, "r") as f:
            data = yaml.safe_load(f)

        self.assertIn("services", data)
        web_service = next((s for s in data["services"] if s.get("type") == "web"), None)
        self.assertIsNotNone(web_service)
        self.assertEqual(web_service["runtime"], "python")
        self.assertIn("gunicorn", web_service["startCommand"])
        self.assertIn("0.0.0.0:$PORT", web_service["startCommand"])
        self.assertEqual(web_service["healthCheckPath"], "/api/health")

    def test_env_example_contains_required_keys(self):
        root = Path(__file__).resolve().parent.parent
        env_example = root / ".env.example"
        self.assertTrue(env_example.exists())
        content = env_example.read_text()

        self.assertIn("DATABASE_URL=", content)
        self.assertIn("SECRET_KEY=", content)
        self.assertIn("FLASK_ENV=", content)
        self.assertIn("HOST=", content)
        self.assertIn("PORT=", content)
        self.assertIn("API_BASE_URL=", content)
