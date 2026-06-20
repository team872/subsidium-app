import { NextRequest, NextResponse } from "next/server";
import { palierFromTotal, badgeFromTotal, totalSur60 } from "@/lib/scoring";

// Scoring serveur du questionnaire guidé (déterministe), avec les mêmes seuils que
// l'agent conversationnel — pour un palier/badge unifiés entre les deux chemins.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const answers: number[] = Array.isArray(body.answers)
    ? body.answers.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n))
    : [];
  if (answers.length === 0) {
    return NextResponse.json({ error: "Aucune réponse fournie." }, { status: 400 });
  }
  const total = totalSur60(answers);
  return NextResponse.json({
    result: {
      total,
      palier: palierFromTotal(total),
      indice_fiabilite: 1,
      badge_n2_octroyable: badgeFromTotal(total),
      reserves: [],
    },
  });
}
