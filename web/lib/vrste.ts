import model from "@/data/model.json";

export type VrstaId = "jurcek" | "lisicka" | "marela" | "storovka";

export type Vrsta = {
  id: VrstaId;
  ime: string;
  /** temperaturno okno tal [min, opt_od, opt_do, max] v °C */
  temp: [number, number, number, number];
  /** sezonski faktor po mesecih (1-12) */
  sezona: Partial<Record<number, number>>;
};

const IMENA: Record<VrstaId, string> = { jurcek: "Jurček", lisicka: "Lisička", marela: "Marela", storovka: "Štorovka" };
type ModelVrsta = { temp: number[]; sezona: Record<string, number> };

// Parametri se berejo iz data/model.json (izhod kalibracija.py).
export const VRSTE: Vrsta[] = (Object.keys(IMENA) as VrstaId[]).map((id) => {
  const m = (model.vrste as Record<string, ModelVrsta>)[id];
  return {
    id,
    ime: IMENA[id],
    temp: m.temp as [number, number, number, number],
    sezona: Object.fromEntries(Object.entries(m.sezona).map(([k, v]) => [Number(k), v])),
  };
});

export const LESTVICA = ["#E6E0D1", "#DCC593", "#D69A4B", "#B85E2A", "#6B2A15"];
export const OZNAKE = ["Slabo", "Skromno", "Srednje", "Dobro", "Odlično"];
export const stopnja = (v: number) => Math.max(0, Math.min(4, Math.floor(v / 20)));
export const barva = (v: number) => LESTVICA[stopnja(v)];
export const besediloNa = (v: number) => (stopnja(v) >= 3 ? "#FFFFFF" : "#1D2118");
