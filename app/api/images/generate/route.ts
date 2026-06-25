import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { togetherGenerate, togetherConfigured } from "@/lib/cardImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Génération d'illustration via FLUX (Together AI). Gated sur TOGETHER_API_KEY.
export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!togetherConfigured()) return NextResponse.json({ configured: false, url: null });
  const b = await req.json().catch(() => ({} as any));
  const prompt = String(b.prompt || "").trim();
  if (!prompt) return NextResponse.json({ error: "Prompt requis." }, { status: 400 });
  try {
    const url = await togetherGenerate(prompt);
    return NextResponse.json({ configured: true, url });
  } catch {
    return NextResponse.json({ configured: true, url: null, error: "Génération indisponible." });
  }
}
