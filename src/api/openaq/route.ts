// app/api/openaq/route.ts
import { NextResponse } from 'next/server';

type Measurements = {
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  o3?: number | null;
  so2?: number | null;
  co?: number | null;
};

const OPENAQ_KEY = process.env.OPENAQ_API_KEY;
if (!OPENAQ_KEY) {
  // Note: Next.js won't stop building, but requests will fail with 500.
  console.warn('OPENAQ_API_KEY not set in env');
}

// --- US EPA AQI breakpoints for PM2.5 and PM10 ---
// Source: EPA breakpoint tables — implemented for PM2.5 (µg/m³) and PM10 (µg/m³).
// We'll compute individual pollutant AQIs and take the maximum.
const AQI_BREAKPOINTS = {
  pm25: [
    { cLo: 0.0, cHi: 12.0, iLo: 0, iHi: 50 },
    { cLo: 12.1, cHi: 35.4, iLo: 51, iHi: 100 },
    { cLo: 35.5, cHi: 55.4, iLo: 101, iHi: 150 },
    { cLo: 55.5, cHi: 150.4, iLo: 151, iHi: 200 },
    { cLo: 150.5, cHi: 250.4, iLo: 201, iHi: 300 },
    { cLo: 250.5, cHi: 350.4, iLo: 301, iHi: 400 },
    { cLo: 350.5, cHi: 500.4, iLo: 401, iHi: 500 },
  ],
  pm10: [
    { cLo: 0, cHi: 54, iLo: 0, iHi: 50 },
    { cLo: 55, cHi: 154, iLo: 51, iHi: 100 },
    { cLo: 155, cHi: 254, iLo: 101, iHi: 150 },
    { cLo: 255, cHi: 354, iLo: 151, iHi: 200 },
    { cLo: 355, cHi: 424, iLo: 201, iHi: 300 },
    { cLo: 425, cHi: 504, iLo: 301, iHi: 400 },
    { cLo: 505, cHi: 604, iLo: 401, iHi: 500 },
  ],
};

function calcAQIForPollutant(value: number, breakpoints: Array<any>) {
  if (value == null || Number.isNaN(value)) return null;
  for (const bp of breakpoints) {
    if (value >= bp.cLo && value <= bp.cHi) {
      // linear interpolation
      const { cLo, cHi, iLo, iHi } = bp;
      const aqi = ((iHi - iLo) / (cHi - cLo)) * (value - cLo) + iLo;
      return Math.round(aqi);
    }
  }
  // value out of range — if > highest breakpoint, compute above
  const last = breakpoints[breakpoints.length - 1];
  if (value > last.cHi) {
    // extrapolate (cautious)
    const { cLo, cHi, iLo, iHi } = last;
    const slope = (iHi - iLo) / (cHi - cLo);
    const aqi = slope * (value - cLo) + iLo;
    return Math.round(aqi);
  }
  return null;
}

async function fetchNearestLocation(lat: string, lon: string) {
  const url = `https://api.openaq.org/v3/locations?coordinates=${lat},${lon}&radius=20000&limit=1&sort=distance`;
  const res = await fetch(url, {
    headers: { 'X-API-Key': OPENAQ_KEY ?? '' },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.results || json.results.length === 0) return null;
  return json.results[0];
}

async function fetchLocationLatest(locationId: number) {
  const url = `https://api.openaq.org/v3/locations/${locationId}/latest`;
  const res = await fetch(url, {
    headers: { 'X-API-Key': OPENAQ_KEY ?? '' },
  });
  if (!res.ok) return null;
  const json = await res.json();
  // json.results is array — but for a specific location id it returns an array with that location
  return json.results?.[0] ?? null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    if (!lat || !lon) return NextResponse.json({ error: 'lat & lon required' }, { status: 400 });

    // 1) find nearest location
    const loc = await fetchNearestLocation(lat, lon);
    if (!loc) return NextResponse.json({ error: 'no location found near coordinates' }, { status: 404 });

    // 2) fetch latest measurements for that location (requires X-API-Key)
    const latest = await fetchLocationLatest(loc.id);
    if (!latest) return NextResponse.json({ error: 'no latest data for location' }, { status: 404 });

    // 3) extract measurements
    const measurements = {} as Measurements;
    // latest.parameters or latest?.measurements depending on provider; openaq v3 latest returns 'parameters' or 'measurements'
    const params = latest?.parameters ?? latest?.measurements ?? [];
    for (const p of params) {
      // p.parameter names are e.g. 'pm25','pm10','no2','o3','so2','co'
      const name = p.parameter ?? p.parameter?.name ?? p.parameter; // defensive
      const value = p.lastValue ?? p.value ?? p.lastValue?.value ?? p.value;
      const v = typeof value === 'object' ? value.value ?? null : value;
      if (!v && v !== 0) continue;
      if (name === 'pm25' || name === 'pm2_5' || name === 'pm2.5') measurements.pm25 = Number(v);
      if (name === 'pm10') measurements.pm10 = Number(v);
      if (name === 'no2') measurements.no2 = Number(v);
      if (name === 'o3') measurements.o3 = Number(v);
      if (name === 'so2') measurements.so2 = Number(v);
      if (name === 'co') measurements.co = Number(v);
    }

    // 4) compute AQIs (using US EPA method for PM2.5 and PM10 here)
    const aqiPm25 = measurements.pm25 != null ? calcAQIForPollutant(measurements.pm25, AQI_BREAKPOINTS.pm25) : null;
    const aqiPm10 = measurements.pm10 != null ? calcAQIForPollutant(measurements.pm10, AQI_BREAKPOINTS.pm10) : null;

    // For gases you could implement breakpoints similarly (not included here).
    const pollutantAQIs = [
      aqiPm25 ? { pollutant: 'pm2.5', value: aqiPm25 } : null,
      aqiPm10 ? { pollutant: 'pm10', value: aqiPm10 } : null,
    ].filter(Boolean) as Array<{ pollutant: string; value: number }>;

    const overallAQI = pollutantAQIs.length ? Math.max(...pollutantAQIs.map((p) => p.value)) : null;
    const dominant = pollutantAQIs.length ? pollutantAQIs.reduce((a, b) => (a.value >= b.value ? a : b)) : null;

    const payload = {
      source: 'OpenAQ',
      location: { id: loc.id, name: loc.name, coordinates: loc.coordinates },
      measurements,
      aqi: {
        overall: overallAQI,
        dominantPollutant: dominant?.pollutant ?? null,
        byPollutant: pollutantAQIs,
        method: 'US-EPA (computed locally from pm2.5/pm10 breakpoints)',
      },
      rawLocationLatest: latest, // optional: remove in production to save bandwidth
    };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
