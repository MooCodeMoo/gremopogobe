import { NextResponse } from "next/server";
import { URL_STRANI } from "@/lib/seo";
import { biltenHtml, napovedZaBilten } from "@/lib/bilten";
import { posljiPosto, preberi, vsePrijave } from "@/lib/prijave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const skrivnost = process.env.CRON_SECRET;
  const dovoljenje = req.headers.get("authorization");
  if (skrivnost && dovoljenje !== `Bearer ${skrivnost}`) return NextResponse.json({ napaka: "ni dovoljeno" }, { status: 401 });

  const napoved = await napovedZaBilten().catch(() => null);
  if (!napoved) return NextResponse.json({ napaka: "napoved ni na voljo" }, { status: 503 });

  const ids = await vsePrijave();
  const sporocila = [];
  for (const id of ids) {
    const p = await preberi(id);
    if (!p?.potrjen) continue;
    const odjava = `${URL_STRANI}/api/prijava/odjava?id=${id}&t=${p.zeton}`;
    sporocila.push({
      to: p.email,
      subject: "Gobarska napoved za ta vikend",
      html: biltenHtml(napoved, p.obmocja, odjava),
      headers: { "List-Unsubscribe": `<${odjava}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
  }
  if (!sporocila.length) return NextResponse.json({ poslano: 0 });
  const poslano = await posljiPosto(sporocila);
  return NextResponse.json({ poslano });
}
