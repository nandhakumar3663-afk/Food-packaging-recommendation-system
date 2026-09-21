"""
Random Forest Training Script for Food Packaging Recommendation.
Architecture: CPU-only execution on AMD Ryzen 5 5500U.
Model: RandomForestClassifier (scikit-learn).
Hyperparameters: n_estimators=100, max_depth=10, random_state=42, n_jobs=-1.
"""

import json
from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

# Feature schema definition
FEATURE_COLUMNS = [
    "moisture",
    "fat",
    "ph",
    "respiration_rate_encoded",
    "storage_temperature",
    "storage_rh",
    "target_shelf_life",
    "oxygen_sensitivity_encoded",
    "moisture_sensitivity_encoded",
    "light_sensitivity_encoded",
]

RESPIRATION_MAP = {
    "none": 0,
    "low": 1,
    "moderate": 2,
    "medium": 2,
    "high": 3,
    "very high": 4,
    "very_high": 4,
}

SENSITIVITY_MAP = {
    "low": 1,
    "moderate": 2,
    "medium": 2,
    "high": 3,
}

def encode_features(df: pd.DataFrame) -> pd.DataFrame:
    """Encode categorical features to numerical values."""
    encoded_df = df.copy()
    
    encoded_df["respiration_rate_encoded"] = (
        encoded_df["respiration_rate"].astype(str).str.lower().map(RESPIRATION_MAP).fillna(0).astype(int)
    )
    encoded_df["oxygen_sensitivity_encoded"] = (
        encoded_df["oxygen_sensitivity"].astype(str).str.lower().map(SENSITIVITY_MAP).fillna(2).astype(int)
    )
    encoded_df["moisture_sensitivity_encoded"] = (
        encoded_df["moisture_sensitivity"].astype(str).str.lower().map(SENSITIVITY_MAP).fillna(2).astype(int)
    )
    encoded_df["light_sensitivity_encoded"] = (
        encoded_df["light_sensitivity"].astype(str).str.lower().map(SENSITIVITY_MAP).fillna(2).astype(int)
    )
    
    return encoded_df[FEATURE_COLUMNS]

def train_and_evaluate(data_path: Path, artifacts_dir: Path) -> Dict[str, Any]:
    """Train RandomForestClassifier, evaluate on test split, and persist artifacts."""
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    
    df = pd.read_csv(data_path)
    X = encode_features(df)
    
    # Label encoding for multi-class target
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["recommended_material"])
    
    # Stratified 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Initialize CPU-safe Random Forest
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    
    # Evaluation
    y_pred = rf.predict(X_test)
    
    acc = float(accuracy_score(y_test, y_pred))
    prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    prec_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    rec_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    metrics = {
        "model_type": "RandomForestClassifier",
        "library": "scikit-learn",
        "hardware_profile": "AMD Ryzen 5 5500U (CPU Only)",
        "hyperparameters": {
            "n_estimators": 100,
            "max_depth": 10,
            "random_state": 42,
            "n_jobs": -1
        },
        "dataset": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "provenance": "SYNTHETIC DEMONSTRATION DATA",
            "statistically_meaningful_warning": (
                "Notice: Metrics are calculated on a synthetic demonstration dataset designed to verify "
                "the ML software pipeline and hybrid rule-engine architecture. These metrics must not be "
                "interpreted as experimentally validated physical food shelf-life performance."
            )
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "precision_macro": round(prec_macro, 4),
            "precision_weighted": round(prec_weighted, 4),
            "recall_macro": round(rec_macro, 4),
            "recall_weighted": round(rec_weighted, 4),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
            "confusion_matrix": cm,
            "classes": label_encoder.classes_.tolist()
        }
    }
    
    # Feature importance
    feature_importances = dict(zip(FEATURE_COLUMNS, [round(float(v), 4) for v in rf.feature_importances_]))
    metrics["feature_importances"] = feature_importances
    
    # Persist artifacts
    model_path = artifacts_dir / "random_forest_model.joblib"
    le_path = artifacts_dir / "label_encoder.joblib"
    schema_path = artifacts_dir / "feature_schema.json"
    metrics_path = artifacts_dir / "model_metrics.json"
    
    joblib.dump(rf, model_path)
    joblib.dump(label_encoder, le_path)
    
    schema_data = {
        "feature_columns": FEATURE_COLUMNS,
        "respiration_map": RESPIRATION_MAP,
        "sensitivity_map": SENSITIVITY_MAP,
        "target_classes": label_encoder.classes_.tolist()
    }
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(schema_data, f, indent=2)
        
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
        
    print("Random Forest Training Complete!")
    print(f"Accuracy: {acc:.4f} | F1 Macro: {f1_macro:.4f} | F1 Weighted: {f1_weighted:.4f}")
    print(f"Artifacts saved in: {artifacts_dir}")
    return metrics

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent.parent
    data_file = base_dir / "data" / "training_data.csv"
    artifacts_directory = base_dir / "ml" / "artifacts"
    train_and_evaluate(data_file, artifacts_directory)
