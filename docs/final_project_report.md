# Final Project Report & Capstone Architecture
**Smart Food Packaging Recommendation System**  
*Lead Architect & Senior Python/ML Engineer Report*  
*Hardware Execution Environment: AMD Ryzen 5 5500U, 8 GB RAM, Integrated Radeon Graphics (CPU-Only, Zero CUDA)*

---

## 1. Project Objective

The primary objective of the **Smart Food Packaging Recommendation System** is to provide an explainable, multi-attribute packaging decision intelligence platform that pairs food commodities with optimal packaging materials. The system accounts for food barrier chemistry (OTR, WVTR, light transmission), food physiological traits (moisture, lipid oxidation, acidity, respiration rate), logistics (temperature, relative humidity, shelf life), economic affordability, and sustainability circularity.

Additionally, the system bridges the gap between pre-packaging material selection and post-packaging logistics through real-time IoT warehousing storage monitoring, detecting cold-chain excursions and facilitating auditable condition reassessment.

---

## 2. System Architecture

The architecture is layered into discrete, decoupled tiers running locally on lightweight hardware:

```
[ Web Browser UI / Vanilla ES6 ] <---> [ Flask REST API (4 Blueprints) ]
                                                |
        +---------------------------------------+---------------------------------------+
        |                                       |                                       |
[ Domain Rule Engine ]                 [ CPU ML Predictor ]                   [ Storage Monitor ]
(YAML Boundary Filters)               (Random Forest / XGBoost)              (IoT Telemetry & Drift)
        |                                       |                                       |
        +-------------------+-------------------+---------------------------------------+
                            |
             [ Multi-Attribute Scoring Engine ]
             (Barrier, Cost, Sustainability Fit)
                            |
                [ SQLite Database Layer ]
     (food, packaging_material, storage, recommendation, iot_readings)
                            ^
                            |
           [ ESP32 Firmware / CLI Simulator ]
```

---

## 3. Database Schema & Persistence

The relational database is implemented using standard SQLite with foreign keys and performance indices:
- **`food`**: Stores baseline physiological parameters (moisture, fat, pH, respiration, sensitivities).
- **`packaging_material`**: Barrier metrics (OTR, WVTR, thickness), mechanical strength, sealability, recyclability, renewable content, and literature citations.
- **`storage`**: Environmental storage requirements and log records.
- **`recommendation`**: Historical recommendation runs with JSON `input_snapshot` ensuring exact deterministic replay and auditability.
- **`iot_readings`**: Sensor telemetry (temperature, humidity, CO₂, status, provenance tag) with automatic retention pruning (30 days or 5,000 records per device).

---

## 4. Rule Engine (Safety Guardrails)

The Rule Engine operates declaratively via `rules/packaging_rules.yaml` (Rules R001–R008). It evaluates candidate materials prior to final ranking and enforces deterministic food safety vetoes:
- **R001**: High-fat / high-oxygen-sensitive commodities require strict oxygen barrier (OTR $\le 20\text{ cc}/(\text{m}^2\cdot\text{day}\cdot\text{atm})$).
- **R004**: High-respiration produce requires gas-permeable films to prevent anaerobic fermentation and packaging collapse.
- **R007**: Acidic foods ($\text{pH} < 4.5$) restrict unlined bare aluminum to prevent acid corrosion and metallic leaching.

---

## 5. Compatibility Scoring Engine

The scoring engine calculates normalized 0–100 compatibility scores based on multi-criteria weighting:
$$\text{Score} = (w_o \times S_{\text{OTR}}) + (w_m \times S_{\text{WVTR}}) + (w_s \times S_{\text{shelf}}) + (w_m \times S_{\text{mech}}) + (w_e \times S_{\text{seal}}) + (w_{\text{sust}} \times S_{\text{sust}}) + (w_c \times S_{\text{cost}})$$

