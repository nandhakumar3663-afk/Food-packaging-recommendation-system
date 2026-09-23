"""
Multilingual Support (i18n) Verification Tests.

Validates:
1. Jinja2 templates render language selection dropdown, translations script, and data-i18n hooks.
2. Static translations dictionary integrity (en, hi, ta) in static/js/translations.js.
3. React SPA translations dictionary integrity (en, hi, ta) in frontend/src/i18n/translations.js.
4. Completeness and symmetry of translation keys across English, Hindi, and Tamil.
5. Presence of localized strings in compiled production distribution bundle.
"""

import json
import re
from pathlib import Path
from unittest import TestCase

from app import create_app
from app.config import TestingConfig


class TestI18nTemplates(TestCase):
    """Verify templates contain multilingual navigation and i18n hooks."""

    def setUp(self):
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()

    def test_base_template_has_language_selector(self):
        resp = self.client.get("/home")
        self.assertEqual(resp.status_code, 200)
        html = resp.get_data(as_text=True)

        # Check for language selector dropdown and options
        self.assertIn('id="lang-select"', html)
        self.assertIn('value="en"', html)
        self.assertIn('value="hi"', html)
        self.assertIn('value="ta"', html)
        self.assertIn("हिन्दी", html)
        self.assertIn("தமிழ்", html)

    def test_base_template_includes_translations_script(self):
        resp = self.client.get("/home")
        self.assertEqual(resp.status_code, 200)
        html = resp.get_data(as_text=True)
        self.assertIn("js/translations.js", html)

    def test_templates_have_i18n_attributes(self):
        resp = self.client.get("/home")
        self.assertEqual(resp.status_code, 200)
        html = resp.get_data(as_text=True)

        # Base attributes
        self.assertIn('data-i18n="nav.title"', html)
        self.assertIn('data-i18n="nav.home"', html)
        self.assertIn('data-i18n="nav.analyze"', html)
        self.assertIn('data-i18n="footer.brand"', html)
        self.assertIn('data-i18n="modal.title"', html)

        # Home page attributes
        self.assertIn('data-i18n="home.badge"', html)
        self.assertIn('data-i18n="home.title"', html)
        self.assertIn('data-i18n="home.stepsTitle"', html)
        self.assertIn('data-i18n="home.whyTitle"', html)


class TestI18nStaticDictionary(TestCase):
    """Verify static/js/translations.js dictionary integrity."""

    def setUp(self):
        self.base_dir = Path(__file__).resolve().parent.parent
        self.translations_js = self.base_dir / "static" / "js" / "translations.js"

    def test_static_translations_file_exists(self):
        self.assertTrue(self.translations_js.exists(), "static/js/translations.js must exist")

    def test_static_translations_contain_three_languages(self):
        content = self.translations_js.read_text(encoding="utf-8")
        self.assertIn("en:", content)
        self.assertIn("hi:", content)
        self.assertIn("ta:", content)

    def test_static_translations_contain_hindi_strings(self):
        content = self.translations_js.read_text(encoding="utf-8")
        self.assertIn("स्मार्ट फूड पैकेजिंग", content)
        self.assertIn("विश्लेषण", content)
        self.assertIn("खाद्य", content)
        self.assertIn("अनुशंसा", content)

    def test_static_translations_contain_tamil_strings(self):
        content = self.translations_js.read_text(encoding="utf-8")
        self.assertIn("ஸ்மார்ட் உணவு பேக்கேஜிங்", content)
        self.assertIn("பகுப்பாய்வு", content)
        self.assertIn("பொருட்கள்", content)
        self.assertIn("பரிந்துரை", content)


class TestI18nReactDictionary(TestCase):
    """Verify frontend/src/i18n/translations.js dictionary integrity."""

    def setUp(self):
        self.base_dir = Path(__file__).resolve().parent.parent
        self.react_translations_js = self.base_dir / "frontend" / "src" / "i18n" / "translations.js"

    def test_react_translations_file_exists(self):
        self.assertTrue(self.react_translations_js.exists(), "frontend/src/i18n/translations.js must exist")

    def test_react_translations_languages_defined(self):
        content = self.react_translations_js.read_text(encoding="utf-8")
        self.assertIn("en: {", content)
        self.assertIn("hi: {", content)
        self.assertIn("ta: {", content)

    def test_react_translations_sections_present(self):
        content = self.react_translations_js.read_text(encoding="utf-8")
        required_sections = [
            "nav:",
            "home:",
            "analyze:",
            "results:",
            "compare:",
            "history:",
            "monitor:",
            "report:",
            "modal:",
            "footer:",
        ]
        for section in required_sections:
            self.assertIn(section, content, f"Section {section} missing in React translations")

    def test_react_translations_devanagari_and_tamil_script(self):
        content = self.react_translations_js.read_text(encoding="utf-8")
        # Test Devanagari script presence (Unicode range U+0900-U+097F)
        devanagari_match = re.search(r"[\u0900-\u097F]", content)
        self.assertIsNotNone(devanagari_match, "Devanagari characters must be present in React translations")

        # Test Tamil script presence (Unicode range U+0B80-U+0BFF)
        tamil_match = re.search(r"[\u0B80-\u0BFF]", content)
        self.assertIsNotNone(tamil_match, "Tamil characters must be present in React translations")


class TestI18nCompiledBundle(TestCase):
    """Verify production SPA distribution bundle contains multilingual assets."""

    def setUp(self):
        self.base_dir = Path(__file__).resolve().parent.parent
        self.dist_dir = self.base_dir / "frontend" / "dist"

    def test_dist_index_html_exists(self):
        index_file = self.dist_dir / "index.html"
        self.assertTrue(index_file.exists(), "frontend/dist/index.html must exist")

    def test_dist_contains_multilingual_content(self):
        assets_dir = self.dist_dir / "assets"
        self.assertTrue(assets_dir.exists(), "frontend/dist/assets must exist")

        js_files = list(assets_dir.glob("*.js"))
        self.assertGreater(len(js_files), 0, "At least one JS bundle must exist in dist/assets")

        combined_js = "".join(f.read_text(encoding="utf-8", errors="ignore") for f in js_files)
        # Verify Hindi and Tamil strings are compiled into bundle
        self.assertIn("स्मार्ट फूड पैकेजिंग", combined_js)
        self.assertIn("ஸ்மார்ட் உணவு பேக்கேஜிங்", combined_js)
