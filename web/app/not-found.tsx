import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Strani ni | Gremo po gobe",
  description: "Te strani ni. Niti jurčka ne.",
  robots: { index: false, follow: true },
};

/** Prazna košara namesto ničle: 4 [košara] 4. Vse narisano z SVG, brez slik. */
function PrazenGozd() {
  return (
    <svg className="n404-slika" viewBox="0 0 720 330" role="img" aria-label="Številka 404, kjer je ničla prazna košara s pajkom, ob njej polž">
      {/* tla */}
      <path d="M0 292 Q180 268 360 280 T720 286 V330 H0 Z" className="n404-tla" />
      <path d="M0 306 Q240 292 480 304 T720 300 V330 H0 Z" className="n404-tla2" />
      {/* listje */}
      <ellipse cx="96" cy="296" rx="16" ry="6" className="n404-list" transform="rotate(-14 96 296)" />
      <ellipse cx="238" cy="304" rx="13" ry="5" className="n404-list l2" transform="rotate(10 238 304)" />
      <ellipse cx="500" cy="302" rx="15" ry="5.5" className="n404-list" transform="rotate(-8 500 302)" />
      <ellipse cx="660" cy="312" rx="12" ry="5" className="n404-list l2" transform="rotate(16 660 312)" />
      {/* trava */}
      {[44, 188, 540, 676].map((x) => (
        <g key={x} className="n404-trava"><path d={`M${x} 292 q-4 -18 -9 -24`} /><path d={`M${x} 292 q1 -22 0 -30`} /><path d={`M${x} 292 q5 -16 11 -22`} /></g>
      ))}

      {/* 4 in 4 */}
      <text x="140" y="268" textAnchor="middle" className="n404-st">4</text>
      <text x="580" y="268" textAnchor="middle" className="n404-st">4</text>

      {/* košara = ničla */}
      <path d="M268 156 Q360 6 452 156" className="n404-rocaj" />
      <path d="M262 154 H458 L438 262 Q434 278 418 278 H302 Q286 278 282 262 Z" className="n404-telo" />
      <g className="n404-pletenje">
        {[184, 206, 228, 250].map((y) => <path key={y} d={`M${272 - (y - 154) * 0.0} ${y} H${448}`} />)}
        {[300, 330, 360, 390, 420].map((x) => <path key={x} d={`M${x} 160 V276`} />)}
      </g>
      <ellipse cx="360" cy="156" rx="99" ry="17" className="n404-odprtina" />
      {/* pajčevina v odprtini */}
      <g className="n404-mreza">
        <path d="M270 156 L450 156 M360 140 V172 M296 146 L424 166 M296 166 L424 146" />
        <path d="M330 156 Q360 148 390 156 Q360 164 330 156" />
        <path d="M312 156 Q360 143 408 156 Q360 169 312 156" />
      </g>
      {/* pajek na niti */}
      <g className="n404-pajek">
        <path d="M360 84 V128" className="n404-nit" />
        <circle cx="360" cy="134" r="6.5" className="n404-telo-pajka" />
        <circle cx="360" cy="125" r="3.6" className="n404-telo-pajka" />
        <circle cx="358.6" cy="124.2" r="1" className="n404-oko" /><circle cx="361.8" cy="124.2" r="1" className="n404-oko" />
        <path d="M354 131 l-9 -4 M354 135 l-10 1 M355 139 l-8 6 M366 131 l9 -4 M366 135 l10 1 M365 139 l8 6" className="n404-noge" />
      </g>

      {/* polž, ki odhaja */}
      <g className="n404-polz" transform="translate(664 282)">
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
