import model from "@/data/model.json";
import { VRSTE, type VrstaId } from "./vrste";

// Parametri modela iz data/model.json (izhod kalibracija.py).
export const DEZ_ZAMIK = model.dez_zamik as [number, number]; // dnevi nazaj, ko dež najbolj šteje
const DEZ_MIN = model.dez_min, DEZ_OPT = model.dez_opt; // mm v oknu zamika
const VLAGA_MIN = model.vlaga_min, VLAGA_OPT = model.vlaga_opt; // m³/m³, sloj 3-9 cm
const VROCINA_T = 27, VROCINA_DEZ = 5, VROCINA_KAZEN = 0.6;

export type Vreme = {
  datum: string[]; // ISO dnevi, najprej pretekli, nato napoved
  padavine: number[];
  tmax: number[];
  tempTal: number[];
  vlagaTal: number[];
};

export type Gonila = { dezMm: number; tempTal: number; vlaga: number };

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const vsota = (a: number[]) => a.reduce((s, x) => s + x, 0);
const povp = (a: number[]) => vsota(a) / Math.max(1, a.length);

function trapez(t: number, [lo, o1, o2, hi]: [number, number, number, number]) {
  if (t <= lo || t >= hi) return 0;
  if (t < o1) return (t - lo) / (o1 - lo);
  if (t > o2) return (hi - t) / (hi - o2);
  return 1;
}

// Zglajeno okno: dež posameznega dne šteje po zvonasti uteži, namesto da bi
// nenadoma izpadel iz okvira. jedro = {vrh, sirina, dolzina} iz model.json.
type Jedro = { vrh: number; sirina: number; dolzina: number };
const JEDRO: Jedro | null = (model as { dez_kernel?: Jedro }).dez_kernel ?? null;
export const EKV_DNI = 19; // utežen dež pretvorimo v primerljivo vsoto mm

export const dolzinaOkna = JEDRO ? JEDRO.dolzina : DEZ_ZAMIK[1];

function tehtanDez(padavine: number[], i: number) {
  if (!JEDRO) {
    const [a, b] = DEZ_ZAMIK;
    return vsota(padavine.slice(Math.max(0, i - b), Math.max(0, i - a + 1)));
  }
  let vsotaUtezi = 0, vsotaDeza = 0;
  for (let zamik = 1; zamik <= JEDRO.dolzina; zamik++) {
    const j = i - zamik;
    if (j < 0) continue;
    const w = Math.exp(-((zamik - JEDRO.vrh) ** 2) / (2 * JEDRO.sirina ** 2));
    vsotaUtezi += w;
    vsotaDeza += w * padavine[j];
  }
  return vsotaUtezi > 0 ? (vsotaDeza / vsotaUtezi) * EKV_DNI : 0;
}

export function gonila(v: Vreme, i: number): Gonila {
  return {
    dezMm: tehtanDez(v.padavine, i),
    tempTal: povp(v.tempTal.slice(Math.max(0, i - 4), i + 1)),
    vlaga: v.vlagaTal[i],
  };
}

export function indeks(v: Vreme, i: number, vrstaId: VrstaId): number {
  const vrsta = VRSTE.find((x) => x.id === vrstaId)!;
  const g = gonila(v, i);
  const sDez = clamp((g.dezMm - DEZ_MIN) / (DEZ_OPT - DEZ_MIN));
  const sVlaga = clamp((g.vlaga - VLAGA_MIN) / (VLAGA_OPT - VLAGA_MIN));
  const sTemp = trapez(g.tempTal, vrsta.temp);
  const sSez = vrsta.sezona[new Date(v.datum[i]).getMonth() + 1] ?? 0;
  const zadnji = (a: number[]) => a.slice(Math.max(0, i - 4), i + 1);
  const kazen =
    Math.max(...zadnji(v.tmax)) > VROCINA_T && vsota(zadnji(v.padavine)) < VROCINA_DEZ ? VROCINA_KAZEN : 1;
  return Math.round(100 * sSez * sTemp * (0.6 * sDez + 0.4 * sVlaga) * kazen);
}
