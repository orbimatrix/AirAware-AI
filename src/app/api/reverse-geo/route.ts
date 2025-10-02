import { NextResponse } from 'next/server';

const API_KEY = process.env.OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.warn("OPENWEATHER_API_KEY is not set in the environment variables.");
}

export async function GET(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Server configuration error: API key is missing.' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required.' }, { status: 400 });
    }

    const apiUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    
    const apiRes = await fetch(apiUrl);

    if (!apiRes.ok) {
      const errorBody = await apiRes.json();
      return NextResponse.json({ error: `Failed to fetch from OpenWeatherMap Geocoding: ${errorBody.message}` }, { status: apiRes.status });
    }

    const data = await apiRes.json();
    return NextResponse.json(data);

  } catch (err: any) {
    console.error("Error in reverse-geo API route:", err);
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
