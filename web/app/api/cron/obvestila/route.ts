import { NextResponse } from "next/server";
import { getNapoved, kratekDan, datumKratko } from "@/lib/napoved";
import { VRSTE } from "@/lib/vrste";
import { odstraniNarocnino, potisnNaVoljo, preberiNarocnino, pripraviWebPush, shraniNarocnino, vseNarocnine } from "@/lib/obvestila";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DNI_NAPREJ = 3; // gledamo današnji in naslednja dva dneva
const MIRO_DNI = 5; // za isto območje in vrsto ne obveščamo pogosteje

export async function GET(req: Request) {
  const skrivnost = process.env.CRON_SECRET;
  if (skrivnost && req.headers.get("authorization") !== `Bearer ${skrivnost}`) {
    return NextResponse.json({ napaka: "ni dovoljeno" }, { status: 401 });
  }
  if (!potisnNaVoljo) return NextResponse.json({ napaka: "potisna obvestila niso nastavljena" }, { status: 503 });

  const napoved = await getNapoved().catch(() => null);
  if (!napoved) return NextResponse.json({ napaka: "napoved ni na voljo" }, { status: 503 });
  const webpush = pripraviWebPush();
  const danes = new Date().toISOString().slice(0, 10);
  const staro = (d?: string) => !d || (Date.now() - new Date(d).getTime()) / 86400000 >= MIRO_DNI;

  let poslano = 0, odstranjenih = 0;
  for (const id of await vseNarocnine()) {
    const n = await preberiNarocnino(id);
    if (!n) continue;
    const tocke = napoved.tocke.filter((t) => n.obmocja.length === 0 || n.obmocja.includes(t.slug));
    const vrste = VRSTE.filter((v) => n.vrste.length === 0 || n.vrste.includes(v.id));

    let naj: { ime: string; slug: string; vrsta: string; vrstaId: string; v: number; dan: number } | null = null;
    for (const t of tocke) {
      for (const v of vrste) {
        const vals = t.indeks[v.id].slice(0, DNI_NAPREJ);
        const m = Math.max(...vals);
        if (m < n.prag || !staro(n.zadnje[`${t.slug}:${v.id}`])) continue;
        if (!naj || m > naj.v) naj = { ime: t.ime, slug: t.slug, vrsta: v.ime, vrstaId: v.id, v: m, dan: vals.indexOf(m) };
      }
    }
    if (!naj) continue;

    const dan = napoved.dnevi[naj.dan];
    const telo = JSON.stringify({
      title: `${naj.vrsta}: ${naj.ime} ${naj.v}/100`,
      body: `Razmere so se odprle. Vrh ${kratekDan(dan).toLowerCase()} ${datumKratko(dan)}.`,
      url: `/regija/${naj.slug}`,
    });
    try {
      await webpush.sendNotification({ endpoint: n.endpoint, keys: n.keys }, telo, { TTL: 86400 });
      poslano++;
      await shraniNarocnino(id, { ...n, zadnje: { ...n.zadnje, [`${naj.slug}:${naj.vrstaId}`]: danes } });
    } catch (e) {
      const koda = (e as { statusCode?: number }).statusCode;
      if (koda === 404 || koda === 410) { await odstraniNarocnino(id); odstranjenih++; }
    }
  }
  return NextResponse.json({ poslano, odstranjenih });
}
