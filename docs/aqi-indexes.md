## AirAware-AI: Predefined AQI and Index Data

This document inventories all currently predefined/static AQI and pollutant index data found in the codebase.

### Mock AQI dataset

- **Source**: `src/lib/data.ts`
- **Export**: `mockAqiData`
- **Contents**:
  - **location**: Lahore, Pakistan
  - **aqi**: 180
  - **status**: Unhealthy
  - **statusClassName**: `text-red-600`
  - **pollutants**:
    - PM2.5: value 180, unit `μg/m³`
    - PM10: value 250, unit `μg/m³`
    - O₃: value 75, unit `ppb`
    - NO₂: value 45, unit `ppb`
    - CO: value 9, unit `ppm`
    - SO₂: value 12, unit `ppb`

### Hazard zone thresholds (used in AI prompt)

- **Source**: `src/ai/flows/hazard-zone-detection.ts`
- **Definition location**: within the AI prompt template
- **Thresholds (exceeding any implies hazard zone)**:
  - **PM2.5**: > 50 μg/m³
  - **PM10**: > 100 μg/m³
  - **CO2**: > 1000 ppm
  - **NO2**: > 40 ppb
  - **O3**: > 70 ppb

### AQI comparison example constant

- **Source**: `src/components/dashboard/aqi-insight-card.tsx`
- **Constant**: `previousWeekAqi = 225` (example value used to generate weekly insight)

### AQI categories mention (no scale defined)

- **Source**: `src/components/landing/aqi-explained.tsx`
- **Details**: Mentions categories from "Good" to "Hazardous" and a general explanation, but there is currently no predefined mapping of AQI ranges to category labels or colors in code.

### Image placeholder referencing AQI chart

- **Source**: `src/lib/placeholder-images.json` and `src/lib/placeholder-images.ts`
- **Entry**: `aqiChart` – description: infographic explaining AQI levels from good to hazardous (image only; no scale embedded in code).

### Not found

- No predefined, centralized AQI breakpoint table (e.g., 0–50 Good, 51–100 Moderate, etc.).
- No pollutant-specific AQI computation constants or official index conversion formulas.
- No color palette constants tied to AQI categories (beyond `statusClassName` inside `mockAqiData`).

---

If you want, we can add a centralized AQI category scale and pollutant breakpoint tables to `src/lib/` for reuse across UI and AI flows.


