import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { blobNaVoljo } from "@/lib/blob";
import { kv, kvNaVoljo } from "@/lib/kv";
import { TOCKE } from "@/lib/napoved";
import { VRSTE } from "@/lib/vrste";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fotografija gre naravnost iz brskalnika v shrambo, mimo te funkcije - Vercel ima za
// strežniške funkcije trdo omejitev velikosti zahteve (~4.5 MB). Ta pot le izda kratkotrajen
// žeton in preveri pot, velikost, tip in dnevno omejitev.
const NAJVECJA_SLIKA = 6 * 1024 * 1024; // brskalnik jo pred nalaganjem pomanjša na ~0,5 MB
const NAJVEC_ZETONOV_NA_DAN = 8;

const ipIz = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "neznan";
const danes = () => new Date().toISOString().slice(0, 10);

/** Vrne razlog zavrnitve ali null, če je vse v redu. `porabi` šteje poskus proti dnevni omejitvi. */
async function preveri(req: Request, slug: string, vrsta: string, porabi: boolean): Promise<string | null> {
  if (!blobNaVoljo) return "nalaganje fotografij trenutno ni na voljo";
  if (!TOCKE.some((t) => t.slug === slug) || !VRSTE.some((v) => v.id === vrsta)) return "napačna zahteva";
  if (!kvNaVoljo) return null;
  const ip = ipIz(req), d = danes();
  // Enak ključ kot pri oddaji poročila: kdor je danes že odgovoril, ne more naložiti nove slike
  if (await kv.get(`rl:${ip}:${slug}:${vrsta}:${d}`)) return "za to vrsto si danes že odgovoril";
  if (porabi) {
    const kljuc = `zt:${ip}:${d}`;
    const [st] = (await kv.ukazi([["INCR", kljuc], ["EXPIRE", kljuc, 86400]])) as number[];
    if (Number(st) > NAJVEC_ZETONOV_NA_DAN) return "danes je bilo preveč poskusov nalaganja";
  }
  return null;
}

/** Predpreverjanje za vmesnik: ali je nalaganje sploh mogoče in zakaj ne. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const razlog = await preveri(req, u.searchParams.get("slug") ?? "", u.searchParams.get("vrsta") ?? "", false).catch(() => "shramba ni dosegljiva");
  return NextResponse.json({ nastavljeno: blobNaVoljo, ok: razlog === null, napaka: razlog ?? undefined });
}

export async function POST(req: Request) {
  let telo: HandleUploadBody;
  try {
    telo = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ napaka: "napačna zahteva" }, { status: 400 });
  }
  try {
    const odgovor = await handleUpload({
      body: telo,
      request: req,
      onBeforeGenerateToken: async (pot) => {
        const [koren, slug, ime] = pot.split("/");
        const vrsta = (ime ?? "").split(".")[0];
        if (koren !== "najdbe") throw new Error("napačna pot");
        const razlog = await preveri(req, slug, vrsta, true);
        if (razlog) throw new Error(razlog);
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
          maximumSizeInBytes: NAJVECJA_SLIKA,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(odgovor);
  } catch (e) {
    console.error("Žeton za nalaganje ni bil izdan:", e);
    return NextResponse.json({ napaka: (e as Error).message || "nalaganje ni uspelo" }, { status: 400 });
  }
}
