import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getPrefs, setPrefs, parrainageCode, LANGUES } from "@/lib/prefs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  try {
    const prefs = await getPrefs(uid);
    return NextResponse.json({ ...prefs, parrainage: parrainageCode(uid), langues: LANGUES });
  } catch {
    return NextResponse.json({ langue: "fr", pays: null, parrainage: parrainageCode(uid), langues: LANGUES });
  }
}

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const b = await req.json().catch(() => ({} as any));
  try {
    await setPrefs(uid, { langue: b.langue, pays: b.pays });
    return NextResponse.json({ ok: true, ...(await getPrefs(uid)) });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
