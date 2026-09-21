# Project Presentation Outline

**Smart Food Packaging Recommendation System**  
*Presentation Structure for Academic Review / SIH / Hackathon Demonstration*

---

## Slide 1: Problem Statement

**The Challenge:**
- Food packaging selection involves complex trade-offs between barrier protection, cost, sustainability, and storage logistics.
- Manual selection is error-prone, time-consuming, and lacks systematic multi-criteria evaluation.
- Small and medium food producers often lack access to packaging engineering expertise.

**Impact:**
- Improper packaging leads to food spoilage, economic losses, and environmental waste.
- The global food packaging market exceeds $350 billion, yet selection tools remain fragmented.

---

## Slide 2: Proposed Solution

**Smart Food Packaging Recommendation System:**
- AI-assisted decision-support platform combining domain rules, machine learning, and multi-attribute scoring.
- Recommends packaging materials based on food properties, storage conditions, cost, and sustainability.
- Includes real-time IoT storage monitoring with simulated sensor telemetry.

**Key Positioning:**
> "An AI-assisted decision-support platform for food packaging selection that combines domain rules, compatibility scoring, machine learning, cost and sustainability analysis, and simulated real-time storage monitoring."

---

## Slide 3: System Architecture

- **Web Interface** → Flask REST API → Recommendation Service
- **Hybrid AI**: Domain Rule Engine + CPU Machine Learning (Random Forest + XGBoost)
- **Multi-Attribute Scoring**: Barrier fit, shelf-life, mechanical, cost, sustainability
- **IoT Pipeline**: ESP32 firmware + telemetry simulator + storage drift evaluation
- **Database**: SQLite with 5 tables and full audit trail
- 100% CPU execution — no CUDA, no cloud infrastructure required

---

## Slide 4: AI Approach — Hybrid Architecture

1. **Rule Engine** (YAML-based, R001-R008): Vetoes unsafe material candidates based on food chemistry.
2. **Machine Learning** (Random Forest + XGBoost): Probabilistic ranking of remaining candidates using 10 engineered features.
3. **Rule Veto Guarantee**: ML predictions are always overridden by domain safety rules.
4. **Training Data**: 144 synthetic demonstration records (explicitly labeled).

> "The machine-learning model helps rank candidate materials using available training data. Domain safety rules always take precedence."

---

## Slide 5: Rule Engine — Domain Safety

- 8 declarative YAML rules covering:
  - R001: High-fat foods + oxygen sensitivity → require low OTR barrier
  - R004: Produce with high respiration → require gas-permeable packaging
  - R007: Acidic foods (pH < 4.5) → restrict bare unlined metal
- Rules are **deterministic** and **transparent** — users see exactly which rules triggered.
- Rule veto is **absolute**: no ML model can override a safety veto.

---

## Slide 6: Packaging Compatibility Scoring

- **Multi-attribute weighted score (0-100):**
  - Oxygen barrier fit (25%)
  - Moisture barrier fit (20%)
  - Shelf-life alignment (15%)
  - Mechanical strength (10%)
  - Sealability (10%)
  - Sustainability (10%)
  - Cost (10%)
- **Preference profiles** allow users to shift weights (Balanced / Cost Priority / Sustainability Priority).

---

## Slide 7: Cost Analysis

- Substrate benchmark rate ($/m²) from packaging literature.
- Unit package cost calculation (standard 0.05 m² pouch assumption).
- Cost tiers: Budget, Moderate, Premium, Specialty.
- **Transparency**: All cost figures are academic benchmarks, not commercial quotes.

---

## Slide 8: Sustainability Assessment

- **Project-Defined Sustainability Index** (0-100):
  - 40% Recyclability rate
  - 35% Bio-renewable content
  - 25% End-of-life recovery pathway score
- Clear disclaimer: This is NOT an ISO 14040/14044 certified LCA.
- Identifies sustainability-oriented alternatives alongside primary recommendation.

---

## Slide 9: IoT Storage Monitoring

- **ESP32 firmware** (C++) with DHT22 temperature/humidity and SCD30 CO₂ sensors.
- **Software simulator** for demonstration without physical hardware.
- Real-time telemetry ingestion via REST API.
- Storage condition evaluation: NORMAL → WATCH → WARNING.
- **Non-defamatory guardrails**: System never claims food is spoiled or unsafe.
- **Reassessment workflow**: New recommendation under changed conditions, original record immutable.

> **Important**: Physical hardware validation is pending. IoT pipeline validated using simulated sensor telemetry.

---

## Slide 10: Live Demonstration

1. Select food (Fresh Strawberries) → Enter properties
2. Run analysis → View recommendation with score
3. Examine "Why This Material" rationale
4. Review cost and sustainability breakdown
5. Open 16-section printable report
6. Open IoT monitor dashboard
7. Simulate normal telemetry → NORMAL status
8. Simulate temperature excursion → WARNING status
9. Trigger reassessment → New recommendation, original preserved

---

## Slide 11: Limitations & Honest Assessment

| Area | Limitation |
|---|---|
| ML Training Data | 144 synthetic demonstration records |
| Physical IoT | Hardware validation pending |
| Database | SQLite single-writer (not production-scale) |
| Scoring Weights | Project-defined, not experimentally calibrated |
| Cost Data | Literature benchmarks, not live market prices |
| Sustainability | Project heuristic, not certified ISO 14040 LCA |
| Rule Coverage | 8 rules; not exhaustive for all food types |

---

## Slide 12: Future Work

1. **Physical ESP32 deployment** with actual temperature, humidity, and CO₂ sensors.
2. **Real packaging datasets** from industry partnerships or published shelf-life studies.
3. **Laboratory validation** of compatibility scores against measured barrier performance.
4. **Larger ML training dataset** with real-world food-packaging outcome data.
5. **Controlled storage experiments** to calibrate scoring weights.
6. **Multi-user deployment** with PostgreSQL and authentication.
7. **Mobile-responsive PWA** for field use.

---

## Presentation Tips

- **Duration**: 10-15 minutes recommended.
- **Demo**: Run `python scripts/demo.py` for automated CLI demonstration.
- **Web Demo**: Start server with `python run.py`, open `http://127.0.0.1:5000`.
- **Key Differentiator**: Hybrid AI (rules + ML) with full explainability — no black-box decisions.
- **Defend honestly**: Acknowledge synthetic data and pending hardware validation when asked.
