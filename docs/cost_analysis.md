# Cost Analysis & Economic Benchmarking

## Overview

The Smart Food Packaging Recommendation System provides transparent, objective cost estimates to guide material selection without relying on fabricated commercial quotes.

Because actual commercial packaging converter pricing varies significantly based on order volume, minimum order quantities (MOQ), slitting, corona treatment, multi-color printing, and custom lamination, all costs in this system represent **academic comparative benchmarks**.

---

## 1. Unit Package Cost Methodology

To convert raw material area pricing into tangible per-unit cost metrics, the system models a standard single-serving flexible pouch or produce wrap:

$$\text{Standard Unit Area} = 0.05 \, \text{m}^2$$

For example, a pouch measuring $15 \, \text{cm} \times 16.5 \, \text{cm}$ (front and back face plus seal margins) requires approximately $0.05 \, \text{m}^2$ of material web:

$$\text{Unit Package Cost (USD)} = \text{Estimated Material Cost } (\$/\text{m}^2) \times 0.05$$

### Example Calculations:
- **Low-Density Polyethylene (LDPE, $0.12/m²):**
  $$\text{Unit Cost} = \$0.12 \times 0.05 = \$0.0060 \, \text{per package}$$
- **Biaxially Oriented Polypropylene (BOPP, $0.18/m²):**
  $$\text{Unit Cost} = \$0.18 \times 0.05 = \$0.0090 \, \text{per package}$$
- **Aluminum Foil Laminate (PET/Al-Foil/PE, $0.45/m²):**
  $$\text{Unit Cost} = \$0.45 \times 0.05 = \$0.0225 \, \text{per package}$$

---

## 2. Cost Tiers Definition

Materials in the catalog are classified into four economic tiers based on raw substrate benchmark price per square meter:

| Cost Tier | Price Range ($\text{USD/m}^2$) | Description & Substrate Examples |
|:---|:---:|:---|
| **Budget** | $< \$0.15$ | Commodity monolayer films (LDPE, HDPE, standard monolayer PP) |
| **Moderate** | $\$0.15 - \$0.35$ | Biaxially oriented films and standard bio-polymers (BOPP, PLA) |
| **Premium** | $\$0.35 - \$0.60$ | High-barrier coextrusions and foil laminates (EVOH coex, Al-foil laminates) |
| **Specialty** | $\ge \$0.60$ | Heavy gauge rigid containers, specialty barrier coatings, and glass |

---

## 3. Cost Score Normalization

For multi-criteria scoring, material cost is normalized on a 0–100 efficiency scale:

$$\text{Cost Score} = \max\left(0, \min\left(100, 100 - \left(\frac{\text{Cost} - \text{Min Cost}}{\text{Max Cost} - \text{Min Cost}}\right) \times 100\right)\right)$$

Where:
- $\text{Min Cost} = \$0.05/\text{m}^2$
- $\text{Max Cost} = \$1.20/\text{m}^2$

---

## 4. Multi-Objective Decision Steering

The impact of economic cost on the final candidate ranking depends on the user's chosen **Preference Profile**:

- **Balanced Profile (Default):** Cost contributes **10%** to the compatibility score.
- **Cost Priority Profile:** Cost contributes **30%** to the compatibility score, promoting budget materials (e.g. LDPE, BOPP) while preserving required barrier safety thresholds.
- **Sustainability Priority Profile:** Cost contributes **5%**, giving priority to recyclability and renewable polymers.

---

## 5. Non-Commercial Benchmark Disclaimer

> **IMPORTANT DISCLAIMER**  
> All cost figures are academic baseline benchmarks sourced from packaging literature (Robertson, 2012; Massey, 2003) and synthetic educational benchmarks. They do **NOT** represent formal supplier quotes or commercial binding pricing. Packaging procurement requires RFQs with certified packaging converters.
