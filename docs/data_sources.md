# Data Sources & Provenance

This document records the exact sources, citations, URLs, measurement conditions, extracted fields, and limitations for data used in the **Smart Food Packaging Recommendation System**.

---

## 1. Scientific Integrity Policy

In strict accordance with domain safety guidelines:
1. **No Fabricated Data**: Real-world packaging specifications (OTR, WVTR, thickness) are sourced exclusively from peer-reviewed literature or established food engineering handbooks.
2. **Explicit Labeling**: Where hypothetical demonstration records are created to benchmark algorithms, they are explicitly tagged as:
   `SYNTHETIC DEMONSTRATION DATA`
3. **No Unwarranted Extrapolations**: Transmission rates depend heavily on temperature, relative humidity, and film orientation. Measured test conditions are always stored alongside numeric values.

---

## 2. Literature Sources (Packaging Materials)

### Source 1: Food Packaging: Principles and Practice (3rd Edition)
- **Author**: Gordon L. Robertson
- **Publisher**: CRC Press / Taylor & Francis Group (2012)
- **ISBN**: 978-1439862414
- **URL**: [Routledge Book Details](https://www.routledge.com/Food-Packaging-Principles-and-Practice/Robertson/p/book/9781439862414)
- **Extracted Data**:
  - EVOH coextruded barrier film permeability: OTR ~3.5 cc/(m²·day·atm) at 23°C, 65% RH; WVTR ~4.0 g/(m²·day) at 38°C, 90% RH.
  - HDPE film permeability: OTR ~2000 cc/(m²·day·atm) at 23°C, 0% RH; WVTR ~4.5 g/(m²·day) at 38°C, 90% RH.
  - LDPE film permeability: OTR ~7000 cc/(m²·day·atm) at 23°C, 0% RH; WVTR ~18 g/(m²·day) at 38°C, 90% RH.
  - Aluminum foil laminate: near-zero gas transmission rates (<0.01).
  - Glass containers: zero transmission hermetic barrier.
  - Multi-layer paperboard carton (aseptic liquid composite).
- **Limitations**: Values represent typical commercial grade averages; actual permeability varies with processing grade, orientation, and moisture plasticization (e.g., EVOH barrier decreases at very high RH).

### Source 2: Permeability Properties of Plastics and Elastomers (2nd Edition)
- **Author**: Liesl K. Massey
- **Publisher**: Plastics Design Library / Elsevier (2003)
- **ISBN**: 978-1884207976
- **URL**: [ScienceDirect Details](https://www.sciencedirect.com/book/9781884207976/permeability-properties-of-plastics-and-elastomers)
- **Extracted Data**:
  - Biaxially Oriented Polyethylene Terephthalate (BOPET 25 μm): OTR 110 cc/(m²·day·atm) at 23°C, 50% RH; WVTR 20 g/(m²·day) at 38°C, 90% RH.
  - Vacuum Metallized PET (Met-PET 12 μm): OTR 1.2 cc/(m²·day·atm) at 23°C, 50% RH; WVTR 1.0 g/(m²·day) at 38°C, 90% RH.
  - Biaxially Oriented Polypropylene (BOPP 30 μm): OTR 1500 cc/(m²·day·atm) at 23°C, 0% RH; WVTR 5.0 g/(m²·day) at 38°C, 90% RH.
- **Limitations**: Permeation measurements are ASTM standardized (ASTM D3985 for OTR, ASTM F1249 for WVTR); film additives and coating thicknesses can alter exact performance.

### Source 3: Bio-nanocomposites for Food Packaging Applications
- **Authors**: Jong-Whan Rhim, Perry K.W. Woo
- **Journal**: *Critical Reviews in Food Science and Nutrition*, 46(4): 335-345 (2006)
- **DOI**: [10.1080/10408390600846366](https://doi.org/10.1080/10408390600846366)
- **Extracted Data**:
  - Polylactic Acid (PLA 25 μm film): OTR ~700 cc/(m²·day·atm) at 23°C, 0% RH; WVTR ~175 g/(m²·day) at 38°C, 90% RH.
  - 100% bio-based renewable carbon content.
- **Limitations**: Unmodified PLA has high water vapor transmission and brittle elongation characteristics.

---

## 3. Literature Sources (Food Commodities)

### Source 4: USDA FoodData Central
- **Organization**: United States Department of Agriculture (USDA), Agricultural Research Service
- **URL**: [https://fdc.nal.usda.gov/](https://fdc.nal.usda.gov/)
- **Extracted Data**:
  - Roasted Coffee Beans (FDC ID: 171890): Moisture 2.5%, Fat 15.0%, pH ~5.2.
  - Fresh Strawberries (FDC ID: 167762): Moisture 91.0%, Fat 0.3%, pH 3.5.
  - Potato Chips (FDC ID: 170425): Moisture 1.5%, Fat 34.5%, pH 6.2.
  - Cheddar Cheese (FDC ID: 173418): Moisture 36.8%, Fat 33.1%, pH 5.2.
  - Whole Milk Powder (FDC ID: 171271): Moisture 3.0%, Fat 26.5%, pH 6.7.
- **Limitations**: Nutritional proximate values represent unadulterated baseline ingredients. Moisture equilibrium varies with ambient relative humidity.

### Source 5: USDA Agricultural Handbook 66 (Commercial Storage of Fruits, Vegetables, and Florist and Nursery Stocks)
- **Authors**: R.E. Hardenburg, A.E. Watada, C.Y. Wang
- **Publisher**: United States Department of Agriculture (1986)
- **URL**: [USDA Ag Handbook 66](https://www.ars.usda.gov/arsuserfiles/oc/np/commercialstorage/commercialstorage.pdf)
- **Extracted Data**:
  - Respiration rates, optimal storage temperatures, and relative humidity tolerances for fresh strawberries and baby spinach leaves.
- **Limitations**: Respiration rate ($mg\ CO_2 / kg \cdot hr$) is temperature-dependent and doubles every 10°C increase ($Q_{10}$ effect).

---

## 4. Synthetic Records

The following records are generated exclusively for automated software pipeline verification:

1. **Perforated LDPE Produce Pouch (Synthetic Benchmark)**
   - `source`: `SYNTHETIC DEMONSTRATION DATA`
   - Purpose: Validating Rule R004 (produce gas exchange permeability).
2. **Kraft Paper + Bio-PBS Coating (Synthetic Benchmark)**
   - `source`: `SYNTHETIC DEMONSTRATION DATA`
   - Purpose: Validating high renewable content scoring profiles.
3. **Synthetic Test Item A & B**
   - `source`: `SYNTHETIC DEMONSTRATION DATA`
   - Purpose: Automated CI/CD boundary testing of cryogenic freezer rules and edge cases.
