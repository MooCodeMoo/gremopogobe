"use client";
// Fotografijo pomanjšamo že v brskalniku, preden jo naložimo. Telefonska fotografija je
// običajno 3-10 MB; za galerijo zadošča 1600 px na daljši stranici (okoli 300-600 KB).
// Ob ponovnem kodiranju se izgubijo tudi vsi EXIF podatki, torej tudi lokacija.

const NAJVECJA_STRANICA = 1600;
const KAKOVOST = 0.82;

export async function pomanjsaj(datoteka: File): Promise<File> {
  const url = URL.createObjectURL(datoteka);
  try {
    const slika = new Image();
    slika.src = url;
    await slika.decode(); // brskalnik upošteva tudi zasuk iz EXIF

    const razmerje = Math.min(1, NAJVECJA_STRANICA / Math.max(slika.naturalWidth, slika.naturalHeight));
    const w = Math.max(1, Math.round(slika.naturalWidth * razmerje));
    const h = Math.max(1, Math.round(slika.naturalHeight * razmerje));

    const platno = document.createElement("canvas");
    platno.width = w;
    platno.height = h;
    const ctx = platno.getContext("2d");
    if (!ctx) throw new Error("platno ni na voljo");
    ctx.drawImage(slika, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((res) => platno.toBlob(res, "image/jpeg", KAKOVOST));
    if (!blob) throw new Error("pretvorba ni uspela");
    return new File([blob], "najdba.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}
