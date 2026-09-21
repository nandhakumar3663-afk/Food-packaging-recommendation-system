# Sustainability & Circularity Assessment

## Overview

The Smart Food Packaging Recommendation System includes an integrated sustainability assessment module. To prevent greenwashing and maintain academic honesty, all sustainability metrics are clearly designated as **Project-Defined Indices** rather than certified environmental lifecycles.

---

## 1. Project-Defined Sustainability Index

The sustainability rating is computed using a weighted composite formula combining mechanical recyclability, bio-renewable content, and post-consumer end-of-life infrastructure:

$$\text{Sustainability Index} = (0.40 \times \text{Recyclability}) + (0.35 \times \text{Renewable Content}) + (0.25 \times \text{End-of-Life Score})$$

### Component Weight Breakdown:
1. **Mechanical Recyclability (40% Weight):**
   - Reflects the practical sorting and reprocessing efficiency in standard municipal recycling facilities (MRFs).
   - Monomaterials like HDPE and Glass receive high ratings (90–100%), while multi-material laminates with incompatible tie layers receive lower ratings (15–30%).
2. **Bio-Renewable Feedstock Content (35% Weight):**
   - Percentage of polymer derived from renewable bio-based inputs (e.g. corn starch, sugarcane, cellulose) rather than virgin fossil fuels.
   - PLA and bio-PBS coated paperboards score 100% and 85% respectively, whereas conventional polyolefins score 0%.
3. **End-of-Life Recovery Pathway (25% Weight):**
   - Evaluates the availability of commercial recovery infrastructure.
   - Scoring guide:
     - **Closed-Loop Mechanical Recycling (HDPE, PET, Glass):** 85–100 pts.
     - **Industrial Composting (Certified EN 13432 / ASTM D6400 PLA):** 75 pts.
     - **Downcycling / Mixed Film Reprocessing (LDPE, BOPP):** 50–60 pts.
     - **Landfill / Waste-to-Energy (Non-separable Laminates):** 20–30 pts.

---

## 2. Material Sustainability Profiles

| Material | Recyclability | Bio-Renewable | End-of-Life Pathway | Project Sustainability Index |
|:---|:---:|:---:|:---|:---:|
| **Glass Container** | 100% | 0% | Infinite closed-loop cullet recycling | **65.0 / 100** |
| **High-Density Polyethylene (HDPE)** | 90% | 0% | High-demand rigid bottle/film stream | **58.5 / 100** |
| **Polylactic Acid Film (PLA)** | 20% | 100% | Certified industrial composting facilities | **61.8 / 100** |
| **Kraft Paper + Bio-PBS Coating** | 60% | 85% | Industrial organic pulping & composting | **71.3 / 100** |
| **Biaxially Oriented Polypropylene (BOPP)** | 70% | 0% | Polyolefin film recycling stream | **44.0 / 100** |
| **Aluminum Foil Laminate (PET/Foil/PE)** | 15% | 0% | Multi-layer separation challenge (landfill/WTE) | **13.5 / 100** |

---

## 3. Preference Profile Integration

Users can prioritize circularity through the **Sustainability Priority Profile**:
- Multi-criteria weight for sustainability increases from **10% (Balanced)** to **30% (Sustainability Priority)**.
- Materials with high circularity indices gain rank advantages, provided they satisfy physiological food safety and barrier rules.

---

## 4. Academic & Regulatory Non-Certification Disclaimer

> **IMPORTANT NOTICE**  
> The "Sustainability Index" calculated by this software is a **heuristic academic model** designed for multi-attribute comparison in student engineering projects. It is **NOT**:
> - An ISO 14040 / ISO 14044 certified Life Cycle Assessment (LCA).
> - An Environmental Product Declaration (EPD).
> - A certified carbon footprint measurement.
>
> True environmental lifecycle accounting requires cradle-to-grave analysis including resin synthesis emissions, transportation distances, and regional waste infrastructure statistics.
