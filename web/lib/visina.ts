import visineRaw from "@/data/visine.json";
import type { VrstaId } from "./vrste";

// Trapezno okno nadmorske višine [nič, optimum od, optimum do, nič] v metrih.
// Ni kalibrirano iz podatkov, ampak povzeto po rastiščih vrst - zato je blago
// in ocene le zniža, ne pa izniči.
export const VISINSKA_OKNA: Record<VrstaId, [number, number, number, number]> = {
  jurcek: [50, 250, 1400, 1800],
  lisicka: [50, 200, 1300, 1700],
  marela: [50, 150, 900, 1300],
  storovka: [50, 150, 1100, 1500],
};

const NAJMANJ = 0.35; // izven okna vrste ne izničimo povsem

export function faktorVisine(vrsta: VrstaId, visina: number | null | undefined): number {
  if (visina == null) return 1;
  const [a, b, c, d] = VISINSKA_OKNA[vrsta];
  let f = 1;
  if (visina <= a || visina >= d) f = 0;
  else if (visina < b) f = (visina - a) / (b - a);
  else if (visina > c) f = (d - visina) / (d - c);
  return NAJMANJ + (1 - NAJMANJ) * f;
}

// Višine pik zemljevida (izhod indeks/visine.py); prazno = brez vpliva.
const VISINE = visineRaw as number[];
export const imaVisinePik = VISINE.length > 0;
export const faktorVisinePike = (vrsta: VrstaId, i: number) =>
  VISINE.length > i ? faktorVisine(vrsta, VISINE[i]) : 1;
