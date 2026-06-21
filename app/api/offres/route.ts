import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listOffres } from "@/lib/marketData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  try {
    return NextResponse.json({ offres: await listOffres() });
  } catch {
    return NextResponse.json({ error: "Offres indisponibles." }, { status: 500 });
  }
}
