import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { exportUserData, logRgpd } from "@/lib/rgpd";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const me = await getUserPublic(uid);
  if (!me || !isAdmin(me.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  const target = Number(params.id);
  const data = await exportUserData(target);
  await logRgpd(uid, me.email, "export", target, data.user?.email || "").catch(() => {});
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="rgpd-export-user-${target}.json"`,
    },
  });
}
