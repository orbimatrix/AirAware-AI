
import { NextResponse } from 'next/server';

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
      hourly: 'pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi',
      timezone: 'auto',
    });
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Failed to fetch from Open-Meteo: ${text}` }, { status: res.status });
    }
    const data = await res.json();

    const hourly = data?.hourly;
    const times: string[] = hourly?.time || [];
    if (times.length === 0) {
      return NextResponse.json({ error: 'No air quality data available.' }, { status: 404 });
    }
    
    // Find the latest valid index. Sometimes the last entry might be null.
    let idx = -1;
    for (let i = times.length - 1; i >= 0; i--) {
        if (hourly.european_aqi?.[i] != null) {
            idx = i;
            break;
        }
    }

    if (idx === -1) {
        return NextResponse.json({ error: 'No valid recent air quality data found.' }, { status: 404 });
    }


    // Return in a shape compatible with existing hook
    const response = {
      list: [
        {
          dt: Math.floor(new Date(times[idx]).getTime() / 1000),
          main: { aqi: hourly.european_aqi?.[idx] ?? 0 },
          components: {
            pm2_5: hourly.pm2_5?.[idx] ?? null,
            pm10: hourly.pm10?.[idx] ?? null,
            co: hourly.carbon_monoxide?.[idx] ?? null,
            no2: hourly.nitrogen_dioxide?.[idx] ?? null,
            so2: hourly.sulphur_dioxide?.[idx] ?? null,
            o3: hourly.ozone?.[idx] ?? null,
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
