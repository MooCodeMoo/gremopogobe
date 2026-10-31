"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/sledi";

const BESEDILA = ["Včeraj si pa bila.", "Še ti preveri. Jaz sem že trikrat."];

export default function Stran404() {
  const router = useRouter();
  const [b, setB] = useState(0);
  const [mah, setMah] = useState(false);

  function kosara() {
    setB((x) => (x + 1) % BESEDILA.length);
    setMah(true);
    setTimeout(() => setMah(false), 700);
    track("kosara");
  }
  function nazaj() {
    if (window.history.length > 1) router.back();
    else router.push("/regije");
  }

  return (
    <main className="n4">
      <div className="n4-scena">
        <Image src="/404/ilustracija.webp" alt="Gobar počepne ob prazni košari, ki je ničla v številki 404. Ob košari odhaja polž." width={1774} height={887} priority sizes="(max-width: 900px) 100vw, 900px" className="n4-slika" />
        <svg className="n4-sled" viewBox="0 0 1774 887" aria-hidden="true">
          <line x1="1047" y1="319" x2="1047" y2="408" className="n4-nit" />
          <g className={`n4-pajek${mah ? " mah" : ""}`}>
            <image href="/404/pajek.webp" x="1004" y="406" width="88" height="64" />
          </g>
        </svg>
        <button type="button" className="n4-kosara" onClick={kosara} aria-label="Preglej košaro" />
        <p className={`n4-mehur${b ? " siroko" : ""}`} role="status" key={b}>{BESEDILA[b]}</p>
      </div>
      <p className="n4-pill" aria-hidden="true">{BESEDILA[b]}</p>

      <p className="n4-koda">Napaka 404</p>
      <h1>Ta stran je šla po gobe.</h1>
      <p className="n4-uvod">Pogledali smo pod listje, za štor in v košaro. Nikjer je ni. Lahko pa ti pomagamo najti boljše rastišče.</p>
      <div className="n4-gumbi">
        <Link href="/" className="n4-gumb prvi">Pokaži, kje rastejo</Link>
        <button type="button" className="n4-gumb" onClick={nazaj}>Nazaj na prejšnjo stran</button>
      </div>
      <p className="n4-inventura">Stanje košare: 0 gob, 1 pajek.</p>
    </main>
  );
}
