import { NextResponse } from 'next/server';

// This API route proxies NASA FIRMS data.
// An API key from https://firms.modaps.eosdis.nasa.gov/api/api_key/ is required.

const API_KEY = process.env.NASA_API_KEY;

// Source: VIIRS S-NPP, All world, last 24 hours
const MAP_KEY = 'VIIRS_SNPP_NRT';
const SOURCE = 'VIIRS_SNPP';
const AREA = 'world';
const TIME_RANGE = '24h';

const FIRMS_API_URL = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${API_KEY}/${MAP_KEY}/${AREA}/${TIME_RANGE}`;

export async function GET() {
    if (!API_KEY) {
        console.error("NASA_API_KEY is not set in environment variables.");
        return NextResponse.json(
            { error: 'Server configuration error: NASA API key is missing.' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(FIRMS_API_URL);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch FIRMS data: ${response.status} ${errorText}`);
            return NextResponse.json(
                { error: `Failed to fetch FIRMS data: ${errorText}` },
                { status: response.status }
            );
        }
        
        // The API returns CSV, so we need to convert it to GeoJSON
        const csvData = await response.text();
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        const features = lines.slice(1).map(line => {
            const values = line.split(',');
            if (values.length < headers.length) return null;

            const entry: {[key: string]: any} = {};
            headers.forEach((header, i) => {
                entry[header] = values[i];
            });

            const latitude = parseFloat(entry.latitude);
            const longitude = parseFloat(entry.longitude);
            const confidence = parseInt(entry.confidence, 10);
            
            if (isNaN(latitude) || isNaN(longitude)) return null;

            return {
                type: 'Feature' as const,
                properties: {
                    ...entry,
                    confidence: confidence,
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [longitude, latitude]
                }
            };
        }).filter(feature => feature !== null);

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
