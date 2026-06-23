import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { withPreview } from "@/lib/testmode";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ user: null });
    const { user, isTest } = withPreview(await getUserPublic(uid));
    return NextResponse.json({ user, isTest, isAdmin: isAdmin(user?.email) });
  } catch {
    return NextResponse.json({ user: null });
  }
}
