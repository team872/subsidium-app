import { NextRequest, NextResponse } from "next/server";
import { getOrganisation } from "@/lib/orgData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const org = await getOrganisation(Number(params.id));
    if (!org) return NextResponse.json({ error: "Organisation introuvable." }, { status: 404 });
    return NextResponse.json({ org });
  } catch {
    return NextResponse.json({ error: "Organisation indisponible." }, { status: 500 });
  }
}
