// Test Open-Meteo Air Quality API and compute US EPA AQI from PM2.5/PM10
// Usage: node scripts/test-openmeteo-aqi.js "Lahore, PK"
//        node scripts/test-openmeteo-aqi.js "31.5204,74.3587"

const input = process.argv[2] || 'Lahore, PK';

function parseLatLon(q) {
  const m = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  return m ? { lat: parseFloat(m[1]), lon: parseFloat(m[2]) } : null;
}

async function geocodeCity(q) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed ${res.status}`);
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) throw new Error(`City not found: ${q}`);
  return { lat: r.latitude, lon: r.longitude, label: `${r.name}, ${r.admin1 || ''}, ${r.country_code || ''}`.replace(/,\s*,/g, ',').trim() };
}

async function fetchOpenMeteo(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'pm2_5,pm10',
    timezone: 'auto',
  });
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  return res.json();
}

// EPA AQI breakpoints for PM
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
};

function linearAqi(c, bp) {
  const seg = bp.find(b => c >= b.cLow && c <= b.cHigh);
  if (!seg) return null;
  return Math.round(((seg.iHigh - seg.iLow) / (seg.cHigh - seg.cLow)) * (c - seg.cLow) + seg.iLow);
}

function computeAqi(pm25, pm10) {
  const parts = [];
  if (typeof pm25 === 'number') parts.push({ pollutant: 'pm25', aqi: linearAqi(pm25, BREAKPOINTS.pm25) });
  if (typeof pm10 === 'number') parts.push({ pollutant: 'pm10', aqi: linearAqi(pm10, BREAKPOINTS.pm10) });
  const valid = parts.filter(p => typeof p.aqi === 'number');
  if (valid.length === 0) return { aqi: null, dominant: null, subIndices: parts };
  const dominant = valid.sort((a, b) => b.aqi - a.aqi)[0];
  return { aqi: dominant.aqi, dominant: dominant.pollutant, subIndices: valid };
}

(async () => {
  try {
    let loc = parseLatLon(input);
    if (!loc) loc = await geocodeCity(input);
    console.log(`Testing Open-Meteo near: ${loc.label || `${loc.lat},${loc.lon}`}`);

    const data = await fetchOpenMeteo(loc.lat, loc.lon);
    const times = data?.hourly?.time || [];
    const pm25 = data?.hourly?.pm2_5 || [];
    const pm10 = data?.hourly?.pm10 || [];
    if (times.length === 0) {
      console.log('No Open-Meteo hourly data.');
      return;
    }
    // Take last hour available
    const idx = times.length - 1;
    const pm25Val = pm25[idx];
    const pm10Val = pm10[idx];
    const aqi = computeAqi(pm25Val, pm10Val);
    console.log(`Hour: ${times[idx]}`);
    console.log(`PM2.5: ${pm25Val} µg/m³, PM10: ${pm10Val} µg/m³`);
    console.log('Computed EPA AQI:', aqi);
  } catch (e) {
    console.error('Open-Meteo test failed:', e?.message || e);
    process.exitCode = 1;
  }
})();


