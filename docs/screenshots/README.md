# Project Screenshots — Capture Checklist

**Smart Food Packaging Recommendation System — Phase 8**

This directory is reserved for project screenshots used in documentation and presentations.

---

## Recommended Screenshots

Capture the following screenshots from the running application at `http://127.0.0.1:5000`:

| # | Screenshot | URL / Action | Filename |
|:---:|:---|:---|:---|
| 1 | Home page | `/home` | `01_home.png` |
| 2 | Analysis wizard — Step 1 (Food) | `/analyze` → Step 1 | `02_analyze_step1.png` |
| 3 | Analysis wizard — Step 4 (Review) | `/analyze` → Step 4 | `03_analyze_step4.png` |
| 4 | Loading modal during analysis | Click "Generate Recommendation" | `04_loading_modal.png` |
| 5 | Results — Hero recommendation | `/results` (after analysis) | `05_results_hero.png` |
| 6 | Results — Why this recommendation | `/results` scroll down | `06_results_why.png` |
| 7 | Results — Cost & Sustainability | `/results` scroll down | `07_results_cost_sust.png` |
| 8 | Material comparison | `/compare` | `08_compare.png` |
| 9 | Recommendation history | `/history` | `09_history.png` |
| 10 | Printable report | `/report?id=1` | `10_report.png` |
| 11 | IoT monitor — Normal state | `/monitor` (after normal simulation) | `11_monitor_normal.png` |
| 12 | IoT monitor — Warning state | `/monitor` (after warning simulation) | `12_monitor_warning.png` |

---

## How to Capture

1. Start the Flask server: `python run.py`
2. Open `http://127.0.0.1:5000` in your browser.
3. Run an analysis (use Fresh Strawberries preset).
4. In a separate terminal, simulate IoT telemetry:
   ```bash
   python scripts/simulate_iot.py --mode normal --count 5
   python scripts/simulate_iot.py --mode warning --count 3
   ```
5. Use browser's screenshot tool or OS screenshot utility.
6. Save screenshots to this directory with the recommended filenames.

---

## Notes

- Screenshots are not auto-generated; they must be captured manually from the running application.
- Use a browser window width of approximately 1280px for consistent screenshots.
- Ensure the light-green theme is visible in all screenshots.
