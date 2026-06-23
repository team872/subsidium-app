import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listMyOrganisations } from "@/lib/orgData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ organisations: [] });
  try {
    return NextResponse.json({ organisations: await listMyOrganisations(uid) });
  } catch {
    return NextResponse.json({ organisations: [] });
  }
}
