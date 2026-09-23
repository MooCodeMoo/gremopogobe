// Vir: Mikološka zveza Slovenije, seznam društev (gobe-zveza.si/drustva).
// Namenoma brez osebnih e-naslovov - kontakte hranimo pri viru.
export type Drustvo = { ime: string; kraj: string; regija: string; od?: number; splet?: string };

export const DRUSTVA: Drustvo[] = [
  { ime: "GD Bisernica", kraj: "Celje", regija: "Savinjska", od: 1964, splet: "http://www.drustvo-bisernica.si/" },
  { ime: "GD Ajdovec", kraj: "Gornji Grad", regija: "Savinjska", od: 1996 },
  { ime: "GMD Polzela", kraj: "Polzela", regija: "Savinjska", od: 2005, splet: "https://www.facebook.com/profile.php?id=100010807513991" },
  { ime: "MD Kostanjevka", kraj: "Zreče", regija: "Savinjska", od: 1992 },
  { ime: "GD Kozjansko", kraj: "Kozje", regija: "Posavje", od: 2006 },
  { ime: "GD Sinji goban", kraj: "Laško", regija: "Savinjska", od: 1986 },
  { ime: "GD Lisička", kraj: "Maribor", regija: "Štajerska", od: 1966, splet: "http://www.gobe.si/" },
  { ime: "GD Snežka", kraj: "Miklavž na Dravskem polju", regija: "Štajerska", od: 2013, splet: "https://www.facebook.com/gobarskodrustvo.snezka" },
  { ime: "GD Ptuj", kraj: "Ptuj", regija: "Štajerska", od: 2011, splet: "https://www.facebook.com/GobarskoDrustvoPtuj" },
  { ime: "DG Ježek", kraj: "Muta in Vuzenica", regija: "Koroška", od: 1995, splet: "https://www.facebook.com/drustvo.gobarjev.jezek" },
  { ime: "GD Šmartno pri Slovenj Gradcu", kraj: "Šmartno pri Slovenj Gradcu", regija: "Koroška", od: 2000 },
  { ime: "GMD Ljubljana", kraj: "Ljubljana", regija: "Osrednja Slovenija", splet: "http://www.gobarji.si/" },
  { ime: "GMD Ig", kraj: "Ig", regija: "Osrednja Slovenija", od: 2014 },
  { ime: "DG Štorovke", kraj: "Videm - Dobrepolje", regija: "Osrednja Slovenija", od: 2005 },
  { ime: "MD Notranjske", kraj: "Cerknica", regija: "Notranjska", od: 1983 },
  { ime: "GD Ribnica", kraj: "Ribnica", regija: "Dolenjska", od: 1975 },
  { ime: "GD Novo mesto", kraj: "Novo mesto", regija: "Dolenjska", od: 1978, splet: "http://www.gdnm.si/" },
  { ime: "Belokranjsko GD", kraj: "Semič", regija: "Dolenjska", od: 2011 },
  { ime: "GD Nova Gorica", kraj: "Nova Gorica", regija: "Primorska", od: 2006, splet: "https://gobarskodrustvo-novagorica.si/" },
  { ime: "GD Sežana", kraj: "Sežana", regija: "Primorska", od: 1974 },
];

export const VIR_MZS = "https://www.gobe-zveza.si/drustva/";
