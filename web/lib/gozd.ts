import gozdRaw from "@/data/gozd.json";
import type { VrstaId } from "./vrste";

// Sestava gozda iz sestojne karte ZGS (izhod indeks/gozd.py). Če podatkov ni, je vpliv nevtralen.
type VrstaGozd = { utezi: number[]; gozd: number; negozd: number; norm?: number; uporabi: boolean };
type TockaGozd = { gozd: number; sestava: number[] | null };
const gozd = gozdRaw as unknown as {
  vrste: Partial<Record<VrstaId, VrstaGozd>>;
  tocke: Record<string, TockaGozd>;
  pike: number[][];
};

export const SKUPINE = [
  { ime: "Smreka in jelka", barva: "#2F5D46" },
  { ime: "Bor in macesen", barva: "#7A9A5B" },
  { ime: "Bukev", barva: "#C08A3E" },
  { ime: "Hrast", barva: "#8A5A2B" },
  { ime: "Drugi listavci", barva: "#C9B98A" },
];

export const imaGozdnePodatke = gozd.pike.length > 0;
export const gozdTocke = (slug: string): TockaGozd | null => gozd.tocke[slug] ?? null;

/** Faktor 0,35-1: kako primeren je gozd na lokaciji za vrsto. 1 = brez vpliva ali idealno. */
export function faktorGozda(vrsta: VrstaId, delezGozda: number | undefined, sestava: number[] | null | undefined): number {
  const v = gozd.vrste[vrsta];
  if (!v || !v.uporabi || delezGozda === undefined) return 1;
  const gozdni = sestava ? sestava.reduce((s, x, i) => s + x * (v.utezi[i] ?? 1), 0) : 0;
  const h = (delezGozda * v.gozd * gozdni + (1 - delezGozda) * v.negozd) / (v.norm || 1);
  return 0.35 + 0.65 * Math.min(1, Math.max(0, h));
}

export function faktorPike(vrsta: VrstaId, i: number): number {
  const p = gozd.pike[i];
  if (!p) return 1;
  return faktorGozda(vrsta, p[0], p.length > 1 ? p.slice(1) : null);
}
