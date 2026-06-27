import { NextRequest, NextResponse } from "next/server";
import { ensureDb, query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Contrôle PRÉCOCE de disponibilité de l'e-mail (cf. recette AN051 : éviter le
// contrôle bloquant tardif en fin de tunnel). Appelé dès l'étape 1 de l'inscription.
export async function GET(req: NextRequest) {
  try {
    const email = String(req.nextUrl.searchParams.get("email") || "").trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ valid: false, available: false });
    }
    await ensureDb();
    const rows = await query(`SELECT 1 FROM users WHERE email=$1`, [email]);
    return NextResponse.json({ valid: true, available: rows.length === 0 });
  } catch {
    // En cas d'erreur transitoire, ne pas bloquer le parcours : le contrôle
    // définitif reste effectué côté register (409).
    return NextResponse.json({ valid: true, available: true });
  }
}
