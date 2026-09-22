"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import geo from "@/data/slovenija.json";
import { VRSTE, OZNAKE, LESTVICA, barva, besediloNa, stopnja, type VrstaId } from "@/lib/vrste";
import type { Napoved } from "@/lib/napoved";
import { DEZ_ZAMIK } from "@/lib/indeks";
import { faktorPike } from "@/lib/gozd";

const DN = ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];
const dan = (iso: string) => DN[new Date(iso).getDay()];
const dat = (iso: string) => `${new Date(iso).getDate()}.`;
const R_MAX = 10; // polmer pike pri merilu 1; velikost se spreminja s transform: scale (gladek prehod)
const KORAK_PREDVAJANJA = 1100; // ms na dan

function projekcija(lon: number, lat: number) {
  return { x: (lon - geo.proj.lon0) * geo.proj.kx, y: (geo.proj.lat1 - lat) * geo.proj.ky };
}

/** Inverzno tehtanje z razdaljo: indeks iz ~30 točk razmaže na mrežo pik. */
function idw(pike: number[][], tocke: { x: number; y: number; v: number }[]) {
  return pike.map(([x, y]) => {
    let s = 0, w = 0;
    for (const t of tocke) {
      const d2 = (x - t.x) ** 2 + (y - t.y) ** 2 + 1;
      const k = 1 / (d2 * d2);
      s += k * t.v; w += k;
    }
    return s / w;
  });
}

const manjGibanja = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Število, ki ob spremembi "odšteje" do nove vrednosti. */
function Stevilka({ v }: { v: number }) {
  const [prikaz, setPrikaz] = useState(v);
  const prej = useRef(v);
  useEffect(() => {
    const od = prej.current;
    prej.current = v;
    if (od === v || manjGibanja()) { setPrikaz(v); return; }
    let raf = 0;
    const t0 = performance.now();
    const korak = (t: number) => {
      const f = Math.min(1, (t - t0) / 450);
      setPrikaz(Math.round(od + (v - od) * (1 - (1 - f) ** 3)));
      if (f < 1) raf = requestAnimationFrame(korak);
    };
    raf = requestAnimationFrame(korak);
    return () => cancelAnimationFrame(raf);
  }, [v]);
  return <>{prikaz}</>;
}

