import { NextResponse } from "next/server";
import { kv, kvNaVoljo } from "@/lib/kv";
import { PISKOTEK, geslo_ok, znakAdmin } from "@/lib/stat";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const nazaj = (q: string) => NextResponse.redirect(new URL(`/admin${q}`, req.url), 303);
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
  if (kvNaVoljo) {
    const kljuc = `rl:admin:${ip}`;
    const [n] = (await kv.ukazi([["INCR", kljuc], ["EXPIRE", kljuc, 900]]).catch(() => [0])) as number[];
    if (n > 10) return nazaj("?napaka=veliko");
  }
  const forma = await req.formData();
  if (forma.get("izhod")) {
    const o = nazaj("");
    o.cookies.set(PISKOTEK, "", { path: "/", maxAge: 0 });
    return o;
  }
  if (!geslo_ok(String(forma.get("geslo") ?? ""))) return nazaj("?napaka=1");
  const o = nazaj("");
  o.cookies.set(PISKOTEK, znakAdmin(), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return o;
}
