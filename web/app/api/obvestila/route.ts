import { NextResponse } from "next/server";
import { kvNaVoljo } from "@/lib/kv";
import { TOCKE } from "@/lib/napoved";
import { VRSTE, type VrstaId } from "@/lib/vrste";
import { dodajNarocnino, idIzEndpointa, odstraniNarocnino, potisnNaVoljo, preberiNarocnino, shraniNarocnino } from "@/lib/obvestila";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!kvNaVoljo || !potisnNaVoljo) return NextResponse.json({ napaka: "obvestila trenutno niso na voljo" }, { status: 503 });
  let t: { endpoint?: string; keys?: { p256dh?: string; auth?: string }; obmocja?: string[]; vrste?: string[]; prag?: number };
  try { t = await req.json(); } catch { return NextResponse.json({ napaka: "napačna zahteva" }, { status: 400 }); }
  if (!t.endpoint?.startsWith("https://") || !t.keys?.p256dh || !t.keys?.auth) {
    return NextResponse.json({ napaka: "napačna naročnina" }, { status: 400 });
  }
  const id = idIzEndpointa(t.endpoint);
  const prej = await preberiNarocnino(id);
  await shraniNarocnino(id, {
    endpoint: t.endpoint,
    keys: { p256dh: t.keys.p256dh, auth: t.keys.auth },
    obmocja: (t.obmocja ?? []).filter((s) => TOCKE.some((x) => x.slug === s)).slice(0, 30),
    vrste: ((t.vrste ?? []).filter((v) => VRSTE.some((x) => x.id === v)) as VrstaId[]).slice(0, 4),
    prag: Math.min(90, Math.max(40, Math.round(t.prag ?? 70))),
    zadnje: prej?.zadnje ?? {},
  });
  await dodajNarocnino(id);
  return NextResponse.json({ stanje: "shranjeno" });
}

export async function DELETE(req: Request) {
  let t: { endpoint?: string };
  try { t = await req.json(); } catch { return NextResponse.json({ napaka: "napačna zahteva" }, { status: 400 }); }
  if (!t.endpoint) return NextResponse.json({ napaka: "napačna zahteva" }, { status: 400 });
  await odstraniNarocnino(idIzEndpointa(t.endpoint));
  return NextResponse.json({ stanje: "odjavljeno" });
}
