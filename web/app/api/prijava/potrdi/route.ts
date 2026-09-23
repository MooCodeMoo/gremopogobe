import { NextResponse } from "next/server";
import { URL_STRANI } from "@/lib/seo";
import { dodajVSeznam, preberi, shrani, zetonUjema } from "@/lib/prijave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("id") ?? "";
  const t = u.searchParams.get("t") ?? "";
  const p = await preberi(id);
  if (!p || !zetonUjema(p.zeton, t)) return NextResponse.redirect(`${URL_STRANI}/prijava?stanje=napaka`);
  await shrani(id, { ...p, potrjen: true });
  await dodajVSeznam(id);
  return NextResponse.redirect(`${URL_STRANI}/prijava?stanje=potrjeno`);
}
