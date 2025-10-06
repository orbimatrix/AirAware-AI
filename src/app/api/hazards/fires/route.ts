import { NextResponse } from 'next/server';

// This API route proxies NASA FIRMS data.
// An API key from https://firms.modaps.eosdis.nasa.gov/api/api_key/ is required.

const API_KEY = process.env.NASA_API_KEY;
const SOURCE = 'VIIRS_SNPP_NRT';
const AREA = 'world';
const TIME_RANGE = '24'; // hours

// Corrected API URL structure for CSV data
const FIRMS_API_URL = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${API_KEY}/${SOURCE}/${AREA}/${TIME_RANGE}`;

export async function GET() {
    if (!API_KEY) {
        console.error("NASA_API_KEY is not set in environment variables.");
        return NextResponse.json(
            { error: 'Server configuration error: NASA API key is missing.' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(FIRMS_API_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch FIRMS data: ${response.status} ${errorText}`);
            return NextResponse.json(
                { error: `Failed to fetch FIRMS data: ${errorText}` },
                { status: response.status }
            );
        }
        
        const csvData = await response.text();
        const lines = csvData.trim().split('\n');
        
        if (lines.length <= 1) {
            return NextResponse.json({ type: 'FeatureCollection', features: [] });
        }

        const headers = lines[0].split(',').map(h => h.trim());

        const features = lines.slice(1).map(line => {
            const values = line.split(',');
            if (values.length < headers.length) return null;

            const entry: {[key: string]: any} = {};
            headers.forEach((header, i) => {
                entry[header] = values[i];
            });

            const latitude = parseFloat(entry.latitude);
            const longitude = parseFloat(entry.longitude);
            
            if (isNaN(latitude) || isNaN(longitude)) return null;
            
            if (entry.confidence) {
                entry.confidence = parseInt(entry.confidence, 10);
            }

            return {
                type: 'Feature' as const,
                properties: entry,
                geometry: {
                    type: 'Point' as const,
                    coordinates: [longitude, latitude]
                }
            };
        }).filter((feature): feature is NonNullable<typeof feature> => feature !== null);

        const geojsonData = {
            type: 'FeatureCollection' as const,
            features: features
        };

        return NextResponse.json(geojsonData);

    } catch (error: any) {
        console.error("Error proxying FIRMS data:", error);
        return NextResponse.json(
            { error: 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}
