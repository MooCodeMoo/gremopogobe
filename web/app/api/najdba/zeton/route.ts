import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { blobNaVoljo } from "@/lib/blob";
import { TOCKE } from "@/lib/napoved";
import { VRSTE } from "@/lib/vrste";

export const runtime = "nodejs";

// Fotografija gre naravnost iz brskalnika v shrambo, mimo te funkcije - Vercel ima za
// strežniške funkcije trdo omejitev velikosti zahteve (~4.5 MB), ki bi jo prava telefonska
// fotografija zlahka presegla. Ta pot le izda kratkotrajen žeton in preveri pot/velikost/tip.
const NAJVECJA_SLIKA = 20 * 1024 * 1024;

export async function POST(req: Request) {
  if (!blobNaVoljo) return NextResponse.json({ napaka: "nalaganje fotografij trenutno ni na voljo" }, { status: 503 });
  const telo = (await req.json()) as HandleUploadBody;
  try {
    const odgovor = await handleUpload({
      body: telo,
      request: req,
      onBeforeGenerateToken: async (pot) => {
        const [koren, slug] = pot.split("/");
        if (koren !== "najdbe" || !TOCKE.some((t) => t.slug === slug)) throw new Error("napačna pot");
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
    return NextResponse.json({ napaka: (e as Error).message || "nalaganje ni uspelo" }, { status: 400 });
  }
}
