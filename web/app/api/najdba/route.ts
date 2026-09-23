import { NextResponse } from "next/server";
import { kv, kvNaVoljo } from "@/lib/kv";
import { TOCKE } from "@/lib/napoved";
import { VRSTE } from "@/lib/vrste";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DNI = 7;
const dan = (zamik = 0) => new Date(Date.now() - zamik * 86400000).toISOString().slice(0, 10);
const kljuc = (slug: string, vrsta: string, d: string, izid: "da" | "ne") => `n:${slug}:${vrsta}:${d}:${izid}`;

async function statistika(slug: string) {
  const dnevi = Array.from({ length: DNI }, (_, i) => dan(i));
  const kljuci: string[] = [];
  for (const v of VRSTE) for (const d of dnevi) for (const izid of ["da", "ne"] as const) kljuci.push(kljuc(slug, v.id, d, izid));
  const vrednosti = await kv.mget(kljuci);
  const po_vrstah: Record<string, { da: number; ne: number }> = {};
  let i = 0;
  for (const v of VRSTE) {
    po_vrstah[v.id] = { da: 0, ne: 0 };
    for (const _ of dnevi) for (const izid of ["da", "ne"] as const) po_vrstah[v.id][izid] += Number(vrednosti[i++] ?? 0);
  }
  const skupaj = Object.values(po_vrstah).reduce((s, x) => ({ da: s.da + x.da, ne: s.ne + x.ne }), { da: 0, ne: 0 });
  return { dni: DNI, skupaj, po_vrstah };
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  if (u.searchParams.get("izvoz") === "1") {
    const kljucIzvoza = process.env.NAJDBE_IZVOZ_KLJUC;
    if (!kljucIzvoza || u.searchParams.get("kljuc") !== kljucIzvoza) return NextResponse.json({ napaka: "ni dovoljeno" }, { status: 401 });
    const vrstice = await kv.seznam("zapisi", 5000);
    return NextResponse.json({ zapisi: vrstice.map((v) => JSON.parse(v)) });
  }
  const slug = u.searchParams.get("slug") ?? "";
  if (!TOCKE.some((t) => t.slug === slug)) return NextResponse.json({ napaka: "neznano območje" }, { status: 400 });
  if (!kvNaVoljo) return NextResponse.json({ nadelovanju: false, dni: DNI, skupaj: { da: 0, ne: 0 }, po_vrstah: {} });
  try {
    return NextResponse.json(await statistika(slug));
  } catch {
    return NextResponse.json({ napaka: "shramba ni dosegljiva" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!kvNaVoljo) return NextResponse.json({ napaka: "shramba ni nastavljena" }, { status: 503 });
  let telo: { slug?: string; vrsta?: string; najdeno?: boolean };
  try {
    telo = await req.json();
  } catch {
    return NextResponse.json({ napaka: "napačna zahteva" }, { status: 400 });
  }
  const { slug, vrsta, najdeno } = telo;
  if (!TOCKE.some((t) => t.slug === slug) || !VRSTE.some((v) => v.id === vrsta) || typeof najdeno !== "boolean") {
    return NextResponse.json({ napaka: "napačna zahteva" }, { status: 400 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "neznan";
  const d = dan();
  try {
    // En glas na območje, vrsto in dan z istega naslova
    if (!(await kv.prvic(`rl:${ip}:${slug}:${vrsta}:${d}`, 86400))) {
      return NextResponse.json({ napaka: "danes si za to območje že odgovoril" }, { status: 429 });
    }
    await kv.incr([kljuc(slug!, vrsta!, d, najdeno ? "da" : "ne")]);
    await kv.zapisi("zapisi", JSON.stringify({ slug, vrsta, najdeno, datum: d, ts: Date.now() }), 20000);
    return NextResponse.json(await statistika(slug!));
  } catch {
    return NextResponse.json({ napaka: "shramba ni dosegljiva" }, { status: 503 });
  }
}
