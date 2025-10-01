## API usage: Air quality, weather, and carbon data

This document maps external APIs to the data they provide and where we can use them in the app. It also notes free tiers and key constraints so we can pick a primary + fallback combination per feature.

### App features and required data

- **Dashboard (current AQI + pollutants)**: city/lat-lon current AQI, pollutant concentrations (PM2.5, PM10, O3, NO2, SO2, CO), optional category and color.
- **Dashboard insight (week-over-week)**: previous week AQI (historical) and current AQI.
- **Hazard zones**: current pollutant concentrations vs thresholds; optional forecast for near-future alerting.
- **Personalized recommendations**: current AQI and category; optionally sensitive-group guidance.
- **Eco-map reports**: we collect user reports; optionally overlay official station AQI nearby.
- **Carbon footprint**: activity-to-emission factors; not AQI.
- **Education**: any reference endpoints for definitions are optional.

### Quick recommendations

- **Primary (Global, generous free, open data)**: OpenAQ for measurements + station metadata (real-time and historical by location).
- **Primary (Simple by lat/lon, current+forecast)**: OpenWeatherMap Air Pollution API (easy lat/lon, 5-day forecast, paid key, generous free tier).
- **Premium option**: Google Air Quality API or Tomorrow.io for hyperlocal coverage and health recommendations.
- **Carbon footprint**: Climatiq for activity-based emissions; MyClimate as alternative.

### Capability matrix

| API | Current AQI | Pollutant concentrations | Forecast AQI | Historical | Health recommendations | Coverage | Notes/keys |
|---|---|---|---|---|---|---|---|
| OpenAQ | Via sources (city/station AQI variants) | Yes (PM2.5, PM10, O3, NO2, SO2, CO…) | Limited (varies by source) | Yes | No | Global (aggregated) | Free, API key required, open data, rich metadata |
| OpenWeatherMap Air Pollution | Yes (index) | Yes (CO, NO, NO2, O3, SO2, PM2.5, PM10, NH3) | Yes (5-day) | Yes | No | Global | Paid key; simple lat/lon queries |
| IQAir (AirVisual) | Yes | Yes | Yes | Yes | Basic guidance | Global | Paid key; city/station/geo endpoints |
| Tomorrow.io | Yes | Yes | Yes | Yes | Yes | Global (hyperlocal) | Paid; powerful fields & insights |
| Google Air Quality API | Yes (multi-standard) | Yes | Yes (hourly) | Limited | Yes (sensitive groups) | 100+ countries | Paid; high-res grid (≈500m) via Maps Platform |
| Weatherbit | Yes | Yes | Yes | Yes | Limited | Global | Paid; weather + AQ endpoints |
| Visual Crossing | Indirect (AQ fields vary) | Some | Yes | Yes | No | Global | Paid; strong historical focus |
| Open-Meteo Air Quality | Indices and conc. | Yes | Yes (up to 16 days) | Yes | No | Global | Free; no key required; model-based |
| AirNow (US) | Yes | Yes | Yes | Yes | Guidance | US | Free for US; good official coverage |
| Climatiq (Carbon) | N/A | N/A | N/A | N/A | N/A | Global | Paid key; emission factors and calc |
| MyClimate (Carbon) | N/A | N/A | N/A | N/A | N/A | Global | Offsetting and calculators |

### Where each API fits in our app

- **Dashboard current AQI + pollutants**
  - Best: OpenWeatherMap (simple lat/lon current endpoint) or OpenAQ (station/nearest data). Google/Tomorrow.io for premium fidelity.
  - Fields used: AQI, PM2.5, PM10, O3, NO2, SO2, CO (+ units) → `AqiSummaryCard`, `PollutantGrid`/`PollutantCard`.

- **Dashboard insight (week-over-week)**
  - Best: OpenAQ (historical measurements), OpenWeatherMap (historical endpoint).
  - Fields used: current AQI, previous week AQI → `AqiInsightCard` replacement for `previousWeekAqi` constant.

- **Hazard zones (threshold checks)**
  - Best: OpenWeatherMap current + forecast; OpenAQ current. Google/Tomorrow.io for fine-grained forecasts.
  - Fields used: PM2.5, PM10, O3, NO2, CO(+CO2 if provided), forecast windows → `hazard-zone-detection` flow inputs.

