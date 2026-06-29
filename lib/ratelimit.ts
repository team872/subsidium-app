// Limiteur de débit en mémoire (anti-bruteforce / anti-abus).
//
// Suffisant pour un déploiement mono-conteneur (une seule instance de l'app).
// En cas de passage multi-instances (ex. Scaleway + plusieurs réplicas), remplacer
// le stockage par un store partagé (Redis) : l'interface reste la même.

type Hit = { count: number; reset: number };
const buckets = new Map<string, Hit>();

/**
 * Incrémente le compteur de `key` dans une fenêtre `windowMs`.
 * Renvoie ok=false (et le délai en secondes) une fois `max` dépassé.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const h = buckets.get(key);
  if (!h || now > h.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  h.count++;
  if (h.count > max) {
    return { ok: false, retryAfter: Math.ceil((h.reset - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Nettoyage paresseux pour éviter une croissance illimitée de la Map. */
export function rateLimitSweep(): void {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
}
