import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic, updateUser } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ user: null });
  return NextResponse.json({ user: await getUserPublic(uid) });
}

export async function PATCH(req: NextRequest) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const b = await req.json();
    const clean = (v: unknown) => {
      const s = String(v ?? "").trim();
      return s || undefined;
    };
    const user = await updateUser(uid, {
      nom: clean(b.nom),
      prenom: clean(b.prenom),
      situation: clean(b.situation),
      ville: clean(b.ville),
      pays: clean(b.pays),
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible pour le moment." }, { status: 500 });
  }
}
