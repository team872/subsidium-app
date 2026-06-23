// Géocodage best-effort via Nominatim (OpenStreetMap, gratuit, open source).
// Respecte la politique d'usage : User-Agent identifiable, 1 requete a la creation,
// dégradation silencieuse (retourne null) en cas d'échec / quota / hors-ligne.
export async function geocode(q: string): Promise<{ lat: number; lon: number } | null> {
  const query = (q || "").trim();
  if (!query) return null;
  try {
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fr&q=" +
      encodeURIComponent(query);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(url, {
      headers: { "User-Agent": "SubsidiumApp/1.0 (subsidium.elfe.info)", "Accept-Language": "fr" },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const d: any = await r.json();
    if (Array.isArray(d) && d[0]) {
      const lat = parseFloat(d[0].lat), lon = parseFloat(d[0].lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    }
  } catch {}
  return null;
}
