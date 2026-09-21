"""
Phase 8 Finalization Tests.

Validates deployment readiness, health check expansion, configuration security,
setup script integrity, CPU-only compliance, and template rendering.
"""

import os
import sys
import subprocess
from pathlib import Path
from unittest import TestCase

# Ensure imports work
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.config import Config, TestingConfig, DevelopmentConfig, ProductionConfig


class TestHealthCheckExpanded(TestCase):
    """Verify the expanded /api/health endpoint reports all subsystems."""

    def setUp(self):
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()

    def test_health_returns_all_subsystems(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        # Must have all subsystem keys
        self.assertIn("status", data)
        self.assertIn("application", data)
        self.assertIn("database", data)
        self.assertIn("machine_learning", data)
        self.assertIn("iot_service", data)
        self.assertIn("hardware_profile", data)

    def test_health_hardware_no_cuda(self):
        resp = self.client.get("/api/health")
        data = resp.get_json()
        self.assertFalse(data["hardware_profile"]["cuda_present"])
        self.assertIn("No NVIDIA", data["hardware_profile"]["gpu"])

    def test_health_ml_artifacts_status(self):
        resp = self.client.get("/api/health")
        data = resp.get_json()
        ml = data["machine_learning"]
        self.assertIn("status", ml)
        self.assertFalse(ml["runtime_retraining"])

    def test_health_iot_hardware_disclaimer(self):
        resp = self.client.get("/api/health")
        data = resp.get_json()
        disclaimer = data["iot_service"]["hardware_validation"]
        self.assertIn("Physical hardware validation is pending", disclaimer)
        self.assertIn("simulated sensor telemetry", disclaimer)

    def test_health_phase8_version(self):
        resp = self.client.get("/api/health")
        data = resp.get_json()
        self.assertIn("Phase 8", data["phase"])


class TestConfigurationSecurity(TestCase):
    """Verify configuration supports env-based secrets and deployment configs."""

    def test_secret_key_overridable_via_env(self):
        """SECRET_KEY must be loadable from environment."""
        test_key = "test-override-secret-key-12345"
        os.environ["SECRET_KEY"] = test_key
        # Force reimport to pick up env
        import importlib
        import app.config as cfg_module
        importlib.reload(cfg_module)
        self.assertEqual(cfg_module.Config.SECRET_KEY, test_key)
        # Clean up
        del os.environ["SECRET_KEY"]
        importlib.reload(cfg_module)

    def test_production_config_exists(self):
        self.assertTrue(hasattr(ProductionConfig, 'DEBUG'))
        self.assertFalse(ProductionConfig.DEBUG)

    def test_development_config_debug_enabled(self):
        self.assertTrue(DevelopmentConfig.DEBUG)

    def test_testing_config_testing_flag(self):
        self.assertTrue(TestingConfig.TESTING)


class TestAPIVersionString(TestCase):
    """Verify the root API response reports Phase 8."""

    def setUp(self):
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()

    def test_root_json_mode_phase8(self):
        resp = self.client.get("/")
        data = resp.get_json()
        self.assertIn("Phase 8", data["mode"])

    def test_root_json_includes_iot_endpoints(self):
        resp = self.client.get("/")
        data = resp.get_json()
        endpoints = data["endpoints"]
        self.assertIn("/api/iot/readings", endpoints)
        self.assertIn("/api/iot/status", endpoints)

    def test_root_json_includes_monitor_page(self):
        resp = self.client.get("/")
        data = resp.get_json()
        pages = data["pages"]
        self.assertIn("/monitor", pages)


class TestAllPagesRender(TestCase):
    """Verify all template pages return HTTP 200."""

    def setUp(self):
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()

    def test_all_pages_render_200(self):
        pages = ["/home", "/analyze", "/results", "/compare", "/history", "/report", "/monitor"]
        for page in pages:
            with self.subTest(page=page):
                resp = self.client.get(page)
                self.assertEqual(resp.status_code, 200, f"{page} returned {resp.status_code}")


class TestCPUOnlyCompliance(TestCase):
    """Verify no CUDA/GPU dependencies exist."""

    def test_no_cuda_imports_in_source(self):
        """Scan all Python source files (excluding tests) for prohibited GPU imports."""
        project_root = Path(__file__).resolve().parent.parent
        prohibited = ["import torch", "import tensorflow", "import cuda", "from torch", "from tensorflow"]
        violations = []
        for py_file in project_root.rglob("*.py"):
            if ".venv" in str(py_file) or "__pycache__" in str(py_file):
                continue
            # Skip test files — they contain prohibited strings as test data
            if py_file.parent.name == "tests":
                continue
            content = py_file.read_text(errors="ignore")
            for pattern in prohibited:
                if pattern in content:
                    violations.append(f"{py_file.name}: contains '{pattern}'")
        self.assertEqual(violations, [], f"GPU imports found: {violations}")

    def test_requirements_no_gpu_packages(self):
        """Verify requirements.txt does not install GPU packages."""
        project_root = Path(__file__).resolve().parent.parent
        req_file = project_root / "requirements.txt"
        content = req_file.read_text()
        # Only check actual package lines (not comments)
        package_lines = [line.strip().lower() for line in content.splitlines()
                         if line.strip() and not line.strip().startswith("#")]
        gpu_packages = ["torch", "tensorflow", "nvidia-cuda", "cudnn"]
        for pkg in gpu_packages:
            for line in package_lines:
                self.assertFalse(
                    line.startswith(pkg),
                    f"GPU package '{pkg}' found in requirements.txt: {line}"
                )


class TestSetupScriptIntegrity(TestCase):
    """Verify setup.sh exists and has valid structure."""

    def test_setup_script_exists(self):
        project_root = Path(__file__).resolve().parent.parent
        setup_path = project_root / "scripts" / "setup.sh"
        self.assertTrue(setup_path.exists(), "scripts/setup.sh not found")

    def test_setup_script_is_executable(self):
        project_root = Path(__file__).resolve().parent.parent
        setup_path = project_root / "scripts" / "setup.sh"
        self.assertTrue(os.access(setup_path, os.X_OK), "scripts/setup.sh is not executable")

    def test_setup_script_has_no_cuda_install(self):
        """Verify setup script does not install CUDA or NVIDIA packages."""
        project_root = Path(__file__).resolve().parent.parent
        setup_path = project_root / "scripts" / "setup.sh"
        content = setup_path.read_text()
        # Check that no pip install of GPU packages exists
        self.assertNotIn("pip install cuda", content.lower())
        self.assertNotIn("pip install nvidia", content.lower())
        self.assertNotIn("pip install torch", content.lower())

    def test_setup_script_bash_syntax(self):
        """Verify setup.sh passes bash syntax check."""
        project_root = Path(__file__).resolve().parent.parent
        setup_path = project_root / "scripts" / "setup.sh"
        result = subprocess.run(
            ["bash", "-n", str(setup_path)],
            capture_output=True, text=True
        )
        self.assertEqual(result.returncode, 0, f"Bash syntax error: {result.stderr}")


class TestDocumentationCompleteness(TestCase):
    """Verify all required Phase 8 documentation files exist."""

    def test_required_docs_exist(self):
        project_root = Path(__file__).resolve().parent.parent
        required_docs = [
            "docs/final_architecture.md",
            "docs/evidence_matrix.md",
            "docs/presentation_outline.md",
            "docs/viva_questions.md",
            "docs/screenshots/README.md",
            "docs/project_status.md",
            "docs/final_demo.md",
            "docs/final_project_report.md",
            "docs/final_system_audit.md",
        ]
        for doc_path in required_docs:
            full_path = project_root / doc_path
            self.assertTrue(full_path.exists(), f"Missing documentation: {doc_path}")
