'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Manually import leaflet icons to fix display issues
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
const FIRMS_API_URL = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_API_KEY}/VIIRS_SNPP_NRT/world/1`;

export function HazardMapClient() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapEl.current) return;
    if (mapInstance.current) {
        mapInstance.current.remove();
    }
    setError(null);

    // Set up the map
    const map = L.map(mapEl.current).setView([30.3753, 69.3451], 5); // Center on Pakistan
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors, NASA',
    }).addTo(map);

    const overlayLayers: Record<string, L.Layer> = {};
    const layerControl = L.control.layers(undefined, overlayLayers).addTo(map);

    const addFireLayer = async () => {
        if (!NASA_API_KEY) {
            const warning = "Wildfire data is unavailable: NASA API key is not configured.";
            setError(warning);
            console.warn(warning);
            return;
        }

        try {
            const response = await fetch(FIRMS_API_URL);
            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Failed to fetch FIRMS data: ${responseText}`);
            }

            const lines = responseText.trim().split('\n');
            if (lines.length <= 1 || lines[0].trim().startsWith("No data")) {
                console.log("No active fire data from FIRMS.");
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
                layerControl.addOverlay(fireLayer, 'Wildfires');
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

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Map Data Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div ref={mapEl} style={{ width: '100%', height: '600px', borderRadius: '8px', overflow: 'hidden' }} />
    </div>
  )
}