Users can steer recommendations using three distinct preference profiles:
- **Balanced Performance**: Even distribution across all criteria.
- **Cost Priority**: Weights economic affordability at 30% while maintaining safety barrier baselines.
- **Sustainability Priority**: Weights circularity and bio-renewable feedstock at 30%.

---

## 6. Machine Learning Pipeline & Explainability

- **Model Selection**: Scikit-Learn `RandomForestClassifier` (100 estimators) and XGBoost CPU (`tree_method="hist"`).
- **Feature Engineering**: 10 aligned dimensions (moisture, fat, pH, respiration rate encoded, storage temperature, storage RH, target shelf life, oxygen/moisture/light sensitivities encoded).
- **Hybrid Veto Guarantee**: Domain rules override and veto any ML prediction that violates physiological safety.
- **Explainability**: Every recommendation outputs natural language selection reasons citing specific OTR, WVTR, and bio-content metrics.
- **No Runtime Retraining**: Static model artifacts loaded once; inference latency is under 20 ms on CPU.

---

## 7. Cost Analysis

- **Benchmark Pricing**: Evaluates substrate raw material prices ($/m²).
- **Unit Pouch Conversion**: Calculates single package cost for a standard $0.05\text{ m}^2$ consumer pouch.
- **Commercial Tiers**: Budget ($<\$0.35/\text{m}^2$), Moderate ($\$0.35\text{–}\$0.80/\text{m}^2$), and Premium ($>\$0.80/\text{m}^2$).
- **Non-Quote Disclosure**: Explicitly discloses that pricing represents flat-sheet literature estimates and not negotiated vendor quotes.

---

## 8. Sustainability Analysis

- **Project-Defined Sustainability Index**: Composite circularity heuristic:
  $$\text{Index} = (0.40 \times \text{Recyclability}) + (0.35 \times \text{Renewable Content}) + (0.25 \times \text{End-of-Life Score})$$
- **End-of-Life Pathways**: Incorporates mechanical polyolefin recycling, closed-loop glass recovery, carton hydrapulping, and industrial composting (ASTM D6400).
- **Non-LCA Disclaimer**: Clearly clarifies that the score is a project heuristic and does not substitute for an ISO 14040/14044 Life Cycle Assessment.

---

## 9. Web Application & Light-Green UI/UX

- **Design Philosophy**: Eco-friendly light-green color scheme using clean CSS variables and responsive flexbox/grid layouts.
- **Progressive Disclosure**: A 4-step wizard answering: *What do I enter? What did the system find? Why?*
- **Views**:
  - `/`: System overview, feature cards, and architecture pillars.
  - `/analyze`: Input wizard with presets and preference profile cards.
  - `/results`: 10-tier hierarchy with hero card, barrier comparisons, and profile matrix.
  - `/compare`: Side-by-side modal comparison across 2–4 packaging candidates.
  - `/history`: Historical query log with search and profile badges.
  - `/report`: 16-section professional printable audit report with CSS print styles.
  - `/monitor`: Real-time storage telemetry dashboard with vector SVG trend lines.

---

## 10. IoT Storage Monitoring

- **Telemetry Ingestion**: Microcontroller packets ingested via `POST /api/iot/readings`.
- **Condition State Machine**:
  - **NORMAL**: $|\Delta T| \le 2.0^\circ\text{C}$ and $|\Delta RH| \le 8.0\%$.
  - **WATCH**: $2.0^\circ\text{C} < |\Delta T| \le 5.0^\circ\text{C}$ or $8.0\% < |\Delta RH| \le 15.0\%$.
  - **WARNING**: $|\Delta T| > 5.0^\circ\text{C}$, $|\Delta RH| > 15.0\%$, or cold-chain thermal abuse.
  - **UNKNOWN**: Unassociated readings or missing sensor fields.
