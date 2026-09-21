# UI/UX Redesign Documentation (Phase 4)

## 1. Visual Theme: Light-Green Identity
To replace the previous dense dark interface, Phase 4 implemented a fresh, eco-friendly, modern light-green visual system communicating food science, sustainability, and technological clarity.

### Centralized CSS Variables (`static/css/style.css`)
```css
:root {
  --primary-green: #16a34a;       /* Primary Accent (Emerald 600) */
  --primary-green-hover: #15803d; /* Hover State (Emerald 700) */
  --primary-green-active: #14532d;/* Active / Focused (Emerald 900) */
  --light-green: #dcfce7;         /* Soft Green Card / Pill BG (Emerald 100) */
  --very-light-green: #f0fdf4;    /* Subtle Green Surface (Emerald 50) */
  --dark-green: #14532d;          /* Dark Green Text / Badges */

  --background: #f8faf9;          /* Fresh Light Neutral Page BG */
  --surface: #ffffff;             /* Pure White Surface / Card BG */
  --text-primary: #1e293b;        /* Slate 800 - High Contrast Readable Text */
  --text-secondary: #475569;      /* Slate 600 - Muted Paragraph Text */
  --text-muted: #64748b;          /* Slate 500 - Auxiliary / Label Text */

  --border: #e2e8f0;              /* Standard Neutral Border */
  --border-green: #bbf7d0;        /* Light Green Border Accent */
}
```

---

## 2. Core User Experience Principles
Every page in the application is engineered around three immediate user questions:
1. **WHAT DO I ENTER?**  
   - Clear input groups, inline units (`%`, `°C`, `days`, `pH`), and a one-click food preset selector with known food commodities.
2. **WHAT DID THE SYSTEM FIND?**  
   - A large, prominent green hero card displaying the recommended packaging material, categorized badge, and project-defined compatibility score.
3. **WHY DID IT RECOMMEND THIS?**  
   - 3 to 5 plain-English bullet points explaining the decision, an explainable machine-learning assessment badge, and horizontal score progress bars.

---

## 3. Progressive Disclosure (4-Step Form Wizard)
To prevent cognitive overload, the analysis form on `/analyze` is partitioned into 4 logical steps:
- **Step 1: What are you packaging?** (Food name, food category, and preset loader).
- **Step 2: Food Characteristics** (Moisture, fat, acidity pH, and respiration activity with helper text).
- **Step 3: Storage & Shelf Life** (Storage temperature, relative humidity, target shelf life, storage environment).
- **Step 4: Sensitivities & Options** (Oxygen, moisture, and light sensitivities, plus collapsible advanced priority overrides).

### Contextual Tooltips
Beginner-friendly explanations for technical terms:
- **OTR**: Oxygen Transmission Rate — measures how easily oxygen passes through packaging. Lower values mean stronger barrier against staling and rancidity.
- **WVTR**: Water Vapor Transmission Rate — measures moisture permeability. Lower values prevent crisp foods from getting soggy.
- **Respiration Activity**: Fresh fruits and vegetables continue to consume oxygen and release CO2 after harvest, requiring permeable or vented packaging.
- **Compatibility Score**: Calculated multi-criteria score reflecting food-barrier fit, not a clinical laboratory guarantee.

---

## 4. Results & Comparison Hierarchy
- **Hero Card**: Highlights the primary match with plain-language reasons.
- **Score Breakdown**: 7 horizontal bars showing subscores for Oxygen, Moisture, Mechanical, Sealability, Shelf-Life, Sustainability, and Cost.
- **Collapsible Technical Accordion**: Advanced users can inspect OTR, WVTR, thickness, triggered rule IDs (R001–R008), and literature citations without cluttering the main view.
- **Alternative Match Cards**: Neatly organized cards for Alternative Match, Lower-Cost Alternative, and Sustainability-Oriented Alternative.
- **Compare Page**: Default view features user-friendly columns; clicking "Show Technical Details" toggles OTR, WVTR, thickness, and source references.

---

## 5. Responsive Design & Accessibility
- **WCAG 2.1 AA Compliance**: All text elements achieve a contrast ratio $> 4.5:1$ against their respective backgrounds.
- **Keyboard Navigation**: Focus outlines and a skip-to-content link are present across all pages.
- **Mobile Friendliness**: Form grids transition smoothly from multi-column desktop layouts to single-column card stacks below 768px with full touch target sizing ($\ge 44 \times 44\text{ px}$).
