import { NextResponse } from 'next/server';
import { cities } from '@/lib/cities';

const API_KEY = process.env.OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.warn("OPENWEATHER_API_KEY is not set in the environment variables.");
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Server configuration error: API key is missing.' }, { status: 500 });
  }

  try {
    const allWarnings = [];

    for (const city of cities) {
      const { lat, lon } = city;
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,current&appid=${API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch warnings for ${city.name}: ${response.statusText}`);
        continue; // Skip this city on failure
      }
      
      const data = await response.json();
      
      if (data.alerts && data.alerts.length > 0) {
        for (const alert of data.alerts) {
          allWarnings.push({
            city: city.name,
            lat: lat,
            lon: lon,
            sender_name: alert.sender_name,
            event: alert.event,
            start: new Date(alert.start * 1000).toISOString(),
            end: new Date(alert.end * 1000).toISOString(),
            description: alert.description,
          });
        }
      }
    }

    return NextResponse.json(allWarnings);

  } catch (err: any) {
    console.error("Error in weather warnings API route:", err);
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
