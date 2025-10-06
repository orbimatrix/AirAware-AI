import { NextResponse } from 'next/server';

// This API route proxies the NASA FIRMS data to avoid client-side CORS issues
// and to keep any sensitive information (like API keys in the future) on the server.

// Source: VIIRS S-NPP (Suomi National Polar-orbiting Partnership)
// Region: Global
// Timespan: Last 24 hours
const FIRMS_API_URL = 'https://firms.modaps.eosdis.nasa.gov/api/v1/nrt/viirs-snpp/geojson/24h';

export async function GET() {
    try {
        const response = await fetch(FIRMS_API_URL);

        if (!response.ok) {
            // Pass through the error from the FIRMS API
            return NextResponse.json(
                { error: `Failed to fetch FIRMS data: ${response.statusText}` },
                { status: response.status }
            );
        }

        const geojsonData = await response.json();
        
        // Return the GeoJSON data directly to the client
        return NextResponse.json(geojsonData);

    } catch (error: any) {
        console.error("Error proxying FIRMS data:", error);
        return NextResponse.json(
            { error: 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}
