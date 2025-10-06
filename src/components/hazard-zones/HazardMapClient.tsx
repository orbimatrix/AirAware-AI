
'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useToast } from '@/hooks/use-toast';

// Manually import leaflet icons to fix display issues
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
const OWM_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

// Correctly scope the API to Pakistan (PAK)
const FIRMS_API_URL = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${NASA_API_KEY}/VIIRS_SNPP_NRT/PAK/1`;

export function HazardMapClient() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapEl.current) return;
    if (mapInstance.current) {
        mapInstance.current.remove();
    }
    setError(null);

    // Set up the map, centered on Pakistan
    const map = L.map(mapEl.current).setView([30.3753, 69.3451], 5);
    mapInstance.current = map;

    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const overlayLayers: Record<string, L.Layer> = {};
    
    // --- Add Wildfire Layer ---
    if (NASA_API_KEY) {
        const addFireLayer = async () => {
            try {
                const response = await fetch(FIRMS_API_URL);
                const responseText = await response.text();

                if (!response.ok) {
                    throw new Error(`Failed to fetch FIRMS data: ${responseText}`);
                }

                const lines = responseText.trim().split('\n');
                if (lines.length <= 1 || lines[0].trim().startsWith("No data")) {
                    console.log("No active fire data from FIRMS for the specified region.");
                    toast({ title: "No Wildfires Detected", description: "Currently, there are no active wildfires in Pakistan." });
                    return;
                }

                const headers = lines[0].split(',').map(h => h.trim());
                const latIndex = headers.indexOf('latitude');
                const lonIndex = headers.indexOf('longitude');
                const confidenceIndex = headers.indexOf('confidence');

                if (latIndex === -1 || lonIndex === -1) {
                    throw new Error("Could not find latitude or longitude in FIRMS data.");
                }
                
                const firePoints = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const lat = parseFloat(values[latIndex]);
                    const lon = parseFloat(values[lonIndex]);
                    const confidence = values[confidenceIndex] ? parseInt(values[confidenceIndex], 10) : 0;

                    if (!isNaN(lat) && !isNaN(lon)) {
                         const radius = confidence ? Math.max(3, (confidence / 100) * 8) : 5;
                         const marker = L.circleMarker([lat, lon], { radius, fillOpacity: 0.8, color: '#FF4500', weight: 1, fillColor: '#FF4500' });
                         marker.bindPopup(`<b>Fire Event</b><br>Confidence: ${confidence}%`);
                         return marker;
                    }
                    return null;
                }).filter((p): p is L.CircleMarker => p !== null);

                if (firePoints.length > 0) {
                    const fireLayer = L.layerGroup(firePoints);
                    overlayLayers['Wildfires'] = fireLayer;
                    fireLayer.addTo(map);

                    const bounds = fireLayer.getBounds();
                    if (bounds.isValid()) {
                        map.fitBounds(bounds, { maxZoom: 8, padding: [50, 50] });
                    }
                } else {
                     console.log("No valid fire points to display.");
                }

            } catch (err: any) {
                console.error('Error processing FIRMS data:', err);
                setError(`Could not load wildfire data. ${err.message}`);
            }
        };
        addFireLayer();
    } else {
        console.warn("NASA_API_KEY is missing. Wildfire layer will not be loaded.");
    }

    // --- Add OpenWeatherMap Layers ---
    if (OWM_API_KEY) {
        const tempLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`, {
            attribution: '&copy; OpenWeatherMap'
        });
        overlayLayers['Temperature'] = tempLayer;

        const precipitationLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`, {
            attribution: '&copy; OpenWeatherMap'
        });
        overlayLayers['Precipitation'] = precipitationLayer;

        const coLayer = L.tileLayer(`https://tile.openweathermap.org/map/co/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`, {
            attribution: '&copy; OpenWeatherMap'
        });
        overlayLayers['Carbon Monoxide'] = coLayer;

    } else {
        console.warn("OPENWEATHER_API_KEY is missing. Weather and pollution layers will not be loaded.");
    }

    L.control.layers({ "Base Map": baseLayer }, overlayLayers, { collapsed: false }).addTo(map);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map Data Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  if (!NASA_API_KEY && !OWM_API_KEY) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Keys Missing</AlertTitle>
            <AlertDescription>
                This feature requires API keys from NASA FIRMS (for wildfires) and OpenWeatherMap (for weather layers). 
                Please add `NEXT_PUBLIC_NASA_API_KEY` and `NEXT_PUBLIC_OPENWEATHER_API_KEY` to your environment variables.
            </AlertDescription>
        </Alert>
    );
  }


  return (
    <div className="space-y-4">
        <div ref={mapEl} style={{ width: '100%', height: '600px', borderRadius: '8px', overflow: 'hidden' }} />
    </div>
  )
}
