import { NextResponse } from "next/server";
import { kvNaVoljo } from "@/lib/kv";
import { TOCKE } from "@/lib/napoved";
import { URL_STRANI } from "@/lib/seo";
import { dodajVSeznam, idIz, novZeton, posljiPosto, preberi, shrani, veljavenEmail } from "@/lib/prijave";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!kvNaVoljo || !process.env.RESEND_API_KEY) return NextResponse.json({ napaka: "prijava trenutno ni mogoča" }, { status: 503 });
  let telo: { email?: string; obmocja?: string[] };
  try { telo = await req.json(); } catch { return NextResponse.json({ napaka: "napačna zahteva" }, { status: 400 }); }

  const email = (telo.email ?? "").trim().toLowerCase();
  const obmocja = (telo.obmocja ?? []).filter((s) => TOCKE.some((t) => t.slug === s)).slice(0, 30);
  if (!veljavenEmail(email)) return NextResponse.json({ napaka: "vpiši veljaven e-naslov" }, { status: 400 });

  const id = idIz(email);
  const obstoj = await preberi(id);
  const zeton = obstoj?.zeton ?? novZeton();
  await shrani(id, { email, obmocja, potrjen: obstoj?.potrjen ?? false, zeton, ustvarjen: obstoj?.ustvarjen ?? new Date().toISOString() });

  if (obstoj?.potrjen) {
    await dodajVSeznam(id);
    return NextResponse.json({ stanje: "posodobljeno" });
  }

  const potrdi = `${URL_STRANI}/api/prijava/potrdi?id=${id}&t=${zeton}`;
  try {
    await posljiPosto([{
    to: email,
    subject: "Potrdi prijavo na gobarsko napoved",
    html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;color:#1D2118;">
      <a href="${URL_STRANI}" style="display:inline-block;margin-bottom:14px;"><img src="${URL_STRANI}/brand/logo.png" alt="gremo po gobe" width="150" style="display:block;border:0;"></a>
      <h1 style="font-size:22px;">Še en klik</h1>
      <p style="line-height:1.55;">Potrdi, da želiš ob četrtkih prejemati gobarsko napoved za${obmocja.length ? " svoja izbrana območja" : " vso Slovenijo"}.</p>
      <p><a href="${potrdi}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#0F3320;color:#fff;text-decoration:none;font-weight:600;">Potrdi prijavo</a></p>
      <p style="color:#5A5E51;font-size:13px;line-height:1.5;">Če se nisi prijavil ti, sporočilo preprosto izbriši - brez potrditve ti ne bomo pisali.</p>
    </div>`,
    }]);
  } catch (e) {
    console.error("Pošiljanje potrditve ni uspelo:", e);
    const podrobnosti = String(e).slice(0, 160);
    return NextResponse.json(
      { napaka: "Potrditvenega sporočila ni bilo mogoče poslati.", podrobnosti },
      { status: 502 }
    );
  }
  return NextResponse.json({ stanje: "potrditev-poslana" });
}
