# Storage Condition Monitoring & Condition Assessment

## Overview

The `StorageMonitor` engine is an analytical service that assesses real-time telemetry against the baseline storage assumptions established during packaging recommendation analysis.

---

## 1. Baseline Assumptions vs. Observed Conditions

A food packaging recommendation is formulated around specific storage assumptions:
- **Baseline Temperature ($T_{\text{target}}$):** e.g. Chilled $4.0^\circ\text{C}$, Frozen $-18.0^\circ\text{C}$, Ambient $20.0^\circ\text{C}$.
- **Baseline Humidity ($\text{RH}_{\text{target}}$):** e.g. $85.0\%$, $60.0\%$.
- **Storage Type:** e.g. Refrigerated, Frozen, Ambient, Controlled Atmosphere.

When sensory telemetry reports real-world warehousing values ($T_{\text{obs}}, \text{RH}_{\text{obs}}$), the system computes deviations:

$$\Delta T = T_{\text{obs}} - T_{\text{target}}$$
$$\Delta \text{RH} = \text{RH}_{\text{obs}} - \text{RH}_{\text{target}}$$

---

## 2. Condition Evaluation Matrix

The system categorizes conditions into four discrete operational states:

| Condition State | Trigger Criteria | Plain-English System Advisory |
|:---|:---|:---|
| **NORMAL** | $|\Delta T| \le 2.0^\circ\text{C}$ AND $|\Delta \text{RH}| \le 8.0\%$ | *"Current conditions remain compatible with the assumptions used during packaging analysis."* |
| **WATCH** | $2.0^\circ\text{C} < |\Delta T| \le 5.0^\circ\text{C}$ OR $8.0\% < |\Delta \text{RH}| \le 15.0\%$ | *"Storage conditions show moderate variance. Monitor trend to verify stability."* |
| **WARNING** | $|\Delta T| > 5.0^\circ\text{C}$ OR $|\Delta \text{RH}| > 15.0\%$ OR Thermal Abuse ($T_{\text{obs}} > 8.0^\circ\text{C}$ for refrigerated, $T_{\text{obs}} > -10.0^\circ\text{C}$ for frozen) | *"Storage condition requires review. Environmental parameters have shifted beyond the envelope assumed during packaging analysis."* |
| **UNKNOWN** | Sensor offline, missing data, or uninitialized sensor values | *"Sensor telemetry is currently unavailable. No readings recorded within active monitoring window."* |

---

## 3. Scientific Integrity & Non-Defamation Guardrails

> [!IMPORTANT]
> **Defamation & Safety Statement**:
> The IoT storage monitor is an **engineering deviation indicator**, not a microbial testing laboratory.
> - The system **NEVER** claims: `"Food is spoiled"`.
> - The system **NEVER** claims: `"Food has become unsafe to eat"`.
> - The system **NEVER** fabricates microbial growth curves without experimental validation.
>
> Instead, deviations are surfaced objectively:  
> **"Storage condition requires review — observed temperature deviates from analysis baseline."**

---

## 4. Reassessment Workflow

When environmental conditions deviate significantly (e.g. ambient warehouse temperature reaches $12^\circ\text{C}$ instead of $4^\circ\text{C}$):
1. The original recommendation record remains **strictly unmodified** as a permanent audit trail.
2. The user can click the **"Reassess Conditions"** button on `/monitor`.
3. The application loads the original food commodity parameters (moisture, fat, pH, respiration, target shelf life) and substitutes the **live observed temperature and humidity**.
4. A new packaging recommendation is computed and persisted with a new ID (`#ID+1`), allowing side-by-side comparison between initial and reassessed packaging solutions.