- **Personalized recommendations**
  - Best: Google Air Quality API (provides categories and sensitive-group guidance), Tomorrow.io insights, or derive from AQI category with our own rules.
  - Fields used: AQI, category, sensitive-group flags → `personalized-health-recommendations` flow.

- **Eco-map overlays**
  - Best: OpenAQ station locations + last values; WAQI tiles/widgets (if allowed) as a visual fallback.
  - Fields used: station coordinates, latest pollutant values → `components/eco-map`.

- **Carbon footprint**
  - Best: Climatiq (activity-based emission factors); MyClimate for offset options.
  - Fields used: emission factors per activity → `ai/flows/carbon-footprint-calculator` and `components/carbon-footprint`.

### Typical endpoints and example requests

- **OpenAQ (v3)**
  - Measurements near lat/lon: `/v3/measurements?coordinates={lat},{lon}&radius=10000&parameter=pm25,pm10,o3,no2,so2,co&limit=100`
  - Latest by city: `/v3/latest?city={City}&parameter=pm25,pm10,o3,no2,so2,co`
  - Historical by date: `/v3/measurements?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&city={City}&parameter=pm25`

- **OpenWeatherMap Air Pollution**
  - Current: `/data/2.5/air_pollution?lat={lat}&lon={lon}`
  - Forecast (5-day): `/data/2.5/air_pollution/forecast?lat={lat}&lon={lon}`
  - Historical: `/data/2.5/air_pollution/history?lat={lat}&lon={lon}&start={unix}&end={unix}`

- **IQAir AirVisual**
  - Nearest city: `/v2/nearest_city?lat={lat}&lon={lon}`
  - City by name: `/v2/city?city={city}&state={state}&country={country}`

- **Tomorrow.io (v4)**
  - Timelines: `/v4/timelines?location={lat},{lon}&fields=pm25,pm10,no2,o3,so2,co,epaAqi,epaAqiHealthConcern&timesteps=current,1h,1d`

- **Google Air Quality API**
  - Air Quality (Places/Maps Platform): `airQuality:lookup` with location, returns multiple AQIs, pollutants, categories, health recs (server-side via Maps Platform).

- **Weatherbit**
  - Current air quality: `/v2.0/current/airquality?lat={lat}&lon={lon}`
  - Forecast/historical variants available per plan.

- **Open-Meteo Air Quality**
  - Forecast grid: `/v1/air-quality?latitude={lat}&longitude={lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi`

- **Climatiq**
  - Estimate: `POST /estimate` with activity `emission_factor` and parameters.

### Integration choices per environment

- **MVP free/open**: OpenAQ for measurements + Open-Meteo forecasts; Climatiq (trial) for carbon.
- **Production simple**: OpenWeatherMap for current/forecast via lat/lon; OpenAQ as fallback; Climatiq for carbon.
- **Premium**: Google Air Quality + Tomorrow.io for guidance and hyperlocal forecasts.

### Keys, rate limits, and licensing

- OpenAQ: free, API key required, open data licensing varies by source (review per use).
- OpenWeatherMap: API key; free tier with rate limits; commercial plans available.
- IQAir/Tomorrow.io/Google/Weatherbit/Visual Crossing: commercial APIs with rate limits and paid plans.
- Open-Meteo: free, no API key; model-based forecasts.
- Climatiq/MyClimate: API keys; paid plans.

### Data-to-component mapping

- `src/components/dashboard/aqi-summary-card.tsx`: AQI value, category → from OpenWeatherMap/OpenAQ/Google.
- `src/components/dashboard/pollutant-grid.tsx` + `pollutant-card.tsx`: pollutant concentrations → any AQ provider.
- `src/components/dashboard/aqi-insight-card.tsx`: current + previous week AQI → OpenAQ or OpenWeatherMap historical.
- `src/ai/flows/hazard-zone-detection.ts`: current pollutants + forecast → OpenWeatherMap/Tomorrow.io/Google.
- `src/ai/flows/personalized-health-recommendations.ts`: AQI + category + guidance → Google/Tomorrow.io or derive from provider AQI.
- `src/ai/flows/carbon-footprint-calculator.ts`: emissions factors → Climatiq/MyClimate.


