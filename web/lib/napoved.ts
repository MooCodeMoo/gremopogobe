import tocke from "@/data/tocke.json";
import { VRSTE, type VrstaId } from "./vrste";
import { gonila, indeks, type Gonila, type Vreme } from "./indeks";

export type Tocka = { slug: string; ime: string; regija: string; lat: number; lon: number };
export const TOCKE = tocke as Tocka[];

export const PRETEKLI_DNI = 14;
export const DNI_NAPOVEDI = 7;
export const OSVEZI_S = 3 * 60 * 60; // 3 ure

export type TockaNapoved = Tocka & {
  visina: number | null;
  indeks: Record<VrstaId, number[]>; // po en na dan napovedi
  gonila: Gonila[]; // po en na dan napovedi
  padavine14: number[]; // pretekli dnevi, za graf
};
export type Napoved = { dnevi: string[]; posodobljeno: string; tocke: TockaNapoved[] };

type OMLokacija = {
  elevation?: number;
  daily: { time: string[]; precipitation_sum: (number | null)[]; temperature_2m_max: (number | null)[] };
  hourly: { time: string[]; soil_temperature_6cm: (number | null)[]; soil_moisture_3_to_9cm: (number | null)[] };
};

function dnevnoPovp(casi: string[], vals: (number | null)[]) {
  const m = new Map<string, number[]>();
  casi.forEach((t, i) => {
    const v = vals[i];
    if (v == null) return;
    const k = t.slice(0, 10);
    m.set(k, [...(m.get(k) ?? []), v]);
  });
  return (d: string, fallback: number) => {
    const a = m.get(d);
    return a ? a.reduce((s, x) => s + x, 0) / a.length : fallback;
  };
}

async function pridobiVreme(): Promise<(Vreme & { visina: number | null })[]> {
  const q = new URLSearchParams({
    latitude: TOCKE.map((t) => t.lat).join(","),
    longitude: TOCKE.map((t) => t.lon).join(","),
    daily: "precipitation_sum,temperature_2m_max",
    hourly: "soil_temperature_6cm,soil_moisture_3_to_9cm",
    past_days: String(PRETEKLI_DNI),
    forecast_days: String(DNI_NAPOVEDI),
    timezone: "Europe/Ljubljana",
  });
  const base = process.env.OPEN_METEO_URL ?? "https://api.open-meteo.com/v1/forecast";
  const key = process.env.OPEN_METEO_API_KEY ? `&apikey=${process.env.OPEN_METEO_API_KEY}` : "";
  const res = await fetch(`${base}?${q}${key}`, { next: { revalidate: OSVEZI_S } });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = (await res.json()) as OMLokacija | OMLokacija[];
  const lok = Array.isArray(json) ? json : [json];
  return lok.map((l) => {
    const st = dnevnoPovp(l.hourly.time, l.hourly.soil_temperature_6cm);
    const sm = dnevnoPovp(l.hourly.time, l.hourly.soil_moisture_3_to_9cm);
    return {
      datum: l.daily.time,
      padavine: l.daily.precipitation_sum.map((p) => p ?? 0),
      tmax: l.daily.temperature_2m_max.map((t) => t ?? 20),
      tempTal: l.daily.time.map((d) => st(d, 12)),
      vlagaTal: l.daily.time.map((d) => sm(d, 0.2)),
      visina: l.elevation ?? null,
    };
  });
}

/** Vrne napoved ali null, če vir ni dosegljiv. */
export async function getNapoved(): Promise<Napoved | null> {
  try {
    const vreme = await pridobiVreme();
    const danes = PRETEKLI_DNI;
    const dnevi = vreme[0].datum.slice(danes);
    const tocke = TOCKE.map((t, j) => {
      const v = vreme[j];
      const idx = dnevi.map((_, k) => danes + k);
      return {
        ...t,
        visina: v.visina,
        indeks: Object.fromEntries(VRSTE.map((s) => [s.id, idx.map((i) => indeks(v, i, s.id))])) as Record<VrstaId, number[]>,
        gonila: idx.map((i) => gonila(v, i)),
        padavine14: v.padavine.slice(0, danes),
      };
    });
    return { dnevi, posodobljeno: new Date().toISOString(), tocke };
  } catch (e) {
    console.error("Napoved ni na voljo:", e);
    return null;
  }
}

const DNEVI = ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];
export const kratekDan = (iso: string) => DNEVI[new Date(iso).getDay()];
export const datumKratko = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}. ${d.getMonth() + 1}.`;
};
