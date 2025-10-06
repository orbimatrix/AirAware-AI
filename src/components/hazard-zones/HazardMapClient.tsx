
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
const OPENAQ_API_KEY = process.env.NEXT_PUBLIC_OPENAQ_API_KEY;

// EPA AQI Breakpoints for PM2.5
const BREAKPOINTS = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50, color: '#00e400' }, // Good
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100, color: '#ffff00' }, // Moderate
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150, color: '#ff7e00' }, // Unhealthy for Sensitive Groups
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200, color: '#ff0000' }, // Unhealthy
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300, color: '#8f3f97' }, // Very Unhealthy
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500, color: '#7e0023' }, // Hazardous
];

function calculateAqi(concentration: number) {
    const breakpoint = BREAKPOINTS.find(b => concentration >= b.cLow && concentration <= b.cHigh);
    if (!breakpoint) {
        // Handle cases outside the defined breakpoints, maybe return the highest category
        return { aqi: 500, color: '#7e0023' };
    }
    const aqi = Math.round(
        ((breakpoint.iHigh - breakpoint.iLow) / (breakpoint.cHigh - breakpoint.cLow)) * (concentration - breakpoint.cLow) + breakpoint.iLow
    );
    return { aqi, color: breakpoint.color };
}


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
                const FIRMS_API_URL = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${NASA_API_KEY}/VIIRS_SNPP_NRT/PAK/1`;
                const response = await fetch(FIRMS_API_URL);
                const responseText = await response.text();

                if (!response.ok) {
                    throw new Error(`Failed to fetch FIRMS data: ${responseText}`);
                }

                if (responseText.trim().startsWith("No data") || responseText.trim().length === 0 || responseText.includes("Error")) {
                    console.log("No active fire data from FIRMS for the specified region.");
                    toast({ title: "No Wildfires Detected", description: "Currently, there are no active wildfires in Pakistan." });
                    return;
                }

                const lines = responseText.trim().split('\n');
                if (lines.length <= 1) {
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
                }

            } catch (err: any) {
                console.error('Error processing FIRMS data:', err);
                setError(`Could not load wildfire data. ${err.message}`);
            }
        };
        addFireLayer();
    }
    
    // --- Add OpenAQ Layer ---
    if (OPENAQ_API_KEY) {
        const addAqiLayer = async () => {
            try {
                const response = await fetch(`https://api.openaq.org/v3/latest?country=PK&parameter=pm25&limit=1000`, {
                    headers: { 'X-API-Key': OPENAQ_API_KEY }
                });
                 if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`OpenAQ API error: ${errorText}`);
                }
                const data = await response.json();

                const aqiPoints = data.results.map((result: any) => {
                    if (!result.coordinates) return null;
                    const { aqi, color } = calculateAqi(result.value);
                    const marker = L.circleMarker([result.coordinates.latitude, result.coordinates.longitude], {
                        radius: 8,
                        fillColor: color,
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                    marker.bindPopup(`<b>${result.location}</b><br>PM2.5 AQI: ${aqi}`);
                    return marker;
                }).filter((p): p is L.CircleMarker => p !== null);
                
                if (aqiPoints.length > 0) {
                    const aqiLayer = L.layerGroup(aqiPoints);
                    overlayLayers['Air Quality Stations'] = aqiLayer;
                    // Don't add to map by default, let user choose
                } else {
                    toast({ title: "No Air Quality Stations Found", description: "Could not find any active AQ stations in Pakistan via OpenAQ."});
                }
            } catch (err: any) {
                 console.error('Error processing OpenAQ data:', err);
                 setError(`Could not load air quality station data. ${err.message}`);
            }
        };
        addAqiLayer();
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
        
        const windLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`, {
            attribution: '&copy; OpenWeatherMap'
        });
        overlayLayers['Wind Speed & Direction'] = windLayer;

        const pressureLayer = L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`, {
            attribution: '&copy; OpenWeatherMap'
        });
        overlayLayers['Air Pressure'] = pressureLayer;
        
        const cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`, {
            attribution: '&copy; OpenWeatherMap'
        });
        overlayLayers['Clouds'] = cloudsLayer;

    }

    if (Object.keys(overlayLayers).length > 0 || Object.keys({ "Base Map": baseLayer }).length > 0) {
        L.control.layers({ "Base Map": baseLayer }, overlayLayers, { collapsed: false }).addTo(map);
    }

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

  if (!NASA_API_KEY && !OWM_API_KEY && !OPENAQ_API_KEY) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Keys Missing</AlertTitle>
            <AlertDescription>
                This feature requires API keys. Please add `NEXT_PUBLIC_NASA_API_KEY`, `NEXT_PUBLIC_OPENWEATHER_API_KEY`, and `NEXT_PUBLIC_OPENAQ_API_KEY` to your environment variables.
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
