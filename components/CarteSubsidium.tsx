"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useLang } from "@/components/LangProvider";

// Carte réutilisable — MapLibre GL + tuiles vectorielles OpenFreeMap (open source, sans clé API).
// Les libellés (pays, régions, villes) suivent la langue de l'interface : name:fr / name:en / name:it.
export type CartePoint = { id: number | string; lat: number; lon: number; title: string; subtitle?: string; color?: string; href?: string };

const OPEN: Record<string, string> = { fr: "Ouvrir la fiche →", en: "Open details →", it: "Apri la scheda →" };
// Style clair « positron » d'OpenFreeMap (équivalent visuel de l'ancien fond CARTO), tuiles vectorielles gratuites.
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

// Force la langue des libellés de la carte (couches symbol avec text-field).
function applyLanguage(map: maplibregl.Map, lang: string) {
  const code = ["fr", "en", "it"].includes(lang) ? lang : "fr";
  const field: unknown = ["coalesce", ["get", `name:${code}`], ["get", "name:latin"], ["get", "name"]];
  const layers = map.getStyle()?.layers || [];
  for (const layer of layers) {
    if (layer.type !== "symbol") continue;
    const hasText = (layer as { layout?: Record<string, unknown> }).layout?.["text-field"] !== undefined;
    if (!hasText) continue;
    try {
      map.setLayoutProperty(layer.id, "text-field", field as never);
    } catch {
      /* couche sans texte modifiable : on ignore */
    }
  }
}

function pinElement(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `width:18px;height:18px;background:${color};border:2.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 5px rgba(55,38,70,.4);cursor:pointer`;
  return el;
}

export default function CarteSubsidium({ points, height = 480 }: { points: CartePoint[]; height?: number }) {
  const { lang } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const fittedRef = useRef(false);
  const openLabel = OPEN[lang] || OPEN.fr;

  const pts = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));

  // Initialisation de la carte (une seule fois).
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [2.4, 46.6],
      zoom: 5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => applyLanguage(map, lang));
    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Changement de langue → mise à jour des libellés.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) applyLanguage(map, lang);
    else map.once("load", () => applyLanguage(map, lang));
  }, [lang]);

  // Marqueurs + recadrage initial (une seule fois pour éviter le « tournis » à chaque filtre).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    for (const p of pts) {
      const html =
        `<div style="min-width:150px">` +
        `<div style="font-weight:700;color:#372646;margin-bottom:2px">${escapeHtml(p.title)}</div>` +
        (p.subtitle ? `<div style="color:#9C919E;font-size:12px;margin-bottom:6px">${escapeHtml(p.subtitle)}</div>` : "") +
        (p.href ? `<a href="${escapeHtml(p.href)}" style="color:#C2452F;font-weight:600;font-size:13px">${escapeHtml(openLabel)}</a>` : "") +
        `</div>`;
      const popup = new maplibregl.Popup({ offset: 20, closeButton: true }).setHTML(html);
      const marker = new maplibregl.Marker({ element: pinElement(p.color || "#C2452F"), anchor: "bottom" })
        .setLngLat([p.lon, p.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    }
    if (!fittedRef.current && pts.length > 0) {
      if (pts.length === 1) {
        map.jumpTo({ center: [pts[0].lon, pts[0].lat], zoom: 12 });
      } else {
        const b = new maplibregl.LngLatBounds();
        pts.forEach((p) => b.extend([p.lon, p.lat]));
        map.fitBounds(b, { padding: 48, maxZoom: 13, duration: 0 });
      }
      fittedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, openLabel]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid #EBD9CD", position: "relative", zIndex: 0, isolation: "isolate" }}
    />
  );
}
