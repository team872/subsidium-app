import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { withPreview } from "@/lib/testmode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ user: null });
    const { user, isTest } = withPreview(await getUserPublic(uid));
    return NextResponse.json({ user, isTest });
  } catch {
    return NextResponse.json({ user: null });
  }
}
