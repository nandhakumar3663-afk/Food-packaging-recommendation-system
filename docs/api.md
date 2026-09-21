# REST API Documentation

This document describes the REST API endpoints provided by the **Smart Food Packaging Recommendation System**.

Base URL: `http://127.0.0.1:5000`  
Data Format: `application/json`

---

## 1. System & Health

### `GET /`
Root informational endpoint displaying API status and registered routes.

**Response `200 OK`**:
```json
{
  "endpoints": [
    "/api/foods",
    "/api/materials",
    "/api/analyze",
    "/api/history",
    "/api/presets",
    "/api/health"
  ],
  "mode": "Phase 2 - CPU Hybrid Engine (No ML / No CUDA)",
  "name": "Smart Food Packaging Recommendation System API",
  "status": "online",
  "success": true,
  "version": "1.0.0"
}
```

### `GET /api/health`
Health check endpoint reporting hardware and runtime status.

**Response `200 OK`**:
```json
{
  "cpu_target": "AMD Ryzen 5 5500U",
  "cuda_present": false,
  "database": "SQLite",
  "status": "healthy"
}
```

---

## 2. Food & Packaging Catalogs

### `GET /api/foods`
Retrieve all food commodities stored in the database.

**Response `200 OK`**:
```json
{
  "count": 10,
  "foods": [
    {
      "food_id": 1,
      "food_name": "Roasted Whole Coffee Beans",
      "category": "Dry Goods & Cereals",
      "moisture": 2.5,
      "fat": 15.0,
      "ph": 5.2,
      "respiration_rate": "None",
      "storage_temperature": 22.0,
      "storage_rh": 50.0,
      "target_shelf_life": 270,
      "oxygen_sensitivity": "High",
      "moisture_sensitivity": "High",
      "light_sensitivity": "High",
      "source": "Robertson, G. L. (2012)...",
      "source_url": "https://fdc.nal.usda.gov/...",
      "notes": "Susceptible to lipid rancidity..."
    }
  ],
  "success": true
}
```

### `GET /api/foods/<food_id>`
Retrieve a single food commodity by ID.

**Status Codes**:
- `200 OK`: Food record returned.
- `404 Not Found`: Food ID does not exist.

---

### `GET /api/materials`
Retrieve all packaging materials with barrier specifications and literature provenance.

**Response `200 OK`**:
```json
{
  "count": 12,
  "materials": [
    {
      "material_id": 1,
      "material_name": "EVOH Multi-layer Barrier Film (PE/EVOH/PE)",
      "material_category": "Flexible Film",
      "polymer_type": "EVOH",
      "otr": 3.5,
      "otr_unit": "cc/(m²·day·atm)",
      "otr_test_condition": "23°C, 65% RH",
      "wvtr": 4.0,
      "wvtr_unit": "g/(m²·day)",
      "wvtr_test_condition": "38°C, 90% RH",
      "thickness": 60.0,
      "thickness_unit": "μm",
      "oxygen_barrier": "Excellent",
      "moisture_barrier": "Good",
      "light_barrier": "Moderate",
      "mechanical_strength": "High",
      "sealability": "Good",
      "recyclability": 30.0,
      "renewable_content": 0.0,
      "estimated_cost": 0.85,
      "source": "Robertson, G. L. (2012)...",
      "source_url": "https://www.routledge.com/...",
      "notes": "Coextruded high gas-barrier film..."
    }
  ],
  "success": true
}
```

### `GET /api/materials/<material_id>`
Retrieve a single packaging material by ID.

**Status Codes**:
- `200 OK`: Material returned.
- `404 Not Found`: Material ID does not exist.

---

## 3. Recommendation Engine (`POST /api/analyze`)

The primary analytical endpoint. Accepts food properties and storage logistics, runs input validation, evaluates domain rules (`rules/packaging_rules.yaml`), calculates multi-attribute compatibility scores, logs the result to SQLite history, and returns 4 neutral options.

**Method**: `POST`  
**Endpoint**: `/api/analyze`  
**Headers**: `Content-Type: application/json`

