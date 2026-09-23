import tocke from "@/data/tocke.json";
import model from "@/data/model.json";
import { VRSTE, type VrstaId } from "./vrste";
import { dolzinaOkna, gonila, indeks, type Gonila, type Vreme } from "./indeks";
import { faktorGozda, gozdTocke } from "./gozd";

export type Tocka = { slug: string; ime: string; regija: string; lat: number; lon: number };
export const TOCKE = tocke as Tocka[];

// Toliko preteklih dni, da pokrijemo okno dežja iz modela (vsaj 14 za graf)
export const PRETEKLI_DNI = Math.min(92, Math.max(14, dolzinaOkna)); // Open-Meteo dovoli največ 92 preteklih dni
export const DNI_NAPOVEDI = 7;
export const OSVEZI_S = 3 * 60 * 60; // 3 ure

export type TockaNapoved = Tocka & {
  visina: number | null;
  indeks: Record<VrstaId, number[]>; // po en na dan napovedi, z upoštevanim tipom gozda
  indeksVreme: Record<VrstaId, number[]>; // samo vreme (za interpolacijo na zemljevidu)
  gonila: Gonila[]; // po en na dan napovedi
  padavine14: number[]; // zadnjih 28 preteklih dni, za graf
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
  // Do 3 poskusi z zamikom - Open-Meteo občasno vrne 429 (omejitev) ali 5xx
  let res: Response | null = null;
  let razlog = "";
  for (let k = 0; k < 3; k++) {
    try {
      res = await fetch(`${base}?${q}${key}`, { next: { revalidate: OSVEZI_S } });
      if (res.ok) break;
      razlog = `${res.status} ${(await res.text()).slice(0, 200)}`;
    } catch (e) {
      razlog = String(e);
    }
    res = null;
    await new Promise((r) => setTimeout(r, 1500 * (k + 1)));
  }
  if (!res) throw new Error(`Open-Meteo: ${razlog}`);
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
    // Današnji dan poiščemo po datumu, ne po številu dni, ker vir lahko vrne drugačen razpon
    const danasnji = new Date().toISOString().slice(0, 10);
    const najden = vreme[0].datum.indexOf(danasnji);
    const danes = najden >= 0 ? najden : PRETEKLI_DNI;
    const dnevi = vreme[0].datum.slice(danes);
    if (dnevi.length === 0) throw new Error("Vir ni vrnil napovedi za naprej");
    const tocke = TOCKE.map((t, j) => {
      const v = vreme[j];
      const idx = dnevi.map((_, k) => danes + k);
      return {
        ...t,
        visina: v.visina,
        indeksVreme: Object.fromEntries(VRSTE.map((s) => [s.id, idx.map((i) => indeks(v, i, s.id))])) as Record<VrstaId, number[]>,
        indeks: Object.fromEntries(VRSTE.map((s) => {
          const g = gozdTocke(t.slug);
          const f = faktorGozda(s.id, g?.gozd, g?.sestava);
          return [s.id, idx.map((i) => Math.round(indeks(v, i, s.id) * f))];
        })) as Record<VrstaId, number[]>,
        gonila: idx.map((i) => gonila(v, i)),
        padavine14: v.padavine.slice(Math.max(0, danes - 28), danes),
      };
    });
    return { dnevi, posodobljeno: new Date().toISOString(), tocke };
  } catch (e) {
    console.error("Napoved ni na voljo:", e);
    // Med buildom vrnemo prazno stanje, da deploy uspe. Med delovanjem (ISR) pa napako vržemo:
    // Next.js tedaj obdrži zadnjo uspešno različico strani, namesto da bi jo zamenjal s prazno.
    if (process.env.NEXT_PHASE === "phase-production-build") return null;
    throw e;
  }
}

const DNEVI = ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];
export const kratekDan = (iso: string) => DNEVI[new Date(iso).getDay()];
export const datumKratko = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}. ${d.getMonth() + 1}.`;
};
