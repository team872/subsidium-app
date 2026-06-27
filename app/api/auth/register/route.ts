import { NextRequest, NextResponse } from "next/server";
import { ensureDb, query } from "@/lib/db";
import { hashPassword, signSession, sessionCookie } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const b = await req.json();
    const email = String(b.email || "").trim().toLowerCase();
    const password = String(b.password || "");
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit comporter au moins 8 caractères." }, { status: 400 });
    }
    const existing = await query(`SELECT 1 FROM users WHERE email=$1`, [email]);
    if (existing.length) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail." }, { status: 409 });
    }
    const hash = await hashPassword(password);
    // Inscription = création d'un VISITEUR INSCRIT (niveau 0).
    // La Charte d'engagement (→ Refondateur) et l'auto-évaluation (→ Initiateur)
    // sont des étapes ULTÉRIEURES et DISSOCIÉES (cf. recette AN043 / AN052).
    const rows = await query<{ id: number }>(
      `INSERT INTO users (email,password_hash,nom,prenom,situation,ville,pays,palier,score,badge_n2,niveau,charte_validee,paye)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NULL,NULL,FALSE,0,FALSE,FALSE) RETURNING id`,
      [email, hash, b.nom ?? null, b.prenom ?? null, b.situation ?? null, b.ville ?? null, b.pays ?? null]
    );
    const id = rows[0].id;
    const token = await signSession(id);
    const res = NextResponse.json({ user: await getUserPublic(id) });
    const c = sessionCookie(token);
    res.cookies.set(c.name, c.value, c.options);
    return res;
  } catch {
    return NextResponse.json({ error: "Inscription impossible pour le moment." }, { status: 500 });
  }
}