### Request Body Schema
```json
{
  "food_id": 1,
  "food_name": "Roasted Whole Coffee Beans",
  "category": "Dry Goods & Cereals",
  "moisture": 2.5,
  "fat": 15.0,
  "ph": 5.2,
  "respiration_rate": "None",
  "target_shelf_life": 270,
  "storage_temperature": 22.0,
  "storage_rh": 50.0,
  "storage_type": "Ambient",
  "transport_condition": "Standard Ambient",
  "oxygen_sensitivity": "High",
  "moisture_sensitivity": "High",
  "light_sensitivity": "High"
}
```
*Note*: If `food_id` is supplied, `food_name` and `category` are automatically inherited from the database if omitted.

### Response `200 OK`
```json
{
  "success": true,
  "recommendation_id": 1,
  "analysis": {
    "food": "Roasted Whole Coffee Beans",
    "category": "Dry Goods & Cereals",
    "target_shelf_life": 270,
    "storage": {
      "temperature": 22.0,
      "rh": 50.0,
      "storage_type": "Ambient",
      "transport_condition": "Standard Ambient"
    }
  },
  "constraints": {
    "max_otr": 20.0,
    "min_otr": null,
    "max_wvtr": 3.0,
    "min_oxygen_barrier_rank": 2,
    "min_moisture_barrier_rank": 2,
    "min_light_barrier_rank": 2,
    "disallowed_categories": [],
    "disallowed_polymer_types": []
  },
  "candidate_count": 4,
  "disqualified_count": 8,
  "recommendations": {
    "recommended_match": {
      "recommendation_type": "Recommended Match",
      "compatibility_score": 89.79,
      "material": {
        "material_id": 10,
        "material_name": "Aseptic Paperboard Composite (Tetra-style Carton)",
        "material_category": "Paper & Paperboard",
        "otr": 0.5,
        "wvtr": 0.8,
        "estimated_cost": 0.70,
        "recyclability": 65.0,
        "renewable_content": 75.0
      },
      "subscores": {
        "cost": 63.88,
        "mechanical": 80.0,
        "moisture": 100.0,
        "oxygen": 100.0,
        "sealability": 100.0,
        "shelf_life": 90.0,
        "sustainability": 69.0
      },
      "reasons": [
        "Selected for high oxygen protection (OTR: 0.5 cc/(m²·day·atm)) to mitigate lipid oxidation and sensory deterioration.",
        "Low water vapor transmission (WVTR: 0.8 g/(m²·day)) prevents moisture loss or crispness degradation."
      ],
      "triggered_rules": [
        {
          "id": "R001_HIGH_FAT_OXIDATION",
          "name": "High Fat Oxidation Protection",
          "explanation": "High fat content (>= 15%) combined with oxygen sensitivity accelerates lipid auto-oxidation; packaging must provide a stringent oxygen barrier (OTR <= 50 cc/(m²·day·atm))."
        }
      ],
      "warnings": []
    },
    "alternative_match": {
      "recommendation_type": "Alternative Match",
      "compatibility_score": 88.54,
      "material": { ... }
    },
    "lower_cost_alternative": {
      "recommendation_type": "Lower-cost Alternative",
      "compatibility_score": 84.79,
      "material": { ... }
    },
    "sustainability_oriented_alternative": {
      "recommendation_type": "Sustainability-oriented Alternative",
      "compatibility_score": 86.64,
      "material": { ... }
    }
  }
}
```

### Error Response `400 Bad Request`
```json
{
  "success": false,
  "error": "Validation or processing error.",
  "errors": [
    "Moisture must be between 0.0 and 100.0%, received: -10.0",
    "pH must be between 1.0 and 14.0, received: 16.0"
  ]
}
```

---

## 4. History API

### `GET /api/history`
Retrieve historical packaging analyses.

**Query Parameters**:
- `limit` (optional, default `20`, max `100`): Maximum records to retrieve.

**Response `200 OK`**:
```json
{
  "count": 1,
  "history": [
    {
      "recommendation_id": 1,
      "food_id": 1,
      "food_name": "Roasted Whole Coffee Beans",
      "category": "Dry Goods & Cereals",
      "material_name": "Aseptic Paperboard Composite (Tetra-style Carton)",
      "compatibility_score": 89.79,
      "reason": "Selected for high oxygen protection...",
      "created_at": "2026-09-21 14:27:09"
    }
  ],
  "limit": 20,
  "success": true
}
```

### `GET /api/history/<recommendation_id>`
Retrieve full joined record of an individual historical analysis.

**Status Codes**:
- `200 OK`: Full historical record returned.
- `404 Not Found`: Record not found.
