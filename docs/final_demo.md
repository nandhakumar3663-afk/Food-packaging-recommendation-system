# End-to-End System Demonstration Guide
**Smart Food Packaging Recommendation System — Phase 8 (Final Release)**  
*Target Environment: AMD Ryzen 5 5500U, 8 GB RAM, CPU-Only Execution*  
*Physical hardware validation is pending. IoT pipeline validated using simulated sensor telemetry.*

This document outlines the step-by-step walkthrough for evaluating the complete packaging intelligence and real-time IoT storage monitoring pipeline. It can be conducted either interactively via the Web UI (`http://127.0.0.1:5000`) or automatically via the CLI demonstration script (`python scripts/demo.py`).

---

## Demonstration Script Quick-Start

To run the automated 8-stage demonstration directly from the command line:

```bash
# 1. Activate Python virtual environment
source .venv/bin/activate

# 2. Execute automated demonstration
python scripts/demo.py
```

The script runs all 8 stages, prints structured summaries, validates responses, and asserts record immutability.

---

## Interactive Web UI Walkthrough (15 Steps)

### Step 1: Select Food Commodity
1. Open your browser and navigate to `http://127.0.0.1:5000/analyze`.
2. In the preset dropdown, select **Fresh Strawberries** (or enter: Category: *Produce*, Moisture: *90.5%*, Fat: *0.3%*, pH: *3.6*).
3. Observe the inline units and scientific parameter ranges.

### Step 2: Enter Storage Logistics & Sensitivities
1. Set Respiration Rate to **High** (triggers Rule R004 requiring gas permeability).
2. Set Storage Temperature to **4.0°C** and Relative Humidity to **90.0%**.
3. Set Target Shelf Life to **14 days**.
4. Set Oxygen, Moisture, and Light Sensitivity to **High**.

### Step 3: Select Preference Profile & Run Recommendation
1. Under Step 4 ("Preference Profile"), select **Balanced Performance** (evaluates barrier, shelf-life, cost, and circularity evenly).
2. Click **"Generate Packaging Recommendation"**.
3. Observe the animated progress modal demonstrating the deterministic hybrid pipeline (Rules $\rightarrow$ ML $\rightarrow$ Scoring).

### Step 4: Inspect Primary Packaging Recommendation
1. On `/results`, observe the **Hero Recommendation Card**:
   - Primary Recommended Material: **Aseptic Paperboard Composite (Tetra-style Carton)** or high-barrier perforated composite.
   - Compatibility Score: Normalized 0–100 score reflecting barrier protection, mechanical resilience, and shelf-life fit.
   - Categorized Options: *Alternative Match*, *Lower-Cost Alternative*, and *Sustainability-Oriented Alternative*.

### Step 5: Examine Selection Rationale & Rule Veto Safeguards
1. Read the **"Why This Material Was Selected"** card:
   - Specific barrier parameters (OTR, WVTR) and bio-renewable content cited.
2. Expand the **"Domain Rule Evaluation"** panel:
   - Verify that Rule R004 (Produce Respiration) passed, while bare unlined aluminum was prevented for acidic commodities (Rule R007).

### Step 6: Review Unit Cost & Sustainability Index
1. Inspect the **Economic Cost Analysis Card**:
   - Substrate benchmark price ($0.70/m²).
   - Single unit pouch conversion ($0.0350 for a standard 0.05 m² package).
   - Non-commercial quote transparency note.
2. Inspect the **Project-Defined Sustainability Index Card**:
   - Composite circularity rating (69.8 / 100).
   - Breakdown of mechanical recycling (65%), renewable bio-content (75%), and industrial hydrapulping recovery pathway.
   - Explicit non-LCA disclosure.

### Step 7: Open 16-Section Printable Audit Report
1. Click **"Print / Export Report"** or navigate to `http://127.0.0.1:5000/report?id=X`.
2. Observe all 16 technical sections, including barrier physics, multi-profile comparison matrix, model metadata, and Section 16 (IoT Storage Telemetry).

### Step 8: Associate an IoT Storage Node
1. Navigate to `http://127.0.0.1:5000/monitor`.
2. Notice the active storage node indicator (`ESP32_DEMO_NODE_01`) linked to Recommendation #X.

### Step 9: Ingest Normal Baseline Telemetry
1. In a terminal, send a normal baseline telemetry packet:
   ```bash
   python scripts/simulate_iot.py --mode normal --interval 2 --count 5
   ```
   *(Data is stamped with provenance `"source": "SIMULATED SENSOR DATA"`)*.

### Step 10: Verify NORMAL Condition State
1. Observe the `/monitor` dashboard:
   - Status Badge displays **`NORMAL`** (green).
   - Temperature gauge: ~4.2°C ($\Delta T = +0.2^\circ\text{C}$, within $\pm 2.0^\circ\text{C}$ tolerance).
   - Reason Statement: *"Observed temperature aligns closely with analysis condition."*

### Step 11: Ingest Elevated Temperature Excursion
1. In the terminal, simulate an active cold-chain failure:
   ```bash
   python scripts/simulate_iot.py --mode warning --interval 2 --count 5
   ```

### Step 12: Verify WARNING Condition State
1. Refresh or observe live polling on `/monitor`:
   - Status Badge immediately updates to **`WARNING`** (red).
   - Temperature gauge: 11.8°C ($\Delta T = +7.8^\circ\text{C}$, exceeding $\pm 5.0^\circ\text{C}$ warning ceiling).

### Step 13: Review Objective Non-Defamation Advisory
1. Notice the system notification:
   > *"Storage condition requires review. Environmental parameters have shifted beyond the envelope assumed during initial packaging analysis."*
2. Confirm the scientific guardrail: the system **never** claims *"Food is spoiled"* or *"Food has become unsafe"* without physical laboratory microbiological verification.

### Step 14: Trigger Explicit Reassessment Workflow
1. Click the blue button: **"Reassess Conditions"**.
2. The system loads the observed ambient conditions (11.8°C, 91.0% RH) into a new analysis payload while keeping `source_analysis_id` linked.
3. The hybrid engine re-evaluates candidate materials for the elevated temperature.

### Step 15: Verify New Recommendation & Immutability Proof
1. A **new recommendation record** (`#Y`) is generated and displayed on `/results`.
2. Navigate back to `/history`:
   - Original Recommendation `#X` remains intact with its original 4.0°C baseline and score.
   - Reassessed Recommendation `#Y` is logged as a separate historical event.
   - **Zero silent mutation occurs.** Full regulatory traceability is preserved.
