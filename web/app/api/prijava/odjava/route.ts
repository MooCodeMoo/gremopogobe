import { NextResponse } from "next/server";
import { URL_STRANI } from "@/lib/seo";
import { odstrani, preberi, zetonUjema } from "@/lib/prijave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function odjavi(id: string, t: string) {
  const p = await preberi(id);
  if (!p || !zetonUjema(p.zeton, t)) return false;
  await odstrani(id);
  return true;
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const ok = await odjavi(u.searchParams.get("id") ?? "", u.searchParams.get("t") ?? "");
  return NextResponse.redirect(`${URL_STRANI}/prijava?stanje=${ok ? "odjavljen" : "napaka"}`);
}

// Odjava z enim klikom v odjemalcu (RFC 8058)
export async function POST(req: Request) {
  const u = new URL(req.url);
  await odjavi(u.searchParams.get("id") ?? "", u.searchParams.get("t") ?? "");
  return new NextResponse(null, { status: 204 });
}
