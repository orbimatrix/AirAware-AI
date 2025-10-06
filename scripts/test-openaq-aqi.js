// Test OpenAQ measurements and compute US EPA AQI for given city or lat,lon
// Usage:
//   OPENAQ_API_KEY=... node scripts/test-openaq-aqi.js "Lahore, PK"
//   node scripts/test-openaq-aqi.js "31.5204,74.3587"

let OPENAQ_API_KEY = process.env.OPENAQ_API_KEY;
if (!OPENAQ_API_KEY) {
  // Load from .env if present
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i === -1) continue;
        const k = t.slice(0, i).trim();
        let v = t.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!process.env[k]) process.env[k] = v;
      }
      OPENAQ_API_KEY = process.env.OPENAQ_API_KEY;
    }
  } catch {}
}
if (!OPENAQ_API_KEY) {
  console.error('Missing OPENAQ_API_KEY in env or .env');
  process.exit(1);
}

const query = process.argv[2] || 'Lahore, PK';

function parseLatLon(q) {
  const m = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  return m ? { lat: parseFloat(m[1]), lon: parseFloat(m[2]) } : null;
}

async function geocodeCity(q) {
  // Use Open-Meteo geocoding (free) to get lat/lon for city names
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed ${res.status}`);
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) throw new Error(`City not found: ${q}`);
  return { lat: r.latitude, lon: r.longitude, label: `${r.name}, ${r.admin1 || ''}, ${r.country_code || ''}`.replace(/,\s*,/g, ',').trim() };
}

async function fetchOpenAq(lat, lon) {
  // OpenAQ latest values near lat/lon (simpler, fewer params)
  const params = new URLSearchParams({
    coordinates: `${lat},${lon}`,
    radius: '10000',
    parameters: 'pm25,pm10',
    limit: '50',
  });
  const url = `https://api.openaq.org/v3/latest?${params.toString()}`;
  const res = await fetch(url, { headers: { 'X-API-Key': OPENAQ_API_KEY } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAQ HTTP ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data?.results || [];
}

// EPA AQI breakpoints (µg/m³ for PM)
const BREAKPOINTS = {
  pm25: [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
    { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 },
  ],
  // We will compute from PM only to avoid unit conversion errors for gases
};

function linearAqi(c, bp) {
  const seg = bp.find(b => c >= b.cLow && c <= b.cHigh);
  if (!seg) return null;
  return Math.round(((seg.iHigh - seg.iLow) / (seg.cHigh - seg.cLow)) * (c - seg.cLow) + seg.iLow);
}

function computeAqiFromConcentrations(conc) {
  const sub = [];
  if (typeof conc.pm25 === 'number') sub.push({ pollutant: 'pm25', aqi: linearAqi(conc.pm25, BREAKPOINTS.pm25) });
  if (typeof conc.pm10 === 'number') sub.push({ pollutant: 'pm10', aqi: linearAqi(conc.pm10, BREAKPOINTS.pm10) });
  if (typeof conc.o3 === 'number') {
    const o3ppm = conc.o3 / 1000; // µg/m³ to mg/m³? Note: OpenAQ may report µg/m³; proper conversion to ppm requires temp/pressure; use µg/m³→ppb via molecular weights typically. For simplicity, skip if units unknown.
    sub.push({ pollutant: 'o3', aqi: linearAqi(o3ppm, BREAKPOINTS.o3_8h) });
  }
  if (typeof conc.no2 === 'number') sub.push({ pollutant: 'no2', aqi: linearAqi(conc.no2, BREAKPOINTS.no2) });
  if (typeof conc.so2 === 'number') sub.push({ pollutant: 'so2', aqi: linearAqi(conc.so2, BREAKPOINTS.so2) });
  if (typeof conc.co === 'number') {
    const coppm = conc.co / 1000; // µg/m³ rough to mg/m³; EPA uses ppm; this is approximate
    sub.push({ pollutant: 'co', aqi: linearAqi(coppm, BREAKPOINTS.co) });
  }
  const valid = sub.filter(s => typeof s.aqi === 'number');
  if (valid.length === 0) return { aqi: null, dominant: null, subIndices: sub };
  const dominant = valid.sort((a, b) => b.aqi - a.aqi)[0];
  return { aqi: dominant.aqi, dominant: dominant.pollutant, subIndices: valid };
}

function aggregateLatest(results) {
  // Pick the first entry per parameter from latest endpoint
  const latest = {};
  for (const loc of results) {
    for (const m of loc.parameters || []) {
      const p = m.parameter;
      if (!p) continue;
      if (!latest[p]) {
        latest[p] = { value: m.value, unit: m.unit, time: new Date(m.lastUpdated) };
      }
    }
  }
  return latest;
}

(async () => {
  try {
    let loc = parseLatLon(query);
    if (!loc) loc = await geocodeCity(query);
    console.log(`Testing OpenAQ near: ${loc.label || `${loc.lat},${loc.lon}`}`);

    const measurements = await fetchOpenAq(loc.lat, loc.lon);
    if (measurements.length === 0) {
      console.log('No OpenAQ measurements found nearby.');
      return;
    }
    const latest = aggregateLatest(measurements);
    const conc = {
      pm25: latest.pm25?.value,
      pm10: latest.pm10?.value,
      o3: latest.o3?.value,
      no2: latest.no2?.value,
      so2: latest.so2?.value,
      co: latest.co?.value,
    };
    const aqi = computeAqiFromConcentrations(conc);
    console.log('Latest concentrations:', latest);
    console.log('Computed AQI:', aqi);
  } catch (e) {
    console.error('OpenAQ test failed:', e?.message || e);
    process.exitCode = 1;
  }
})();


