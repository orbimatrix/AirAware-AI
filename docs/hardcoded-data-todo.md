## Hardcoded data TODO checklist

Tick each item as we replace hardcoded values with live API data or persisted sources.

### src/lib/data.ts

- [ ] `mockAqiData.location` (e.g., Lahore, Pakistan)
- [ ] `mockAqiData.aqi`
- [ ] `mockAqiData.status`
- [ ] `mockAqiData.statusClassName`
- [ ] `mockAqiData.pollutants[PM2.5].value`
- [ ] `mockAqiData.pollutants[PM2.5].unit`
- [ ] `mockAqiData.pollutants[PM10].value`
- [ ] `mockAqiData.pollutants[PM10].unit`
- [ ] `mockAqiData.pollutants[O₃].value`
- [ ] `mockAqiData.pollutants[O₃].unit`
- [ ] `mockAqiData.pollutants[NO₂].value`
- [ ] `mockAqiData.pollutants[NO₂].unit`
- [ ] `mockAqiData.pollutants[CO].value`
- [ ] `mockAqiData.pollutants[CO].unit`
- [ ] `mockAqiData.pollutants[SO₂].value`
- [ ] `mockAqiData.pollutants[SO₂].unit`
- [ ] `mockChallenges[*]` (title, description, points, icon)
- [ ] `mockBadges[*]` (name, description, icon)
- [ ] `mockLeaderboard[*]` (rank, name, score, avatarUrl, avatarFallback, earnedBadges)

### src/ai/flows/hazard-zone-detection.ts

- [ ] Threshold: PM2.5 > 50 μg/m³ (move to config/constants or derive from provider)
- [ ] Threshold: PM10 > 100 μg/m³
- [ ] Threshold: CO2 > 1000 ppm
- [ ] Threshold: NO2 > 40 ppb
- [ ] Threshold: O3 > 70 ppb

### src/components/dashboard/aqi-insight-card.tsx

- [ ] `previousWeekAqi = 225` (replace with historical API value)

### src/components/landing/features.tsx

- [ ] `features[]` titles/descriptions (optional CMS/config)

### src/lib/placeholder-images.json

- [ ] `placeholderImages[*].imageUrl` (optional CMS/config or keep static)
- [ ] `placeholderImages[*].description`

### src/components/eco-map/report-form.tsx

- [ ] Report types list: "Illegal Trash Dumping", "Visible Air/Water Pollution", "Other" (consider config)
- [ ] Lahore bounding box clamp (31.3–31.6, 74.1–74.5) (use real geofence or remove)

### src/hooks/use-footprint-history.ts

- [ ] LocalStorage key `footprintHistory` (OK to keep; replace with backend when API exists)

### src/ai/flows/personalized-health-recommendations.ts

- [ ] Health guidance examples in prompt (replace/augment with provider guidance if using Google/Tomorrow.io)

### src/ai/flows/report-severity-classifier.ts

- [ ] Severity rubric examples in prompt (optional to move to config)

### Future constants to centralize (not yet present)

- [ ] AQI category breakpoints and colors (Good→Hazardous)
- [ ] Pollutant-specific breakpoints and units

---

How to use this list:
- Reference `docs/api-usage.md` to select providers per feature.
- When wiring an API value, tick the corresponding box and link the commit.


