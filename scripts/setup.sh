#!/usr/bin/env bash
# =============================================================================
# Smart Food Packaging Recommendation System — Automated Setup Script
# Phase 8 — Final Release
#
# Target Hardware: AMD Ryzen 5 5500U, 8 GB RAM, Integrated AMD Radeon
# IMPORTANT: CPU-only. No CUDA, no NVIDIA, no GPU dependencies.
#
# Usage:
#   chmod +x scripts/setup.sh
#   ./scripts/setup.sh
# =============================================================================

set -euo pipefail

SEPARATOR="=================================================================="

echo "$SEPARATOR"
echo " SMART FOOD PACKAGING RECOMMENDATION SYSTEM — SETUP"
echo " Phase 8 — Final Release"
echo " Hardware: CPU-Only (No CUDA / No NVIDIA)"
echo "$SEPARATOR"
echo ""

# -------------------------------------------------------
# 1. Check Python version
# -------------------------------------------------------
echo "[1/7] Checking Python version..."
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python not found. Please install Python 3.10+ and try again."
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo "  ✓ Found $PYTHON_CMD ($PYTHON_VERSION)"

# -------------------------------------------------------
# 2. Create virtual environment (if it does not exist)
# -------------------------------------------------------
echo ""
echo "[2/7] Setting up virtual environment..."
if [ -d ".venv" ]; then
    echo "  ✓ Virtual environment already exists (.venv/)"
else
    $PYTHON_CMD -m venv .venv
    echo "  ✓ Created virtual environment (.venv/)"
fi

# Activate virtual environment
source .venv/bin/activate
echo "  ✓ Activated virtual environment"

# -------------------------------------------------------
# 3. Install CPU-only dependencies
# -------------------------------------------------------
echo ""
echo "[3/7] Installing CPU-only dependencies..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo "  ✓ All dependencies installed (CPU-only, no CUDA)"

# -------------------------------------------------------
# 4. Initialize SQLite database
# -------------------------------------------------------
echo ""
echo "[4/7] Initializing SQLite database..."
python scripts/init_db.py
echo "  ✓ Database schema created"

# -------------------------------------------------------
# 5. Seed sample data
# -------------------------------------------------------
echo ""
echo "[5/7] Seeding sample food and packaging material data..."
python scripts/seed_data.py
echo "  ✓ Sample data seeded"

# -------------------------------------------------------
# 6. Prepare ML models (train only if artifacts missing)
# -------------------------------------------------------
echo ""
echo "[6/7] Checking ML model artifacts..."
RF_MODEL="ml/artifacts/random_forest_model.joblib"
XGB_MODEL="ml/artifacts/xgboost_model.joblib"

if [ -f "$RF_MODEL" ] && [ -f "$XGB_MODEL" ]; then
    echo "  ✓ ML artifacts already exist — skipping training"
else
    echo "  → Training ML models on CPU (this may take a moment)..."
    python ml/training/prepare_dataset.py
    python ml/training/train_random_forest.py
    python ml/training/train_xgboost.py
    echo "  ✓ ML models trained and saved"
fi

# -------------------------------------------------------
# 7. Verify installation
# -------------------------------------------------------
echo ""
echo "[7/7] Running verification checks..."
python scripts/verify_db.py
echo "  ✓ Database verification passed"

echo ""
echo "$SEPARATOR"
echo " SETUP COMPLETED SUCCESSFULLY"
echo ""
echo " To start the server:"
echo "   source .venv/bin/activate"
echo "   python run.py"
echo ""
echo " To run tests:"
echo "   python -m pytest tests/ -v"
echo ""
echo " To run the automated demo:"
echo "   python scripts/demo.py"
echo ""
echo " To simulate IoT telemetry:"
echo "   python scripts/simulate_iot.py --mode normal --count 10"
echo "$SEPARATOR"
