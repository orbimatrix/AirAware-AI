import { NextResponse } from 'next/server';

// This API route proxies NASA FIRMS data and converts it to GeoJSON.
// An API key from https://firms.modaps.eosdis.nasa.gov/api/api_key/ is required.

const API_KEY = process.env.NASA_API_KEY;
const SOURCE = 'VIIRS_SNPP_NRT';
const AREA = 'world';
const TIME_RANGE = '24'; // hours

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
        const response = await fetch(FIRMS_API_URL);

        const responseText = await response.text();

        if (!response.ok) {
            console.error(`Failed to fetch FIRMS data: ${response.status} ${responseText}`);
            return NextResponse.json(
                { error: `Failed to fetch FIRMS data: ${responseText}` },
                { status: response.status }
            );
        }
        
        const lines = responseText.trim().split('\n');
        
        if (lines.length <= 1 || lines[0].trim() === "No data for selected area and date range") {
            return NextResponse.json({ type: 'FeatureCollection', features: [] });
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const latIndex = headers.indexOf('latitude');
        const lonIndex = headers.indexOf('longitude');

        if (latIndex === -1 || lonIndex === -1) {
             return NextResponse.json(
                { error: 'Could not find latitude or longitude columns in FIRMS data.' },
                { status: 500 }
            );
        }

        const features = lines.slice(1).map(line => {
            const values = line.split(',');
            if (values.length < headers.length) return null;

            const entry: {[key: string]: any} = {};
            headers.forEach((header, i) => {
                entry[header] = values[i];
            });

            const latitude = parseFloat(values[latIndex]);
            const longitude = parseFloat(values[lonIndex]);
            
            if (isNaN(latitude) || isNaN(longitude)) return null;
            
            // Convert confidence to a number if it exists
            if (entry.confidence) {
                const confidenceVal = parseInt(entry.confidence, 10);
                entry.confidence = isNaN(confidenceVal) ? entry.confidence : confidenceVal;
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
            { error: 'An internal server error occurred while processing FIRMS data.' },
            { status: 500 }
        );
    }
}