- **Offline Detection**: Devices silent for $> 60\text{ seconds}$ trigger an amber `OFFLINE` banner.
- **Uninstalled Sensor Handling**: Absent CO₂ sensors transmit `"co2": null`, cleanly rendered as *"Sensor Unavailable / Not Installed"* without dummy fabrication.

---

## 11. Reassessment Workflow & Immutability

When environmental conditions drift into `WATCH` or `WARNING`:
1. The user triggers **"Reassess Conditions"** on `/monitor`.
2. Observed ambient temperature/RH is submitted back to `/api/analyze`.
3. The hybrid pipeline evaluates whether alternative packaging materials are needed.
4. A **distinct, new recommendation record** is written to SQLite.
5. The **original recommendation record remains strictly immutable**, preserving an uncompromised regulatory audit trail.

---

## 12. Data Provenance & Governance

All data items are tagged with clear provenance classifications:
- **`LITERATURE-BACKED`**: Peer-reviewed citations (Robertson 2012, Massey 2003, Rhim 2007, USDA).
- **`SYNTHETIC DEMONSTRATION DATA`**: Benchmark demonstration food records and ML training dataset.
- **`SENSOR OBSERVATION`**: Telemetry from physical hardware microcontrollers.
- **`SIMULATED SENSOR DATA`**: Telemetry generated by local software test simulators.

---

## 13. Testing & Quality Assurance

- **Test Suite**: 98 automated unit, integration, and security tests running via pytest.
- **Execution Time**: ~4.0 seconds on AMD Ryzen 5 5500U.
- **Coverage**: Input validation, database CRUD, YAML rules, scoring normalization, ML inference, preference profiles, IoT ingestion, offline transitions, retention pruning, API boundaries, security controls, and reassessment immutability.

---

## 14. Hardware Validation Status

- **Firmware Status**: Production-style C++ ESP32 firmware (`iot/esp32/smart_packaging_esp32.ino`) with ring-buffer caching and non-blocking timers is fully implemented.
- **Bench Status**: `Physical hardware validation pending.` Bench testing with live ESP32 DevKit is scheduled upon physical USB/Wi-Fi connection.
- **Software Validation**: Fully validated using the local CLI simulator (`scripts/simulate_iot.py`) and automated test suite.

---

## 15. System Performance Benchmarks

Measured on AMD Ryzen 5 5500U (8 GB RAM):
- **ML Inference Latency**: ~18.3 ms (Random Forest 100 trees on CPU).
- **IoT Telemetry Ingestion**: ~7.3 ms per packet.
- **Database Query Latency**: < 1.5 ms.
- **Memory Footprint**: < 140 MB total resident RAM for Flask + ML models + IoT service.

---

## 16. Known System Limitations

1. Packaging costs are based on raw polymer substrate rates and do not reflect volume supplier discounts, custom printing, or lamination tooling.
2. The Sustainability Index is a project-defined heuristic and not an accredited ISO 14040/14044 Life Cycle Assessment.
3. The ML models are trained on synthetic demonstration scenarios and require industrial empirical calibration before commercial packaging line deployment.
4. Physical ESP32 bench testing is pending hardware attachment.

---

## 17. Scientific Boundaries & Non-Defamation Policy

The system adheres to strict scientific integrity guidelines:
- **No Unsubstantiated Spoilage Claims**: Condition notifications report observed environmental deviations (e.g., *"Storage condition requires review — observed temperature deviates from baseline by +7.8°C"*).
- The system **never** claims *"Food is spoiled"* or *"Food has become unsafe"* without physical laboratory microbiological assays.
- Compatibility scores represent computational estimates based on barrier physics, not clinical shelf-life guarantees.

---

## 18. Future Work

- Bench testing with live ESP32 hardware and calibrated NDIR CO₂ sensors.
- Integration of Arrhenius temperature-dependent microbial shelf-life kinetic equations.
- Expansion of the packaging catalog to include novel emerging nano-cellulose and mycelium biodegradable packaging materials.
- Automated generation of downloadable PDF audit certificates.
