"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export function HazardMapClient({ geoJsonApi = "/api/hazards/fires" }: { geoJsonApi?: string }) {
  const mapEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let map: any;
    let geoLayer: any;

    async function start() {
      const L = (await import("leaflet")).default;

      if (!mapEl.current) return;

      map = L.map(mapEl.current, { center: [20, 0], zoom: 2 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors & NASA FIRMS',
      }).addTo(map);

      try {
        const res = await fetch(geoJsonApi);
        if (!res.ok) throw new Error("GeoJSON fetch failed");
        const data = await res.json();

        geoLayer = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            // hotspot points -> circle marker sized by confidence (example)
            const props = feature.properties || {};
            const radius = props.confidence ? Math.min(20, 3 + (props.confidence / 100) * 10) : 6;
            return L.circleMarker(latlng, { radius, fillOpacity: 0.7, color: "#ff5500", weight: 1, fillColor: '#ff5500' });
          },
          style: (feature) => ({
            color: feature.properties?.color || "#ff0000",
            weight: 1,
            fillOpacity: 0.35,
          }),
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            const popupContent = Object.entries(p)
              .map(([k,v]) => `<b>${k}</b>: ${v}`)
              .join("<br/>");
            layer.bindPopup(popupContent);
          },
        }).addTo(map);

        // zoom to layer bounds (if available)
        if (geoLayer.getBounds && geoLayer.getBounds().isValid()) {
            map.fitBounds(geoLayer.getBounds(), { maxZoom: 8, padding: [50,50] });
        }
      } catch (err) {
        console.error("Load hazard GeoJSON error:", err);
      }
    }

    start();
    return () => {
      if (map) map.remove();
    };
  }, [geoJsonApi]);

  return <div ref={mapEl} style={{ width: "100%", height: "600px", borderRadius: "8px", overflow: "hidden" }} />;
}