export default function Raziskovalec({ napoved }: { napoved: Napoved }) {
  const router = useRouter();
  const [vrsta, setVrsta] = useState<VrstaId>("jurcek");
  const privzetiDan = Math.max(0, napoved.dnevi.findIndex((d) => new Date(d).getDay() === 6));
  const [dIdx, setDIdx] = useState(privzetiDan);
  const [predvajam, setPredvajam] = useState(false);
  const [fokus, setFokus] = useState<string | null>(null);
  const [namig, setNamig] = useState<{ i: number; slug: string; ime: string; v: number } | null>(null);
  const n = napoved.dnevi.length;

  // Predvajanje tedna: vsak dan ~1 s, na koncu se ustavi
  useEffect(() => {
    if (!predvajam) return;
    const t = setTimeout(() => (dIdx >= n - 1 ? setPredvajam(false) : setDIdx((d) => d + 1)), KORAK_PREDVAJANJA);
    return () => clearTimeout(t);
  }, [predvajam, dIdx, n]);

  const tocke = useMemo(
    () => napoved.tocke.map((t) => ({ ...t, ...projekcija(t.lon, t.lat), v: t.indeks[vrsta][dIdx], vv: t.indeksVreme[vrsta][dIdx] })),
    [napoved, vrsta, dIdx]
  );
  // Vreme razmažemo med točkami, nato vsako piko utežimo s tipom gozda na njej
  const vrednostiPik = useMemo(
    () => idw(geo.dots, tocke.map((t) => ({ x: t.x, y: t.y, v: t.vv }))).map((v, i) => v * faktorPike(vrsta, i)),
    [tocke, vrsta]
  );
  const razvrsceno = [...tocke].sort((a, b) => b.v - a.v);
  const top3 = razvrsceno.slice(0, 3);
  const oznacene = [...razvrsceno.slice(0, 6), ...razvrsceno.filter((t) => t.slug === fokus && !razvrsceno.slice(0, 6).includes(t))];
  const imeVrste = VRSTE.find((v) => v.id === vrsta)!.ime;

  function izberiDan(i: number) { setPredvajam(false); setDIdx(i); }
  function predvajaj() {
    if (predvajam) { setPredvajam(false); return; }
    if (dIdx >= n - 1) setDIdx(0);
    setPredvajam(true);
  }

  // Namig nad najbližjo piko + najbližje območje
  function premik(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * geo.W;
    const y = ((e.clientY - r.top) / r.height) * geo.H;
    let best = -1, bd = Infinity;
    geo.dots.forEach(([dx, dy], i) => { const d = (dx - x) ** 2 + (dy - y) ** 2; if (d < bd) { bd = d; best = i; } });
    if (best < 0 || bd > 30 ** 2) { setNamig(null); setFokus(null); return; }
    const [px, py] = geo.dots[best];
    const t = tocke.reduce((a, b) => ((b.x - px) ** 2 + (b.y - py) ** 2 < (a.x - px) ** 2 + (a.y - py) ** 2 ? b : a));
    setNamig({ i: best, slug: t.slug, ime: t.ime, v: Math.round(vrednostiPik[best]) });
    setFokus(t.slug);
  }
  const zapustiKarto = (e: PointerEvent<SVGSVGElement>) => { if (e.pointerType !== "touch") { setNamig(null); setFokus(null); } };
  // Miška: klik odpre območje. Dotik: prvi dotik pokaže namig, drugi na isto območje ga odpre.
  const zadnjiDotik = useRef<string | null>(null);
  function klik() {
    if (!namig) return;
    if (tipKazalca.current === "touch" && zadnjiDotik.current !== namig.slug) { zadnjiDotik.current = namig.slug; return; }
    router.push(`/regija/${namig.slug}`);
  }
  const tipKazalca = useRef("mouse");

  const hover = (slug: string) => ({
    onMouseEnter: () => setFokus(slug), onMouseLeave: () => setFokus(null),
    onFocus: () => setFokus(slug), onBlur: () => setFokus(null),
  });
  const pct = (x: number, y: number) => ({ left: `${(x / geo.W) * 100}%`, top: `${(y / geo.H) * 100}%` });

  return (
    <>
      <section className="hero">
        <div className="hero-levo">
          <p className="svez"><span className="pika" aria-hidden="true" />Posodobljeno {new Date(napoved.posodobljeno).toLocaleString("sl-SI", { timeZone: "Europe/Ljubljana", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <h1><span className="nadnaslov">Gobarska napoved za Slovenijo</span>Kje bo ta vikend polna košara?</h1>
          <p className="uvod">Indeks rasti za {napoved.tocke.length} gozdnih območij iz padavin zadnjih {DEZ_ZAMIK[1]} dni, temperature in vlage tal ter sestave gozda.</p>

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
            <div className={`dnevi${predvajam ? " predvaja" : ""}`}>
              {napoved.dnevi.map((d, i) => (
                <button key={d} type="button" aria-pressed={i === dIdx} onClick={() => izberiDan(i)}>
                  <span>{dan(d)}</span><strong>{dat(d)}</strong>
                </button>
              ))}
            </div>
          </fieldset>

        </div>

        <div className="top">
          <h2>Najboljše za izbrani dan</h2>
          {top3.map((t) => (
            <Link key={t.slug} href={`/regija/${t.slug}`} className={`top-vrstica${fokus === t.slug ? " aktivna" : ""}`} {...hover(t.slug)}>
              <span className="top-ime">{t.ime}</span>
              <span className="top-oznaka">{OZNAKE[stopnja(t.v)]}</span>
              <span className="znacka" style={{ background: barva(t.v), color: besediloNa(t.v) }}><Stevilka v={t.v} /></span>
            </Link>
          ))}
        </div>

        <div className="karta">
          <div className="karta-glava">
            <div>
              <h2>{imeVrste}, {dan(napoved.dnevi[dIdx]).toLowerCase()} {new Date(napoved.dnevi[dIdx]).toLocaleDateString("sl-SI")}</h2>
              <p>Verjetnost rasti, 0-100</p>
            </div>
            <button type="button" className="predvajaj" onClick={predvajaj} aria-pressed={predvajam}>
              {predvajam ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>
              )}
              {predvajam ? "Ustavi" : "Predvajaj teden"}
            </button>
          </div>

          <div className="karta-platno">
            <div className="karta-okvir">
              <svg viewBox={`0 0 ${geo.W} ${geo.H}`} role="img" aria-label={`Zemljevid indeksa rasti za vrsto ${imeVrste}`}
                onPointerMove={premik} onPointerLeave={zapustiKarto}
                onPointerDown={(e) => { tipKazalca.current = e.pointerType; premik(e); }}
                onClick={klik} style={{ cursor: namig ? "pointer" : "default" }}>
                <path d={geo.path} className="obris" />
                {geo.dots.map(([x, y], i) => {
                  const v = vrednostiPik[i];
                  const s = ((3.4 + (v / 100) * 6.2) * 0.95) / R_MAX;
                  return (
                    <circle key={i} className="kpika" cx={x} cy={y} r={R_MAX}
                      style={{ fill: barva(v), transform: `scale(${s})`, animationDelay: `${(x / geo.W) * 0.9 + ((i * 37) % 10) * 0.012}s` }} />
                  );
                })}
                {namig && <circle cx={geo.dots[namig.i][0]} cy={geo.dots[namig.i][1]} r={13} className="kpika-obroc" />}
              </svg>

              {top3.map((t) => <span key={`p-${t.slug}`} className="ping" style={pct(t.x, t.y)} aria-hidden="true" />)}

              {oznacene.map((t) => (
                <Link key={t.slug} href={`/regija/${t.slug}`} className={`oznaka${fokus === t.slug ? " aktivna" : ""}`} style={pct(t.x, t.y)} {...hover(t.slug)}>
                  <span className="znacka mala" style={{ background: barva(t.v), color: besediloNa(t.v) }}>{t.v}</span>
                  {t.ime}
                </Link>
              ))}

              {namig && (
                <div className="namig" style={pct(geo.dots[namig.i][0], geo.dots[namig.i][1])} role="status">
                  <strong>{namig.v}</strong> {OZNAKE[stopnja(namig.v)].toLowerCase()}
                  <span>Najbližje: {namig.ime}</span>
                </div>
              )}
            </div>
          </div>

          <div className="karta-noga">
            <ul className="legenda" aria-label="Legenda">
              {LESTVICA.map((c, i) => (
                <li key={c}><span style={{ background: c }} />{OZNAKE[i]}</li>
              ))}
            </ul>
            <p>Utripajo tri najboljša območja. Klik na zemljevid odpre najbližje območje.</p>
          </div>
        </div>
      </section>

      <section className="odsek" id="regije">
        <div className="odsek-glava">
          <h2 className="naslov">Najboljše ta teden</h2>
          <Link href="/regije">Vse regije ({napoved.tocke.length})</Link>
        </div>
        <div className="mreza-regij">
          {[...tocke].sort((a, b) => Math.max(...b.indeks[vrsta]) - Math.max(...a.indeks[vrsta])).slice(0, 4).map((t) => {
            const vals = t.indeks[vrsta];
            const vrh = vals.indexOf(Math.max(...vals));
            return (
              <Link key={t.slug} href={`/regija/${t.slug}`} className={`kartica${fokus === t.slug ? " aktivna" : ""}`} {...hover(t.slug)}>
                <div className="kartica-glava">
                  <div><strong>{t.ime}</strong><span>Vrh: {dan(napoved.dnevi[vrh])} {dat(napoved.dnevi[vrh])}</span></div>
                  <span className="velika-st" style={{ color: stopnja(vals[vrh]) >= 3 ? "#8A3A1C" : undefined }}><Stevilka v={vals[vrh]} /></span>
                </div>
                <div className="stolpci" aria-hidden="true">
                  {vals.map((v, i) => (
                    <div key={i} className={i === dIdx ? "zdaj" : ""}><i style={{ height: Math.max(6, v * 0.4), background: barva(v) }} /><span>{dan(napoved.dnevi[i])[0]}</span></div>
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
