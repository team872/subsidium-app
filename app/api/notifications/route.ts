import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listNotifications } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ items: [], unread: 0 });
  try {
    const data = await listNotifications(uid);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ items: [], unread: 0 });
  }
}
