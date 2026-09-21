export type VrstaId = "jurcek" | "lisicka" | "marela" | "storovka";

export type Vrsta = {
  id: VrstaId;
  ime: string;
  /** temperaturno okno tal [min, opt_od, opt_do, max] v °C */
  temp: [number, number, number, number];
  /** sezonski faktor po mesecih (1-12) */
  sezona: Partial<Record<number, number>>;
};

export const VRSTE: Vrsta[] = [
  { id: "jurcek", ime: "Jurček", temp: [8, 12, 18, 23], sezona: { 6: 0.6, 7: 0.8, 8: 0.9, 9: 1, 10: 0.9, 11: 0.3 } },
  { id: "lisicka", ime: "Lisička", temp: [10, 13, 20, 25], sezona: { 6: 0.8, 7: 1, 8: 1, 9: 0.9, 10: 0.6 } },
  { id: "marela", ime: "Marela", temp: [10, 14, 21, 26], sezona: { 7: 0.7, 8: 1, 9: 1, 10: 0.7, 11: 0.2 } },
  { id: "storovka", ime: "Štorovka", temp: [5, 9, 15, 19], sezona: { 9: 0.7, 10: 1, 11: 0.9, 12: 0.3 } },
];

export const LESTVICA = ["#E6E0D1", "#DCC593", "#D69A4B", "#B85E2A", "#6B2A15"];
export const OZNAKE = ["Slabo", "Skromno", "Srednje", "Dobro", "Odlično"];
export const stopnja = (v: number) => Math.max(0, Math.min(4, Math.floor(v / 20)));
export const barva = (v: number) => LESTVICA[stopnja(v)];
export const besediloNa = (v: number) => (stopnja(v) >= 3 ? "#FFFFFF" : "#1D2118");
