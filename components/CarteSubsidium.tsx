"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Composant carte réutilisable (Leaflet + fond CARTO Positron, open source).
// Utilisable partout : Idées, Événements, Projets, centres… Charger via next/dynamic (ssr:false).
export type CartePoint = { id: number | string; lat: number; lon: number; title: string; subtitle?: string; color?: string; href?: string };

function pinIcon(color: string) {
  return L.divIcon({
    className: "carte-pin",
    html: `<span style="display:block;width:18px;height:18px;background:${color};border:2.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 5px rgba(55,38,70,.4)"></span>`,
    iconSize: [18, 18], iconAnchor: [9, 18], popupAnchor: [0, -18],
  });
}

function FitBounds({ points }: { points: CartePoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) { map.setView([points[0].lat, points[0].lon], 12); return; }
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number])), { padding: [40, 40], maxZoom: 13 });
    }
  }, [points, map]);
  return null;
}

export default function CarteSubsidium({ points, height = 480 }: { points: CartePoint[]; height?: number }) {
  const pts = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
  return (
    // position:relative + isolation:isolate => les z-index internes de Leaflet (jusqu'à ~1000)
    // restent confinés dans cette boîte et ne passent jamais au-dessus de la mascotte / des modales.
    <div style={{ height, width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid #EBD9CD", position: "relative", zIndex: 0, isolation: "isolate" }}>
      <MapContainer center={[46.6, 2.4]} zoom={6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          subdomains="abcd"
          maxZoom={19}
          attribution='&copy; OpenStreetMap, &copy; CARTO'
        />
        <FitBounds points={pts} />
        {pts.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]} icon={pinIcon(p.color || "#C2452F")}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                <div style={{ fontWeight: 700, color: "#372646", marginBottom: 2 }}>{p.title}</div>
                {p.subtitle && <div style={{ color: "#9C919E", fontSize: 12, marginBottom: 6 }}>{p.subtitle}</div>}
                {p.href && <a href={p.href} style={{ color: "#C2452F", fontWeight: 600, fontSize: 13 }}>Ouvrir la fiche →</a>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
