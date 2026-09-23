"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import geo from "@/data/slovenija.json";
import { VRSTE, type VrstaId } from "@/lib/vrste";
import type { Tocka } from "@/lib/napoved";

type Podatki = { dni: number; regije: Record<string, Record<string, { da: number; ne: number }>> };

const projekcija = (lon: number, lat: number) => ({
  x: (lon - geo.proj.lon0) * geo.proj.kx,
  y: (geo.proj.lat1 - lat) * geo.proj.ky,
});

export default function ZemljevidNajdb({ tocke }: { tocke: Tocka[] }) {
  const [vrsta, setVrsta] = useState<VrstaId | "vse">("vse");
  const [podatki, setPodatki] = useState<Podatki | null>(null);
  const [nalagam, setNalagam] = useState(true);

  useEffect(() => {
    fetch("/api/najdba?zemljevid=1")
      .then((r) => (r.ok ? r.json() : null))
      .then(setPodatki)
      .catch(() => {})
      .finally(() => setNalagam(false));
  }, []);

  const vrstice = useMemo(() => {
    const r = podatki?.regije ?? {};
    return tocke.map((t) => {
      const po = r[t.slug] ?? {};
      const izbrane = vrsta === "vse" ? Object.values(po) : [po[vrsta]].filter(Boolean);
      const da = izbrane.reduce((s, x) => s + (x?.da ?? 0), 0);
      const ne = izbrane.reduce((s, x) => s + (x?.ne ?? 0), 0);
      return { ...t, ...projekcija(t.lon, t.lat), da, ne, skupaj: da + ne };
    });
  }, [podatki, tocke, vrsta]);

  const najvec = Math.max(1, ...vrstice.map((v) => v.skupaj));
  const zPorocili = vrstice.filter((v) => v.skupaj > 0).sort((a, b) => b.da - a.da || b.skupaj - a.skupaj);
  const skupajVse = vrstice.reduce((s, v) => s + v.skupaj, 0);

  return (
    <>
      <div className="seznam-kontrole">
        <div className="segment" role="group" aria-label="Vrsta">
          <button type="button" aria-pressed={vrsta === "vse"} onClick={() => setVrsta("vse")}>Vse</button>
          {VRSTE.map((v) => (
            <button key={v.id} type="button" aria-pressed={vrsta === v.id} onClick={() => setVrsta(v.id)}>{v.ime}</button>
          ))}
        </div>
        <p className="najdbe-opomba">{nalagam ? "Nalagam poročila ..." : `${skupajVse} poročil v zadnjih ${podatki?.dni ?? 14} dneh`}</p>
      </div>

      <div className="najdbe-karta">
        <div className="karta-okvir najdbe-okvir">
          <svg viewBox={`0 0 ${geo.W} ${geo.H}`} role="img" aria-label="Zemljevid poročil uporabnikov">
            <path d={geo.path} className="obris" />
            {vrstice.filter((v) => v.skupaj > 0).map((v) => {
              const r = 8 + (v.skupaj / najvec) * 22;
              const delez = v.da / v.skupaj;
              return (
                <g key={v.slug}>
                  <circle cx={v.x} cy={v.y} r={r} fill={delez >= 0.5 ? "#B85E2A" : "#9BA48E"} fillOpacity={0.25} />
                  <circle cx={v.x} cy={v.y} r={r * Math.max(0.3, delez)} fill={delez >= 0.5 ? "#8A3A1C" : "#5A5E51"} />
                </g>
              );
            })}
          </svg>
          {vrstice.filter((v) => v.skupaj > 0).slice(0, 8).map((v) => (
            <Link key={v.slug} href={`/regija/${v.slug}`} className="oznaka"
              style={{ left: `${(v.x / geo.W) * 100}%`, top: `${(v.y / geo.H) * 100}%` }}>
              <span className="znacka mala" style={{ background: v.da >= v.ne ? "#8A3A1C" : "#5A5E51", color: "#fff" }}>{v.da}</span>
              {v.ime}
            </Link>
          ))}
        </div>
        <p className="najdbe-opomba">Velikost kroga pomeni število poročil, temen del pa delež tistih, ki so gobe našli. Poročila so vezana na območje, ne na točno lokacijo.</p>
      </div>

      {zPorocili.length > 0 ? (
        <div className="seznam">
          <div className="seznam-vrstica glava najdbe-vrstica" role="row">
            <span>Območje</span><span className="desno">Našli</span><span className="desno">Niso našli</span><span className="desno">Uspešnost</span>
          </div>
          {zPorocili.map((v) => (
            <Link key={v.slug} href={`/regija/${v.slug}`} className="seznam-vrstica najdbe-vrstica">
              <span className="seznam-ime"><strong>{v.ime}</strong><small>{v.regija}</small></span>
              <span className="desno num">{v.da}</span>
              <span className="desno num">{v.ne}</span>
              <span className="desno num">{Math.round((v.da / v.skupaj) * 100)} %</span>
            </Link>
          ))}
        </div>
      ) : (
        !nalagam && <p className="uvod">Zadnje dni še ni poročil. Prvo lahko oddaš na <Link href="/">domači strani</Link> ali na strani svojega območja.</p>
      )}
    </>
  );
}
