import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Strani ni | Gremo po gobe",
  description: "Te strani ni. Niti jurčka ne.",
  robots: { index: false, follow: true },
};

/** 4 [prazna košara] 4, ob njej razočaran nabiralec in polž. Vse narisano z SVG, brez slik. */
function PrazenGozd() {
  const vrste = [172, 192, 212, 232, 252, 272];
  return (
    <svg className="n404-slika" viewBox="0 0 900 330" role="img" aria-label="Številka 404, kjer je ničla prazna košara s pajkom. Nabiralec jo nejevoljno gleda in pravi: no daj, naredi kaj. Ob strani odhaja polž.">
      <defs>
        <clipPath id="n404-skleda"><path d="M424 150 C424 232 462 284 520 284 C578 284 616 232 616 150 Z" /></clipPath>
      </defs>
      {/* tla */}
      <path d="M0 292 Q220 266 450 280 T900 284 V330 H0 Z" className="n404-tla" />
      <path d="M0 308 Q300 292 600 305 T900 300 V330 H0 Z" className="n404-tla2" />
      <ellipse cx="520" cy="292" rx="104" ry="9" className="n404-senca" />
      {/* listje */}
      <ellipse cx="190" cy="298" rx="16" ry="6" className="n404-list" transform="rotate(-14 190 298)" />
      <ellipse cx="400" cy="306" rx="13" ry="5" className="n404-list l2" transform="rotate(10 400 306)" />
      <ellipse cx="660" cy="300" rx="15" ry="5.5" className="n404-list" transform="rotate(-8 660 300)" />
      <ellipse cx="800" cy="312" rx="12" ry="5" className="n404-list l2" transform="rotate(16 800 312)" />
      {[24, 372, 640, 884].map((x) => (
        <g key={x} className="n404-trava"><path d={`M${x} 292 q-4 -18 -9 -24`} /><path d={`M${x} 292 q1 -22 0 -30`} /><path d={`M${x} 292 q5 -16 11 -22`} /></g>
      ))}

      {/* 4 in 4 */}
      <text x="300" y="268" textAnchor="middle" className="n404-st">4</text>
      <text x="740" y="268" textAnchor="middle" className="n404-st">4</text>

      {/* košara = ničla */}
      <path d="M432 150 C432 28 608 28 608 150" className="n404-rocaj" />
      <path d="M432 150 C432 28 608 28 608 150" className="n404-rocaj-svetlo" />
      <path d="M424 150 C424 232 462 284 520 284 C578 284 616 232 616 150 Z" className="n404-telo" />
      <g clipPath="url(#n404-skleda)">
        <g className="n404-pletenje">
          {vrste.map((y, r) => (
            <g key={y}>
              <path d={`M410 ${y} H630`} />
              {Array.from({ length: 9 }, (_, k) => 416 + (r % 2) * 13 + k * 26).map((x) => <path key={x} d={`M${x} ${y - 20} V${y}`} />)}
            </g>
          ))}
        </g>
        <path d="M520 150 H640 V300 H520 Z" className="n404-sencenje" />
        <path d="M440 166 C444 214 470 250 500 266" className="n404-blesk" />
      </g>
      <path d="M424 150 C424 232 462 284 520 284 C578 284 616 232 616 150" className="n404-obris" />
      <ellipse cx="520" cy="150" rx="97" ry="16" className="n404-odprtina" />
      <ellipse cx="520" cy="150" rx="97" ry="16" className="n404-obroba" />
      <g className="n404-mreza">
        <path d="M430 150 H610 M520 135 V166 M456 141 L584 160 M456 160 L584 141" />
        <path d="M490 150 Q520 142 550 150 Q520 158 490 150" />
        <path d="M472 150 Q520 137 568 150 Q520 163 472 150" />
      </g>
      <g className="n404-pajek">
        <path d="M520 60 V122" className="n404-nit" />
        <circle cx="520" cy="130" r="6.5" className="n404-telo-pajka" />
        <circle cx="520" cy="121" r="3.6" className="n404-telo-pajka" />
        <circle cx="518.6" cy="120.2" r="1" className="n404-oko" /><circle cx="521.8" cy="120.2" r="1" className="n404-oko" />
        <path d="M514 127 l-9 -4 M514 131 l-10 1 M515 135 l-8 6 M526 127 l9 -4 M526 131 l10 1 M525 135 l8 6" className="n404-noge" />
      </g>

      {/* nabiralec, ki nejevoljno pogleduje v prazno košaro */}
      <g className="n404-clovek">
        {/* noge in škornji */}
        <path d="M86 244 V284 M108 244 V284" className="n404-hlace" />
        <path d="M76 284 H94 q4 0 4 4 v4 H72 v-4 q0 -4 4 -4 Z M100 284 H118 q4 0 4 4 v4 H96 v-4 q0 -4 4 -4 Z" className="n404-skornji" />
        {/* telo in jopič */}
        <path d="M70 176 Q70 164 82 164 H112 Q124 164 124 176 V246 H70 Z" className="n404-jopic" />
        <path d="M97 164 V246" className="n404-zadrga" />
        <rect x="76" y="212" width="16" height="14" rx="3" className="n404-zep" />
        {/* desna roka na boku */}
        <path d="M122 176 Q142 200 120 228" className="n404-roka" />
        {/* leva roka dvignjena: "no daj!" */}
        <g className="n404-roka-vihra">
          <path d="M72 178 Q44 176 36 150" className="n404-roka" />
          <circle cx="34" cy="144" r="8" className="n404-dlan" />
        </g>
        {/* glava */}
        <circle cx="97" cy="140" r="21" className="n404-obraz" />
        <path d="M74 136 Q74 108 98 108 Q122 108 121 136 Q98 124 74 136 Z" className="n404-klobuk" />
        <path d="M118 128 q16 -2 22 6 q-10 2 -22 -2 Z" className="n404-klobuk" />
        <circle cx="90" cy="144" r="2.4" className="n404-pika" /><circle cx="106" cy="144" r="2.4" className="n404-pika" />
        <path d="M84 137 l10 3 M110 137 l-10 3" className="n404-obrv" />
        <path d="M90 156 H105" className="n404-usta" />
      </g>
      {/* govorni mehurček */}
      <g className="n404-mehur">
        <path d="M24 22 H214 q12 0 12 12 v34 q0 12 -12 12 H120 l-18 22 l2 -22 H36 q-12 0 -12 -12 V34 q0 -12 12 -12 Z" />
        <text x="125" y="44" textAnchor="middle">No daj,</text>
        <text x="125" y="66" textAnchor="middle">naredi kaj!</text>
      </g>

      {/* polž, ki odhaja */}
      <g className="n404-polz" transform="translate(850 284)">
        <path d="M-30 0 Q-26 -10 -12 -10 H18 Q30 -10 34 -22 q2 -8 8 -8 M34 -22 q-4 -6 -10 -8" className="n404-polz-telo" />
        <circle cx="6" cy="-20" r="17" className="n404-hisa" />
        <path d="M6 -20 m-2 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -14 0 a13 13 0 1 1 22 0" className="n404-spirala" />
      </g>
    </svg>
  );
}

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="n404">
        <PrazenGozd />
        <p className="n404-govori" aria-hidden="true">Nabiralec pravi: »No daj, naredi kaj!«</p>
        <h1>Tukaj ni nobene gobe. Niti jurčka.</h1>
        <p className="n404-uvod">Strani, ki jo iščeš, ni. Pogledali smo pod listjem, za štorom in v košari. Samo pajek je doma.</p>
        <p className="n404-inventura">Stanje košare: 0 jurčkov, 0 lisičk, 1 pajek.</p>
        <div className="n404-gumbi">
          <Link href="/" className="n404-gumb prvi">Na napoved</Link>
          <Link href="/regije" className="n404-gumb">Poglej regije</Link>
          <Link href="/vrste/jurcek" className="n404-gumb">Kje so jurčki?</Link>
        </div>
      </main>
      <Noga />
    </>
  );
}
