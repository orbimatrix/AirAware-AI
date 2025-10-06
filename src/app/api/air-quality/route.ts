import { NextResponse } from 'next/server';

// Compute US EPA AQI from PM2.5/PM10 (µg/m³)
function linearAqi(c: number, bp: { cLow: number; cHigh: number; iLow: number; iHigh: number }[]) {
  const seg = bp.find((b) => c >= b.cLow && c <= b.cHigh);
  if (!seg) return null;
  return Math.round(((seg.iHigh - seg.iLow) / (seg.cHigh - seg.cLow)) * (c - seg.cLow) + seg.iLow);
}

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required.' }, { status: 400 });
    }

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      hourly: 'pm2_5,pm10',
      timezone: 'auto',
    });
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Failed to fetch from Open-Meteo: ${text}` }, { status: res.status });
    }
    const data = await res.json();

    const times: string[] = data?.hourly?.time || [];
    const pm25Arr: number[] = data?.hourly?.pm2_5 || [];
    const pm10Arr: number[] = data?.hourly?.pm10 || [];
    if (times.length === 0) {
      return NextResponse.json({ error: 'No air quality data available.' }, { status: 404 });
    }
    const idx = times.length - 1;
    const pm25 = typeof pm25Arr[idx] === 'number' ? pm25Arr[idx] : undefined;
    const pm10 = typeof pm10Arr[idx] === 'number' ? pm10Arr[idx] : undefined;

    const sub: { pollutant: 'pm25' | 'pm10'; aqi: number | null }[] = [];
    if (typeof pm25 === 'number') sub.push({ pollutant: 'pm25', aqi: linearAqi(pm25, BREAKPOINTS.pm25) });
    if (typeof pm10 === 'number') sub.push({ pollutant: 'pm10', aqi: linearAqi(pm10, BREAKPOINTS.pm10) });
    const valid = sub.filter((s) => typeof s.aqi === 'number') as { pollutant: 'pm25' | 'pm10'; aqi: number }[];
    const overall = valid.length > 0 ? valid.sort((a, b) => b.aqi - a.aqi)[0].aqi : 0;

    // Return in a shape compatible with existing hook
    const response = {
      list: [
        {
          dt: Math.floor(new Date(times[idx]).getTime() / 1000),
          main: { aqi: overall },
          components: {
            pm2_5: pm25 ?? null,
            pm10: pm10 ?? null,
          },
        },
      ],
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Error in air-quality API route:', err);
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
