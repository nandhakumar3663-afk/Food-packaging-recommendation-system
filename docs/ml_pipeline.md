# Machine Learning Pipeline Documentation (Phase 4)

## 1. Overview & Hardware Architecture
The Smart Food Packaging Recommendation System integrates a lightweight machine learning pipeline designed exclusively for CPU execution on **AMD Ryzen 5 5500U** (6 Cores / 12 Threads, 8 GB RAM, Integrated Radeon Graphics).

**Hard Constraints Verified**:
- **Strictly CPU-Only**: No CUDA, cuDNN, PyTorch, TensorFlow GPU, or NVIDIA runtime packages.
- **Zero Retraining at Server Startup**: Models are trained offline via reproducible batch scripts. The Flask application loads serialized artifacts (`.joblib` and `.json`) into memory on startup for sub-millisecond inference (< 1 ms latency).

---

## 2. Dataset Pipeline & Provenance
Because real-world physical packaging shelf-life datasets covering multi-layer polymers, bio-nanocomposites, and aseptic laminates are not publicly available in standardized multi-class tabular formats, a controlled demonstration dataset was generated:
- **Location**: `data/training_data.csv` and `data/training_data.json`
- **Total Records**: 144 balanced food packaging scenarios across 8 major food categories.
- **Provenance Tag**: `SYNTHETIC DEMONSTRATION DATA`
- **Ground Truth Grounding**: Label assignments adhere to peer-reviewed food packaging literature:
  - *Robertson, G. L. (2012). Food Packaging: Principles and Practice (3rd ed.). CRC Press.*
  - *Massey, L. K. (2003). Permeability Properties of Plastics and Elastomers (2nd ed.). Plastics Design Library.*
  - *Rhim, J. W. et al. (2006). Bio-nanocomposites for food packaging applications.*
  - *USDA Agricultural Handbook 66 (Hardenburg et al., 1986).*

---

## 3. Feature Engineering Schema
The model uses 10 numerical and ordinally encoded features matching the input parameters:

| Feature Name | Type | Permissible Range / Encodings | Domain Description |
| :--- | :--- | :--- | :--- |
| `moisture` | float | 0.0 – 100.0% | Water content of the food item |
| `fat` | float | 0.0 – 100.0% | Lipid content (fat + moisture $\le$ 100%) |
| `ph` | float | 1.0 – 14.0 | Acidity level |
| `respiration_rate_encoded` | int | None=0, Low=1, Moderate=2, High=3, Very High=4 | Gas exchange rate of fresh produce |
| `storage_temperature` | float | -30.0 to 60.0 °C | Warehousing / distribution temperature |
| `storage_rh` | float | 10.0 – 100.0% | Relative humidity of surrounding air |
| `target_shelf_life` | float | 1 to 1000 days | Desired storage duration |
| `oxygen_sensitivity_encoded` | int | Low=1, Medium=2, High=3 | Susceptibility to oxidation |
| `moisture_sensitivity_encoded`| int | Low=1, Medium=2, High=3 | Susceptibility to humidity/drying |
| `light_sensitivity_encoded` | int | Low=1, Medium=2, High=3 | Susceptibility to photo-oxidation |

---

## 4. Models & Hyperparameters

### Primary Model: Random Forest (scikit-learn)
- **Classifier**: `RandomForestClassifier`
- **Hyperparameters**:
  - `n_estimators`: 100
  - `max_depth`: 10
  - `random_state`: 42
  - `n_jobs`: -1 (Parallelized across all 12 CPU threads)
- **Training Time**: ~0.35 seconds on AMD Ryzen 5 5500U.
- **Artifact File**: `ml/artifacts/random_forest_model.joblib` (410 KB)

### Comparison Model: XGBoost (CPU Mode)
- **Engine**: `xgboost.XGBClassifier`
- **CPU Configuration**:
  - `tree_method`: `"hist"` (Optimized CPU histogram binning)
  - `n_estimators`: 100
  - `max_depth`: 6
  - `learning_rate`: 0.1
  - `random_state`: 42
  - `n_jobs`: -1
- **Training Time**: ~0.70 seconds.
- **Artifact File**: `ml/artifacts/xgboost_model.joblib` (841 KB)

---

## 5. Evaluation & Comparison Metrics

Evaluated on a 20% stratified test split ($N = 29$ test samples, $N = 115$ training samples):

| Metric | Random Forest (Default) | XGBoost (Benchmark) |
| :--- | :--- | :--- |
| **Accuracy** | 1.0000 | 1.0000 |
| **Macro Precision** | 1.0000 | 1.0000 |
| **Weighted Precision** | 1.0000 | 1.0000 |
| **Macro Recall** | 1.0000 | 1.0000 |
| **Weighted Recall** | 1.0000 | 1.0000 |
| **Macro F1-Score** | 1.0000 | 1.0000 |
| **Weighted F1-Score** | 1.0000 | 1.0000 |
| **Inference Latency** | < 0.8 ms | < 1.2 ms |

> [!NOTE]
> High metric scores reflect execution on the structured, rule-anchored demonstration dataset. They confirm software and pipeline consistency, not physical laboratory shelf-life validation.

---

## 6. Hybrid AI Architecture & Rule Engine Veto
The system couples machine learning with deterministic safety rules in a strict hierarchy:

```
USER INPUT
    ↓
VALIDATION LAYER (Domain Boundary Checking)
    ↓
FOOD PROFILE
    ↓
RULE ENGINE (Evaluates R001–R008 Constraints)
    ↓
CANDIDATE FILTER (Compatible vs Disqualified Materials)
    ↓
ML MODEL (Random Forest Class Probability Distribution)
    ↓
RULE VETO CHECK (Hard Domain Rule Overrides Unsafe ML Predictions)
    ↓
COMPATIBILITY SCORING (85% Multi-criteria + 15% ML Confidence)
    ↓
EXPLANATION ENGINE (Generates Plain-English Reasons)
    ↓
FINAL RECOMMENDATIONS (Recommended + 3 Alternative Categories)
```

### Domain Rule Veto Guarantee
If the ML model predicts a packaging material that violates a hard domain constraint (for instance, recommending bare aluminum on high-acid foods [Rule R007] or zero-permeability foil on high-respiration produce [Rule R004]), the Rule Engine vetoes the candidate, prevents an unsafe recommendation, and records an explicit advisory notice in the response.
