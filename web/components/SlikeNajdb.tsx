"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Fotka = { slug: string; ime: string; vrsta: string; najdeno: boolean; opomba: string | null; url: string; datum: string };
const IME_VRSTE: Record<string, string> = { jurcek: "Jurček", lisicka: "Lisička", marela: "Marela", storovka: "Štorovka" };

export default function SlikeNajdb() {
  const [fotke, setFotke] = useState<Fotka[] | null>(null);

  useEffect(() => {
    fetch("/api/najdba?slike=1&n=24")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setFotke(d?.fotke ?? []))
      .catch(() => setFotke([]));
  }, []);

  if (!fotke || fotke.length === 0) return null;

  return (
    <div className="galerija-najdb">
      <h2 className="naslov">Fotografije gobarjev</h2>
      <div className="galerija-mreza">
        {fotke.map((f, i) => (
          <Link key={i} href={`/regija/${f.slug}`} className="galerija-kartica">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt={`${IME_VRSTE[f.vrsta] ?? f.vrsta}, ${f.ime}`} loading="lazy" />
            <div className="galerija-info">
              <strong>{f.ime}</strong>
              <span>{IME_VRSTE[f.vrsta] ?? f.vrsta}{f.najdeno ? "" : " - ni najdena"}</span>
              {f.opomba && <em>{f.opomba}</em>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
