"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { mojaObmocja, poslusaj } from "@/lib/moja";
import { barva, besediloNa, OZNAKE, stopnja, type VrstaId } from "@/lib/vrste";
import type { TockaNapoved } from "@/lib/napoved";

export default function MojaObmocja({ tocke, vrsta, dIdx }: { tocke: TockaNapoved[]; vrsta: VrstaId; dIdx: number }) {
  const [moje, setMoje] = useState<string[]>([]);
  useEffect(() => {
    const osvezi = () => setMoje(mojaObmocja());
    osvezi();
    return poslusaj(osvezi);
  }, []);
  const izbrane = tocke.filter((t) => moje.includes(t.slug));
  if (!izbrane.length) return null;

  return (
    <section className="odsek moja-obmocja">
      <div className="odsek-glava">
        <h2 className="naslov">Moja območja</h2>
        <Link href="/regije">Dodaj še kakšno</Link>
      </div>
      <div className="mreza-regij">
        {izbrane.map((t) => {
          const v = t.indeks[vrsta][dIdx];
          return (
            <Link key={t.slug} href={`/regija/${t.slug}`} className="kartica">
              <div className="kartica-glava">
                <div><strong>{t.ime}</strong><span>{OZNAKE[stopnja(v)]}</span></div>
                <span className="znacka" style={{ background: barva(v), color: besediloNa(v) }}>{v}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
