export type Clanek = { slug: string; naslov: string; opis: string; datum: string; preverjeno: string; branje: string; slika: string; slikaAlt: string; slikaVir: string; naslovSeo: string; og: string };

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
    naslovSeo: "Kdaj rastejo jurčki? Dež, temperatura in zamik",
    og: "/clanki/og-kdaj-rastejo-jurcki.jpg",
  },
  {
    slug: "kako-brati-napoved",
    naslov: "Kako brati napoved gob: kaj pomeni indeks 70 in česa ne pove",
    opis: "Iz česa nastane indeks ugodnosti, zakaj je največ 90, zakaj se čez teden malo spreminja in kako dobra je napoved. Z računskim primerom in viri.",
    datum: "2026-11-03",
    preverjeno: "3. 11. 2026",
    branje: "7 min",
    slika: "/clanki/indeks-hero.webp",
    slikaAlt: "Mlad jurček v mahu",
    slikaVir: "Foto: Bernie, javna last",
    naslovSeo: "Kako brati napoved gob in indeks ugodnosti",
    og: "/clanki/og-kako-brati-napoved.jpg",
  },
];
