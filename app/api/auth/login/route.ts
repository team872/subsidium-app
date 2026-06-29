import { NextRequest, NextResponse } from "next/server";
import { ensureDb, query } from "@/lib/db";
import { verifyPassword, signSession, sessionCookie } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const b = await req.json();
    const email = String(b.email || "").trim().toLowerCase();
    const password = String(b.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Renseignez votre e-mail et votre mot de passe." }, { status: 400 });
    }
    // Anti-bruteforce : 8 tentatives / 10 min par (IP, email). Derrière Traefik,
    // l'IP réelle est dans x-forwarded-for.
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    const rl = rateLimit(`login:${ip}:${email}`, 8, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }
    const rows = await query<{ id: number; password_hash: string }>(
      `SELECT id, password_hash FROM users WHERE email=$1`,
      [email]
    );
    const u = rows[0];
    if (!u || !(await verifyPassword(password, u.password_hash))) {
      return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
    }
    const token = await signSession(u.id);
    const res = NextResponse.json({ user: await getUserPublic(u.id) });
    const c = sessionCookie(token);
    res.cookies.set(c.name, c.value, c.options);
    return res;
  } catch {
    return NextResponse.json({ error: "Connexion impossible pour le moment." }, { status: 500 });
  }
}
