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
      {[24, 205, 640, 884].map((x) => (
        <g key={x} className="n404-trava"><path d={`M${x} 292 q-4 -18 -9 -24`} /><path d={`M${x} 292 q1 -22 0 -30`} /><path d={`M${x} 292 q5 -16 11 -22`} /></g>
      ))}

      {/* 4 in 4 */}
      <text x="120" y="268" textAnchor="middle" className="n404-st">4</text>
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

      {/* nabiralec počepne h košari in jo dregne s palico */}
      <g className="n404-clovek">
        <path d="M280 234 Q326 232 340 246 L338 282" className="n404-hlace" />
        <path d="M270 236 Q312 230 322 246 L312 282" className="n404-hlace" />
        <path d="M324 282 H346 q5 0 5 4 v6 H321 v-6 q0 -4 3 -4 Z M298 282 H320 q5 0 5 4 v6 H295 v-6 q0 -4 3 -4 Z" className="n404-skornji" />
        <path d="M262 244 Q252 198 274 180 Q296 164 318 178 Q334 194 326 240 Z" className="n404-jopic" />
        <path d="M296 172 Q290 206 292 240" className="n404-zadrga" />
        <path d="M286 192 Q304 224 330 240" className="n404-roka" />
        <circle cx="332" cy="241" r="7" className="n404-dlan" />
        <circle cx="314" cy="152" r="21" className="n404-obraz" />
        <path d="M292 148 Q292 120 316 120 Q338 120 336 146 Q314 136 292 148 Z" className="n404-klobuk" />
        <path d="M330 138 q18 -3 26 5 q-12 3 -26 -1 Z" className="n404-klobuk" />
        <circle cx="320" cy="157" r="3" className="n404-oko" /><circle cx="334" cy="157" r="3" className="n404-oko" />
        <circle cx="321.5" cy="158" r="1.6" className="n404-pika" /><circle cx="335.5" cy="158" r="1.6" className="n404-pika" />
        <path d="M313 148 l10 3 M341 148 l-10 3" className="n404-obrv" />
        <path d="M322 169 H334" className="n404-usta" />
        <g className="n404-dreg">
          <path d="M314 190 Q348 196 374 214" className="n404-roka" />
          <circle cx="376" cy="215" r="7" className="n404-dlan" />
          <path d="M368 211 L440 244" className="n404-palica" />
          <path d="M404 228 l8 -9" className="n404-palica tanka" />
        </g>
      </g>
      <g className="n404-mehur" transform="translate(170 0)">
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
