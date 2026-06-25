import { NextResponse } from "next/server";
import { listResources } from "@/lib/energieData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ resources: await listResources() });
  } catch {
    return NextResponse.json({ resources: [] });
  }
}
