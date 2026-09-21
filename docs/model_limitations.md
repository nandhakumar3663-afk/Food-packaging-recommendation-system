# Model Limitations & Data Provenance Disclosures (Phase 4)

## 1. Transparency Statement
The Smart Food Packaging Recommendation System is designed as an educational, explainable decision-support tool. To maintain academic and technical integrity, the following limitations are explicitly documented and surfaced across the user interface.

---

## 2. Dataset Scope & Demonstration Status
1. **Synthetic Demonstration Data**:
   - The supervised machine learning models (Random Forest and XGBoost) are trained on a 144-sample dataset (`data/training_data.csv`) labeled as `SYNTHETIC DEMONSTRATION DATA`.
   - While the feature boundaries and target assignments are anchored to peer-reviewed packaging science rules (Robertson, 2012; Massey, 2003; USDA AH 66), the dataset is designed for **software pipeline and architecture verification**, not commercial packaging validation.
2. **Statistical Significance**:
   - High evaluation metrics (1.0000 Accuracy / F1) reflect high fidelity on rule-anchored synthetic archetypes. They must **not** be interpreted as experimentally validated real-world packaging predictions.

---

## 3. Project-Defined Compatibility Score vs. Laboratory Testing
- The compatibility score (0.0% – 100.0%) is a **project-defined multi-criteria heuristic**.
- It is **not** a probability of commercial success, nor a certified guarantee of food shelf life.
- Real-world food packaging design requires physical accelerated shelf-life testing (ASLT), headspace gas analysis, microbial challenge tests, and migration testing.

---

## 4. Hardware & Environmental Assumptions
- **CPU Execution**: Optimized for local CPU inference on AMD Ryzen 5 5500U. No GPU acceleration or deep learning models are used.
- **Constant Storage Conditions**: Calculations assume static warehousing conditions (constant temperature and relative humidity). In-transit thermal abuse, humidity cycling, or solar radiation spikes are not dynamically simulated.
- **Physical Barrier Uniformity**: Barrier parameters (OTR, WVTR) represent standard flat-sheet film values. Pinholing, flex cracking, seam creep, or seal channel micro-leaks are excluded from the current model scope.

---

## 5. Scope Limit Confirmations
The following features are intentionally out of scope for Phase 4:
- ❌ No IoT sensors (ESP32, DHT22, CO2 sensors).
- ❌ No real-time telemetry streaming (MQTT).
- ❌ No physical shelf-life kinetic differential equations.
- ❌ No PDF generation libraries.
- ❌ No deep neural networks (PyTorch / TensorFlow / CUDA).
