"""
Unit tests for SQLite database schema, operations, and seed loading.
"""

import pytest
from pathlib import Path
from app.models.database import (
    init_database,
    insert_food,
    get_all_foods,
    get_food_by_id,
    insert_packaging_material,
    get_all_materials,
    get_material_by_id,
    insert_recommendation,
    get_recommendation_history,
    get_recommendation_by_id,
    get_db_connection,
)
from app.models.schemas import FoodItem, PackagingMaterial


@pytest.fixture
def temp_db(tmp_path):
    db_file = tmp_path / "test_packaging.db"
    init_database(db_file)
    return db_file


def test_database_init_creates_tables(temp_db):
    """Verify that all required tables and indices are created."""
    with get_db_connection(temp_db) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = [row["name"] for row in cursor.fetchall() if not row["name"].startswith("sqlite_")]
        assert "food" in tables
        assert "packaging_material" in tables
        assert "storage" in tables
        assert "recommendation" in tables


def test_food_insert_and_query(temp_db):
    """Verify insertion and retrieval of food commodities."""
    food = FoodItem(
        food_name="Test Berry",
        category="Produce",
        moisture=90.0,
        fat=0.2,
        ph=3.6,
        respiration_rate="High",
        storage_temperature=2.0,
        storage_rh=90.0,
        target_shelf_life=12,
        oxygen_sensitivity="Low",
        moisture_sensitivity="High",
        light_sensitivity="Low",
        source="SYNTHETIC DEMONSTRATION DATA",
    )
    food_id = insert_food(food, temp_db)
    assert food_id is not None
    assert food_id > 0

    fetched = get_food_by_id(food_id, temp_db)
    assert fetched is not None
    assert fetched["food_name"] == "Test Berry"
    assert fetched["category"] == "Produce"
    assert fetched["moisture"] == 90.0
    assert fetched["source"] == "SYNTHETIC DEMONSTRATION DATA"

    all_foods = get_all_foods(temp_db)
    assert len(all_foods) == 1


def test_packaging_material_insert_and_query(temp_db):
    """Verify insertion and retrieval of packaging materials."""
    mat = PackagingMaterial(
        material_name="Test Barrier Foil",
        material_category="Multi-layer Laminate",
        polymer_type="Alu-PET",
        otr=0.05,
        otr_unit="cc/(m²·day·atm)",
        otr_test_condition="23°C, 50% RH",
        wvtr=0.02,
        wvtr_unit="g/(m²·day)",
        wvtr_test_condition="38°C, 90% RH",
        thickness=75.0,
        thickness_unit="μm",
        oxygen_barrier="Excellent",
        moisture_barrier="Excellent",
        light_barrier="Excellent",
        mechanical_strength="Very High",
        sealability="Excellent",
        recyclability=20.0,
        renewable_content=0.0,
        estimated_cost=0.90,
        source="SYNTHETIC DEMONSTRATION DATA",
    )
    mat_id = insert_packaging_material(mat, temp_db)
    assert mat_id is not None
    assert mat_id > 0

    fetched = get_material_by_id(mat_id, temp_db)
    assert fetched is not None
    assert fetched["material_name"] == "Test Barrier Foil"
    assert fetched["otr"] == 0.05
    assert fetched["recyclability"] == 20.0

    all_mats = get_all_materials(temp_db)
    assert len(all_mats) == 1


def test_recommendation_logging(temp_db):
    """Verify recommendation logging with sub-scores and snapshots."""
    # First insert a material for foreign key
    mat = PackagingMaterial(
        material_name="EVOH Laminate",
        material_category="Flexible Film",
        otr=3.5,
        wvtr=4.0,
        thickness=60.0,
        oxygen_barrier="Excellent",
        moisture_barrier="Good",
        light_barrier="Moderate",
        mechanical_strength="High",
        sealability="Good",
        recyclability=30.0,
        renewable_content=0.0,
        estimated_cost=0.85,
        source="Robertson 2012",
    )
    mat_id = insert_packaging_material(mat, temp_db)

    rec_id = insert_recommendation(
        food_id=None,
        food_name="Test Food",
        category="Dairy",
        selected_material_id=mat_id,
        material_name="EVOH Laminate",
        recommendation_type="Recommended Match",
        compatibility_score=88.5,
        sub_scores={
            "oxygen": 95.0,
            "moisture": 85.0,
            "mechanical": 80.0,
            "sealability": 80.0,
            "shelf_life": 90.0,
            "sustainability": 18.0,
            "cost": 65.0,
        },
        reason="Excellent oxygen barrier preserves freshness.",
        triggered_rules=[{"id": "R001", "name": "High Fat Oxidation"}],
        input_snapshot={"fat": 30.0, "moisture": 35.0},
        db_path=temp_db,
    )
    assert rec_id > 0

    history = get_recommendation_history(limit=10, db_path=temp_db)
    assert len(history) == 1
    assert history[0]["material_name"] == "EVOH Laminate"
    assert history[0]["compatibility_score"] == 88.5

    rec_detail = get_recommendation_by_id(rec_id, db_path=temp_db)
    assert rec_detail is not None
    assert rec_detail["food_name"] == "Test Food"
    assert rec_detail["material_category"] == "Flexible Film"
