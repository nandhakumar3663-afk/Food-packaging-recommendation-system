# Model Limitations & Operational Scope Disclosures (Phase 5)

## 1. Transparency Statement
The Smart Food Packaging Recommendation System is designed as an educational, explainable decision-support and engineering architecture tool. To maintain academic and technical integrity, the following limitations are explicitly documented and surfaced across the user interface and generated reports.

---

## 2. Dataset Scope & Demonstration Status
1. **Synthetic Demonstration ML Dataset**:
   - The supervised machine learning models (Random Forest and XGBoost) are trained on a 144-sample dataset (`ml/data/food_packaging_dataset.csv`) labeled as `SYNTHETIC DEMONSTRATION DATA`.
   - While the feature boundaries and target assignments are anchored to peer-reviewed packaging science rules (Robertson, 2012; Massey, 2003; USDA AH 66), the dataset is designed for **software pipeline and architecture verification**, not commercial packaging validation.
2. **Statistical Significance**:
   - High evaluation metrics (1.0000 Accuracy / F1) reflect high fidelity on rule-anchored synthetic archetypes. They must **not** be interpreted as experimentally validated real-world packaging predictions.

---

## 3. Project-Defined Heuristics vs. Empirical Testing
1. **Project-Defined Compatibility Score**:
   - The compatibility score (0.0% – 100.0%) is a **project-defined multi-criteria heuristic**.
   - It is **not** a laboratory shelf-life guarantee.
2. **Project-Defined Sustainability Index**:
   - Sourced as $(0.40 \times \text{Recyclability}) + (0.35 \times \text{Renewable Content}) + (0.25 \times \text{End-of-Life Score})$.
   - This is **not** an ISO 14040/14044 certified Life Cycle Assessment (LCA) or certified carbon footprint.
3. **Academic Cost Benchmarks**:
   - Material unit costs ($0.05 \text{ m}^2$ standard pouch) are calculated from academic literature rates and do **not** represent commercial price quotes from converters.

---

## 4. Hardware & Environmental Assumptions
- **CPU Execution**: Optimized strictly for local CPU execution on AMD Ryzen 5 5500U (8 GB RAM). No GPU acceleration, CUDA, or deep learning libraries (PyTorch/TensorFlow) are used.
- **Static Storage Assumption**: Calculations assume static warehousing conditions (constant temperature and relative humidity). In-transit thermal abuse, humidity cycling, or solar radiation spikes are not dynamically modeled.
- **Physical Barrier Uniformity**: Barrier parameters (OTR, WVTR) represent standard flat-sheet film values. Pinholing, flex cracking, seam creep, or seal channel micro-leaks are excluded from the current model scope.

---

## 5. Scope Limit Confirmations
The following features are intentionally out of scope:
- ❌ No IoT sensors (ESP32, DHT22, CO2 sensors).
- ❌ No real-time telemetry streaming (MQTT).
- ❌ No physical shelf-life kinetic differential equations.
- ❌ No third-party PDF compilation binaries (uses standard browser CSS print-to-PDF).
- ❌ No deep neural networks (PyTorch / TensorFlow / CUDA).
