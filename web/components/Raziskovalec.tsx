"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import geo from "@/data/slovenija.json";
import { VRSTE, OZNAKE, LESTVICA, barva, besediloNa, stopnja, type VrstaId } from "@/lib/vrste";
import type { Napoved } from "@/lib/napoved";
import { DEZ_ZAMIK } from "@/lib/indeks";

const DN = ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];
const dan = (iso: string) => DN[new Date(iso).getDay()];
const dat = (iso: string) => `${new Date(iso).getDate()}.`;

function projekcija(lon: number, lat: number) {
  return { x: (lon - geo.proj.lon0) * geo.proj.kx, y: (geo.proj.lat1 - lat) * geo.proj.ky };
}

/** Inverzno tehtanje z razdaljo: indeks iz ~30 točk razmaže na mrežo pik. */
function idw(pike: number[][], tocke: { x: number; y: number; v: number }[]) {
  return pike.map(([x, y]) => {
    let s = 0, w = 0;
    for (const t of tocke) {
      const d2 = (x - t.x) ** 2 + (y - t.y) ** 2 + 1;
      const k = 1 / (d2 * d2); // moč 4 = bolj lokalno
      s += k * t.v; w += k;
    }
    return s / w;
  });
}

export default function Raziskovalec({ napoved }: { napoved: Napoved }) {
  const [vrsta, setVrsta] = useState<VrstaId>("jurcek");
  const privzetiDan = Math.max(0, napoved.dnevi.findIndex((d) => new Date(d).getDay() === 6));
  const [dIdx, setDIdx] = useState(privzetiDan);

  const tocke = useMemo(
    () => napoved.tocke.map((t) => ({ ...t, ...projekcija(t.lon, t.lat), v: t.indeks[vrsta][dIdx] })),
    [napoved, vrsta, dIdx]
  );
  const vrednostiPik = useMemo(() => idw(geo.dots, tocke), [tocke]);
  const razvrsceno = [...tocke].sort((a, b) => b.v - a.v);
  const oznacene = razvrsceno.slice(0, 6);
  const imeVrste = VRSTE.find((v) => v.id === vrsta)!.ime;

  return (
    <>
      <section className="hero">
        <div className="hero-levo">
          <p className="svez"><span className="pika" aria-hidden="true" />Posodobljeno {new Date(napoved.posodobljeno).toLocaleString("sl-SI", { timeZone: "Europe/Ljubljana", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <h1>Kje bo ta vikend polna košara?</h1>
          <p className="uvod">Indeks rasti za {napoved.tocke.length} gozdnih območij, izračunan iz padavin zadnjih {DEZ_ZAMIK[1]} dni ter temperature in vlage tal.</p>

          <fieldset className="skupina">
            <legend>Vrsta</legend>
            <div className="segment">
              {VRSTE.map((v) => (
                <button key={v.id} type="button" aria-pressed={v.id === vrsta} onClick={() => setVrsta(v.id)}>{v.ime}</button>
              ))}
            </div>
          </fieldset>

          <fieldset className="skupina">
            <legend>Dan</legend>
            <div className="dnevi">
              {napoved.dnevi.map((d, i) => (
                <button key={d} type="button" aria-pressed={i === dIdx} onClick={() => setDIdx(i)}>
                  <span>{dan(d)}</span><strong>{dat(d)}</strong>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="top">
            <h2>Najboljše za izbrani dan</h2>
            {razvrsceno.slice(0, 3).map((t) => (
              <Link key={t.slug} href={`/regija/${t.slug}`} className="top-vrstica">
                <span className="top-ime">{t.ime}</span>
                <span className="top-oznaka">{OZNAKE[stopnja(t.v)]}</span>
                <span className="znacka" style={{ background: barva(t.v), color: besediloNa(t.v) }}>{t.v}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="karta">
          <div className="karta-glava">
            <div>
              <h2>{imeVrste}, {dan(napoved.dnevi[dIdx]).toLowerCase()} {new Date(napoved.dnevi[dIdx]).toLocaleDateString("sl-SI")}</h2>
              <p>Verjetnost rasti, 0-100</p>
            </div>
          </div>
          <div className="karta-platno">
            <svg viewBox={`0 0 ${geo.W} ${geo.H}`} role="img" aria-label={`Zemljevid indeksa rasti za vrsto ${imeVrste}`}>
              <path d={geo.path} className="obris" />
              {geo.dots.map(([x, y], i) => {
                const v = vrednostiPik[i];
                return <circle key={i} cx={x} cy={y} r={(3.4 + (v / 100) * 6.2) * 0.95} fill={barva(v)} />;
              })}
            </svg>
            {oznacene.map((t) => (
              <Link key={t.slug} href={`/regija/${t.slug}`} className="oznaka" style={{ left: `${(t.x / geo.W) * 100}%`, top: `${(t.y / geo.H) * 100}%` }}>
                <span className="znacka mala" style={{ background: barva(t.v), color: besediloNa(t.v) }}>{t.v}</span>
                {t.ime}
              </Link>
            ))}
          </div>
          <div className="karta-noga">
            <ul className="legenda" aria-label="Legenda">
              {LESTVICA.map((c, i) => (
                <li key={c}><span style={{ background: c }} />{OZNAKE[i]}</li>
              ))}
            </ul>
            <p>Vrednosti med merilnimi točkami so interpolirane.</p>
          </div>
        </div>
      </section>

      <section className="odsek" id="regije">
        <h2 className="naslov">Regije ta teden</h2>
        <div className="mreza-regij">
          {razvrsceno.map((t) => {
            const vals = t.indeks[vrsta];
            const vrh = vals.indexOf(Math.max(...vals));
            return (
              <Link key={t.slug} href={`/regija/${t.slug}`} className="kartica">
                <div className="kartica-glava">
                  <div><strong>{t.ime}</strong><span>Vrh: {dan(napoved.dnevi[vrh])} {dat(napoved.dnevi[vrh])}</span></div>
                  <span className="velika-st" style={{ color: stopnja(t.v) >= 3 ? "#8A3A1C" : undefined }}>{t.v}</span>
                </div>
                <div className="stolpci" aria-hidden="true">
                  {vals.map((v, i) => (
                    <div key={i}><i style={{ height: Math.max(6, v * 0.4), background: barva(v) }} /><span>{dan(napoved.dnevi[i])[0]}</span></div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
