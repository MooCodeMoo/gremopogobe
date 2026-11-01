"use client";
import Link from "next/link";
import { track } from "@/lib/sledi";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import geo from "@/data/slovenija.json";
import { VRSTE, OZNAKE, LESTVICA, barva, besediloNa, stopnja, type VrstaId } from "@/lib/vrste";
import type { Napoved } from "@/lib/napoved";
import { dolzinaOkna } from "@/lib/indeks";
import { faktorPike } from "@/lib/gozd";
import { faktorVisinePike } from "@/lib/visina";
import "./raziskovalec-igra.css";
import MojaObmocja from "./MojaObmocja";
import NajdbeHitro from "./NajdbeHitro";

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

const SREDINE = [10, 30, 50, 70, 90]; // sredine stopenj lestvice, med njimi barvo gladko mešamo (samo med predvajanjem)
const RGB = LESTVICA.map((c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
function gladkaBarva(v: number) {
  if (v <= SREDINE[0]) return LESTVICA[0];
  if (v >= SREDINE[4]) return LESTVICA[4];
  const k = Math.min(3, Math.floor((v - 10) / 20));
  const f = (v - SREDINE[k]) / 20;
  const [a, b] = [RGB[k], RGB[k + 1]];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
}
const polmer = (v: number) => ((3.4 + (v / 100) * 6.2) * 0.95) / R_MAX;
const mehko = (f: number) => f * f * (3 - 2 * f); // zadržimo se pri celem dnevu, med dnevi pa gladek prehod

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

  const pikeRef = useRef<(SVGCircleElement | null)[]>([]);
  const casRef = useRef<HTMLSpanElement | null>(null);
  const dIdxRef = useRef(dIdx);
  dIdxRef.current = dIdx;

  // Polja pik za vse dni naenkrat, da lahko med dnevi gladko prehajamo
  const poljaDni = useMemo(() => {
    const tk = napoved.tocke.map((t) => ({ ...projekcija(t.lon, t.lat), t }));
    return napoved.dnevi.map((_, d) =>
      idw(geo.dots, tk.map(({ x, y, t }) => ({ x, y, v: t.indeksVreme[vrsta][d] }))).map((v, i) => v * faktorPike(vrsta, i) * faktorVisinePike(vrsta, i))
    );
  }, [napoved, vrsta]);

  // Predvajanje tedna: gladka animacija med dnevi (pike se mehko spreminjajo), na koncu se ustavi
  useEffect(() => {
    if (!predvajam) return;
    if (manjGibanja()) {
      const t = setTimeout(() => (dIdxRef.current >= n - 1 ? setPredvajam(false) : setDIdx((d) => d + 1)), KORAK_PREDVAJANJA);
      return () => clearTimeout(t);
    }
    let t = dIdxRef.current, zadnji = performance.now(), raf = 0;
    const narisi = (cas: number) => {
      const i0 = Math.min(n - 1, Math.floor(cas)), i1 = Math.min(n - 1, i0 + 1), f = mehko(cas - i0);
      const A = poljaDni[i0], B = poljaDni[i1];
      for (let i = 0; i < A.length; i++) {
        const el = pikeRef.current[i]; if (!el) continue;
        const v = A[i] + (B[i] - A[i]) * f;
        el.style.fill = gladkaBarva(v); el.style.transform = `scale(${polmer(v)})`;
      }
      if (casRef.current) casRef.current.style.width = `${(cas / (n - 1)) * 100}%`;
    };
    const korak = (zdaj: number) => {
      t = Math.min(n - 1, t + (Math.min(100, zdaj - zadnji) / KORAK_PREDVAJANJA)); // dolg premor (npr. zavihek v ozadju) ne preskoči dni
      zadnji = zdaj;
      narisi(t);
      const r = Math.round(t);
      if (r !== dIdxRef.current) setDIdx(r);
      if (t >= n - 1) { setPredvajam(false); return; }
      raf = requestAnimationFrame(korak);
    };
    raf = requestAnimationFrame(korak);
    return () => {
      cancelAnimationFrame(raf);
      const r = Math.round(t);
      setDIdx(r);
      // ob koncu zapišemo točne vrednosti dneva (enake tistim, ki jih izračuna React), prehod jih gladko doseže
      poljaDni[r].forEach((v, i) => { const el = pikeRef.current[i]; if (el) { el.style.fill = barva(v); el.style.transform = `scale(${polmer(v)})`; } });
      if (casRef.current) casRef.current.style.width = `${(r / (n - 1)) * 100}%`;
    };
  }, [predvajam, n, poljaDni]);

  const tocke = useMemo(
    () => napoved.tocke.map((t) => ({ ...t, ...projekcija(t.lon, t.lat), v: t.indeks[vrsta][dIdx], vv: t.indeksVreme[vrsta][dIdx] })),
    [napoved, vrsta, dIdx]
  );
  // Vreme razmažemo med točkami, nato vsako piko utežimo s tipom gozda na njej
  const vrednostiPik = poljaDni[dIdx];
  const razvrsceno = [...tocke].sort((a, b) => b.v - a.v);
  const top3 = razvrsceno.slice(0, 3);
  const oznacene = [...razvrsceno.slice(0, 6), ...razvrsceno.filter((t) => t.slug === fokus && !razvrsceno.slice(0, 6).includes(t))];
  const imeVrste = VRSTE.find((v) => v.id === vrsta)!.ime;
  // Povzetek dejanskega stanja po vrstah za izbrani dan (najboljše območje za vsako vrsto)
  const stanjeVrst = VRSTE.map((v) => ({ ime: v.ime, m: Math.max(...napoved.tocke.map((t) => t.indeks[v.id][dIdx])) })).sort((a, b) => b.m - a.m);
  const najboljsi = stanjeVrst[0].m;
  const jeVikend = [0, 6].includes(new Date(napoved.dnevi[dIdx]).getDay());
  const obdobje = jeVikend ? "ta vikend" : "te dni";
  const naslov = najboljsi >= 60 ? `Kje bo ${obdobje} polna košara?` : najboljsi >= 40 ? `Kje bo ${obdobje} vsaj nekaj gob?` : "Gobe za zdaj počivajo.";
  const datumStanja = `Najboljše razmere, ${dan(napoved.dnevi[dIdx]).toLowerCase()}, ${new Date(napoved.dnevi[dIdx]).toLocaleDateString("sl-SI", { day: "numeric", month: "numeric" })}`;

  function izberiDan(i: number) { setPredvajam(false); setDIdx(i); track("dan", { d: i - privzetiDan }); }
  function predvajaj() {
    if (predvajam) { setPredvajam(false); return; }
    if (dIdx >= n - 1) setDIdx(0);
    setPredvajam(true); track("predvajaj");
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

  // Namig po dotiku sam izgine in izgine tudi ob drsenju strani
  useEffect(() => {
    if (!namig) return;
    const skrij = () => { setNamig(null); setFokus(null); };
    window.addEventListener("scroll", skrij, { passive: true });
    const t = tipKazalca.current === "touch" ? setTimeout(skrij, 3000) : undefined;
    return () => { window.removeEventListener("scroll", skrij); if (t) clearTimeout(t); };
  }, [namig]);
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
          <p className="svez"><span className={`pika${napoved.zastarelo ? " stara" : ""}`} aria-hidden="true" />{napoved.zastarelo ? "Zadnji razpoložljivi podatki, " : "Posodobljeno "}{new Date(napoved.posodobljeno).toLocaleString("sl-SI", { timeZone: "Europe/Ljubljana", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <h1><span className="nadnaslov">Gobarska napoved za Slovenijo</span>{naslov}</h1>
          <p className="stanje-vrst"><strong>{datumStanja}:</strong> {stanjeVrst.map((s, i) => <span key={s.ime}>{i ? ", " : " "}{s.ime.toLowerCase()} {OZNAKE[stopnja(s.m)].toLowerCase()}</span>)}.</p>
          <p className="uvod">Indeks ugodnosti razmer za {napoved.tocke.length} gozdnih območij iz padavin zadnjih {dolzinaOkna} dni, temperature in vlage tal ter sestave gozda. To je ocena vremenskih razmer, ne zagotovilo najdbe. <Link href="/metodologija">Kako izračunamo</Link></p>

          <fieldset className="skupina">
            <legend>Vrsta</legend>
            <div className="segment">
              {VRSTE.map((v) => (
                <button key={v.id} type="button" aria-pressed={v.id === vrsta} onClick={() => { setVrsta(v.id); track("vrsta", { v: v.id }); try { localStorage.setItem("gpg-vrsta", v.id); } catch {} }}>{v.ime}</button>
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
            <div className="casovnica" aria-hidden="true"><span ref={casRef} style={{ width: `${(dIdx / (n - 1)) * 100}%` }} /></div>
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
              <p>Indeks ugodnosti razmer, 0-100 (ni verjetnost najdbe)</p>
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
              <svg className={predvajam ? "igra" : undefined} viewBox={`0 0 ${geo.W} ${geo.H}`} role="img" aria-label={`Zemljevid indeksa ugodnosti razmer za vrsto ${imeVrste}`}
                onPointerMove={premik} onPointerLeave={zapustiKarto}
                onPointerDown={(e) => { tipKazalca.current = e.pointerType; premik(e); }}
                onClick={klik} style={{ cursor: namig ? "pointer" : "default" }}>
                <path d={geo.path} className="obris" />
                {geo.dots.map(([x, y], i) => {
                  const v = vrednostiPik[i];
                  const s = polmer(v);
                  return (
                    <circle key={i} ref={(el) => { pikeRef.current[i] = el; }} className="kpika" cx={x} cy={y} r={R_MAX}
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
                <div className="namig" style={{
                  left: `${Math.min(80, Math.max(20, (geo.dots[namig.i][0] / geo.W) * 100))}%`,
                  top: `${(geo.dots[namig.i][1] / geo.H) * 100}%`,
                }} role="status">
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
            <p>Utripajo tri najboljša območja. Klik ali dotik na zemljevidu odpre najbližje območje.</p>
          </div>
        </div>
      </section>

      <section className="odsek odsek-hitra"><NajdbeHitro tocke={napoved.tocke} vrstaPrivzeta={vrsta} /></section>

      <MojaObmocja tocke={napoved.tocke} vrsta={vrsta} dIdx={dIdx} />

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
