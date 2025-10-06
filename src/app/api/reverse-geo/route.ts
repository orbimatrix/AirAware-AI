
import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export async function GET(req: Request) {
  if (!API_KEY) {
    console.error("NEXT_PUBLIC_OPENWEATHER_API_KEY is not set. This key is required for reverse geocoding.");
    return NextResponse.json({ error: 'Server configuration error: The OpenWeatherMap API key is missing. Please add it to your environment variables.' }, { status: 500 });
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
      console.error("OpenWeatherMap Geocoding API error:", errorBody);
      return NextResponse.json({ error: `Failed to fetch from OpenWeatherMap Geocoding: ${errorBody.message}` }, { status: apiRes.status });
    }

    const data = await apiRes.json();
    return NextResponse.json(data);

  } catch (err: any) {
    console.error("Error in reverse-geo API route:", err);
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
