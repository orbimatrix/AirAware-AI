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


export function HazardMapClient({
  fireApi = '/api/hazards/fires',
  warningsApi = '/api/hazards/warnings'
}: {
  fireApi?: string,
  warningsApi?: string,
}) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapEl.current) return;
    if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
    }
    setError(null);

    // Set up the map
    const map = L.map(mapEl.current, { center: [30.3753, 69.3451], zoom: 5 }); // Center on Pakistan
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors, NASA, OpenWeatherMap',
    }).addTo(map);

    const baseLayers = {};
    const overlayLayers: Record<string, L.Layer> = {};
    const layerControl = L.control.layers(baseLayers, overlayLayers).addTo(map);

    // --- Fetch and Add Wildfire Data ---
    const addFireLayer = async () => {
      try {
        const res = await fetch(fireApi);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`FIRMS GeoJSON fetch failed: ${errorText}`);
        }
        const data = await res.json();
        
        if (!data || !data.features || data.features.length === 0) {
            console.log("No wildfire data to display.");
            return;
        }

        const fireLayer = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            const props = feature.properties || {};
            const radius = props.confidence ? Math.max(3, (props.confidence / 100) * 8) : 5;
            return L.circleMarker(latlng, { radius, fillOpacity: 0.8, color: '#FF4500', weight: 1, fillColor: '#FF4500' });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            const popupContent = Object.entries(p).map(([k, v]) => `<b>${k}</b>: ${v}`).join('<br/>');
            layer.bindPopup(popupContent);
          },
        });
        
        layerControl.addOverlay(fireLayer, 'Wildfires');
        fireLayer.addTo(map); // Add to map immediately

        // Fit map to the data bounds if features exist
        const bounds = fireLayer.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { maxZoom: 8, padding: [50, 50] });
        }
      } catch (err: any) {
        console.error('Load hazard GeoJSON error:', err);
        setError(`Could not load wildfire data. ${err.message}`);
      }
    };
    
    // --- Fetch and Add Weather Warnings ---
    const addWarningsLayer = async () => {
        try {
            const res = await fetch(warningsApi);
            if (!res.ok) throw new Error('Weather warnings fetch failed');
            const warnings = await res.json();

            if (warnings.length === 0) return;

            const warningMarkers = warnings.map((warning: any) => {
                const marker = L.marker([warning.lat, warning.lon])
                    .bindPopup(`<b>${warning.city}: ${warning.event}</b><br>${warning.description}`);
                return marker;
            });

            const warningLayer = L.layerGroup(warningMarkers);
            layerControl.addOverlay(warningLayer, 'Weather Warnings');

        } catch (err: any) {
            console.error('Load weather warnings error:', err);
             // Non-critical, so we don't set a main error state
        }
    };

    addFireLayer();
    addWarningsLayer();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [fireApi, warningsApi]);

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
