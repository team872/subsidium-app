import { NextResponse } from "next/server";
import { listEvents } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ events: await listEvents() });
  } catch {
    return NextResponse.json({ error: "Événements indisponibles." }, { status: 500 });
  }
}
