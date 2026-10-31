import { NextResponse } from "next/server";
import { kvNaVoljo } from "@/lib/kv";
import { DOVOLJENI_DOGODKI, PISKOTEK, jeAdmin, jeBot, ocistiPot, ocistiPovezavo, zabeleziDogodek, zabeleziObisk } from "@/lib/stat";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ok = new NextResponse(null, { status: 204 });
  if (!kvNaVoljo) return ok;
  const ua = req.headers.get("user-agent") ?? "";
  if (jeBot(ua)) return ok;
  // Lastni obiski (prijavljen v /admin) se ne štejejo
  const piskotek = req.headers.get("cookie")?.split("; ").find((c) => c.startsWith(`${PISKOTEK}=`))?.split("=")[1];
  if (jeAdmin(piskotek)) return ok;

  let t: { t?: string; p?: string; r?: string; n?: string; d?: string };
  try { t = JSON.parse(await req.text()); } catch { return ok; }
  try {
    if (t.t === "pv") {
      const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
      await zabeleziObisk({
        ip, ua, pot: ocistiPot(t.p), vir: ocistiPovezavo(t.r),
        naprava: /mobi|android|iphone|ipad/i.test(ua) ? "mobilno" : "namizno",
      });
    } else if (t.t === "ev" && typeof t.n === "string" && DOVOLJENI_DOGODKI.has(t.n)) {
      const d = typeof t.d === "string" ? t.d.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) : "";
      await zabeleziDogodek(t.n, d);
    }
  } catch { /* števec nikoli ne sme podreti strani */ }
  return ok;
}
