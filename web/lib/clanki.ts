export type Clanek = { slug: string; naslov: string; opis: string; datum: string; preverjeno: string; branje: string; slika: string; slikaAlt: string; slikaVir: string };

export const CLANKI: Clanek[] = [
  {
    slug: "kdaj-rastejo-jurcki",
    naslov: "Kdaj rastejo jurčki? Dež od prejšnjega tedna šteje več kot dež včeraj",
    opis: "Zakaj jurčkov ni takoj po dežju, kolikšen je zamik, kakšna temperatura jim ustreza in kako iz vremena razbrati dober dan za gobe. S preverjenimi viri.",
    datum: "2026-10-31",
    preverjeno: "31. 10. 2026",
    branje: "6 min",
    slika: "/clanki/jurcka-gozd.webp",
    slikaAlt: "Dva jurčka med praprotjo v gozdu",
    slikaVir: "Foto: Holger Krisp, CC BY 3.0",
  },
];
