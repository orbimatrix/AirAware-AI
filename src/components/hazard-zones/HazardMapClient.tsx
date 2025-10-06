'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import L directly

// Manually import leaflet icons to fix display issues
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';


export function HazardMapClient({
  fireApi = '/api/hazards/fires',
  warningsApi = '/api/hazards/warnings'
}: {
  fireApi?: string,
  warningsApi?: string,
}) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapInstance.current || !mapEl.current) return;

    // Set up the map
    mapInstance.current = L.map(mapEl.current, { center: [20, 0], zoom: 2 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors, NASA, OpenWeatherMap',
    }).addTo(mapInstance.current);

    const baseLayers = {}; // Can add more base maps here
    const overlayLayers: Record<string, L.Layer> = {};
    const layerControl = L.control.layers(baseLayers, overlayLayers).addTo(mapInstance.current);

    // --- Fetch and Add Wildfire Data ---
    const addFireLayer = async () => {
      try {
        const res = await fetch(fireApi);
        if (!res.ok) throw new Error('FIRMS GeoJSON fetch failed');
        const data = await res.json();
        
        const fireLayer = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            const props = feature.properties || {};
            const radius = props.confidence ? Math.min(20, 3 + (props.confidence / 100) * 10) : 6;
            return L.circleMarker(latlng, { radius, fillOpacity: 0.7, color: '#ff5500', weight: 1, fillColor: '#ff5500' });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            const popupContent = Object.entries(p).map(([k, v]) => `<b>${k}</b>: ${v}`).join('<br/>');
            layer.bindPopup(popupContent);
          },
        });
        
        overlayLayers['Wildfires'] = fireLayer;
        layerControl.addOverlay(fireLayer, 'Wildfires');
        fireLayer.addTo(mapInstance.current!); // Add by default

        if (fireLayer.getBounds && fireLayer.getBounds().isValid()) {
            mapInstance.current?.fitBounds(fireLayer.getBounds(), { maxZoom: 8, padding: [50, 50] });
        }

      } catch (err) {
        console.error('Load hazard GeoJSON error:', err);
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
            overlayLayers['Weather Warnings'] = warningLayer;
            layerControl.addOverlay(warningLayer, 'Weather Warnings');

        } catch (err) {
            console.error('Load weather warnings error:', err);
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

  return <div ref={mapEl} style={{ width: '100%', height: '600px', borderRadius: '8px', overflow: 'hidden' }} />;
}
