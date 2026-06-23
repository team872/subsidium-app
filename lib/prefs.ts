import { query } from "./db";

// Préférences du compte : langue (FR/EN/IT, prépare l'i18n) + pays. Colonne ajoutée à la demande.

export const LANGUES: { code: string; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
];

let ready: Promise<void> | null = null;
export function ensurePrefs(): Promise<void> {
  if (!ready) ready = query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS langue TEXT DEFAULT 'fr'`).then(() => {});
  return ready;
}

export async function getPrefs(userId: number): Promise<{ langue: string; pays: string | null }> {
  await ensurePrefs();
  const r = await query<{ langue: string | null; pays: string | null }>(`SELECT langue, pays FROM users WHERE id=$1`, [userId]);
  return { langue: r[0]?.langue || "fr", pays: r[0]?.pays ?? null };
}

export async function setPrefs(userId: number, f: { langue?: string; pays?: string }): Promise<void> {
  await ensurePrefs();
  if (f.langue !== undefined) {
    const code = LANGUES.some((l) => l.code === f.langue) ? f.langue : "fr";
    await query(`UPDATE users SET langue=$2 WHERE id=$1`, [userId, code]);
  }
  if (f.pays !== undefined) await query(`UPDATE users SET pays=$2 WHERE id=$1`, [userId, f.pays]);
}

// Code de parrainage stable dérivé de l'identifiant utilisateur.
export function parrainageCode(userId: number): string {
  return "SUB-" + userId.toString(36).toUpperCase().padStart(4, "0");
}
