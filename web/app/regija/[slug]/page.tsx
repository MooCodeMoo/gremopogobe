import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav, Noga } from "@/components/Nav";
import { getNapoved, TOCKE, kratekDan, datumKratko } from "@/lib/napoved";
import { VRSTE, OZNAKE, barva, besediloNa, stopnja } from "@/lib/vrste";
import { DEZ_ZAMIK } from "@/lib/indeks";
import model from "@/data/model.json";
import { JsonLd, drobtinice } from "@/lib/seo";
import { SKUPINE, gozdTocke } from "@/lib/gozd";

export const revalidate = 10800;
export const generateStaticParams = () => TOCKE.map((t) => ({ slug: t.slug }));

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const t = TOCKE.find((x) => x.slug === slug);
  return t ? { title: `Gobe ${t.ime} - napoved rasti | Gremo po gobe`, description: `Kdaj bodo rasle gobe na območju ${t.ime} (${t.regija})? 7-dnevna napoved za jurčke, lisičke, marele in štorovke, sestava gozda in vremenske razmere.`, alternates: { canonical: `/regija/${t.slug}` } } : {};
}

export default async function Regija({ params }: P) {
  const { slug } = await params;
  const osnova = TOCKE.find((t) => t.slug === slug);
  if (!osnova) notFound();
  const napoved = await getNapoved();
  const t = napoved?.tocke.find((x) => x.slug === slug);

  // Najboljša kombinacija vrsta + dan v tem tednu
  let naj = { vrsta: VRSTE[0], dan: 0, v: -1 };
  if (t) for (const vr of VRSTE) t.indeks[vr.id].forEach((v, i) => { if (v > naj.v) naj = { vrsta: vr, dan: i, v }; });
  const g = t?.gonila[0];
  const gz = gozdTocke(slug);
  const maxDez = t ? Math.max(1, ...t.padavine14) : 1;

  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Regije", "/regije"], [osnova.ime, `/regija/${osnova.slug}`]])} />
      <main>
        <section className="regija-glava">
          <nav aria-label="Drobtinice" className="drobtinice"><Link href="/">Napoved</Link><span>/</span><Link href="/regije">Regije</Link><span>/</span><span>{osnova.regija}</span></nav>
          <div className="regija-vrh">
            <div>
              <h1>{osnova.ime}</h1>
              <p>{osnova.regija}{t?.visina ? `, merilna točka na ${Math.round(t.visina)} m` : ""}</p>
            </div>
            {t && napoved && (
              <div className="poudarek" style={{ background: naj.v >= 60 ? "#6B2A15" : "#0F3320" }}>
                <span>Najboljše ta teden: {naj.vrsta.ime.toLowerCase()}, {kratekDan(napoved.dnevi[naj.dan]).toLowerCase()} {datumKratko(napoved.dnevi[naj.dan])}</span>
                <div><strong>{naj.v}</strong><em>{OZNAKE[stopnja(naj.v)]}</em></div>
              </div>
            )}
          </div>
        </section>

        {!t || !napoved ? (
          <section className="prazno"><p>Vremenski podatki trenutno niso dosegljivi. Poskusi znova čez nekaj minut.</p></section>
        ) : (
          <>
            <section className="odsek">
              <h2 className="naslov">Napoved za 7 dni</h2>
              <div className="tabela-napovedi" role="table" aria-label="Indeks rasti po vrstah in dnevih">
                <div role="row" className="vrstica">
                  <span role="columnheader" />
                  {napoved.dnevi.map((d) => <span role="columnheader" key={d} className="glava-dan">{kratekDan(d)}<b>{datumKratko(d)}</b></span>)}
                </div>
                {VRSTE.map((vr) => (
                  <div role="row" className="vrstica" key={vr.id}>
                    <span role="rowheader" className="ime-vrste">{vr.ime}</span>
                    {t.indeks[vr.id].map((v, i) => (
                      <span role="cell" key={i} className="celica" style={{ background: barva(v), color: besediloNa(v) }}>{v}</span>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section className="odsek">
              <h2 className="naslov">Zakaj takšna ocena</h2>
              <div className="gonila">
                <div className="gonilo">
                  <h3>Padavine, zadnjih {t.padavine14.length} dni</h3>
                  <strong>{Math.round(t.padavine14.reduce((s, x) => s + x, 0))} <small>mm</small></strong>
                  <div className="dez" aria-hidden="true">
                    {t.padavine14.map((p, i) => <i key={i} style={{ height: Math.max(3, (p / maxDez) * 80), opacity: t.padavine14.length - i >= DEZ_ZAMIK[0] && t.padavine14.length - i <= DEZ_ZAMIK[1] ? 1 : 0.45 }} />)}
                  </div>
                  <p>Temnejši stolpci so dež {DEZ_ZAMIK[0]}-{DEZ_ZAMIK[1]} dni nazaj, ki šteje največ: {Math.round(g!.dezMm)} mm.</p>
                </div>
                <div className="gonilo">
                  <h3>Temperatura tal</h3>
                  <strong>{g!.tempTal.toFixed(1).replace(".", ",")} <small>°C</small></strong>
                  <p>Povprečje zadnjih 5 dni na globini 6 cm. Jurček ima najraje {String(VRSTE[0].temp[1]).replace(".", ",")}-{String(VRSTE[0].temp[2]).replace(".", ",")} °C.</p>
                </div>
                {gz?.sestava && (
                  <div className="gonilo">
                    <h3>Gozd okoli merilne točke</h3>
                    <strong>{Math.round(gz.gozd * 100)} <small>% gozda</small></strong>
                    <div className="sestava" role="img" aria-label="Sestava gozda po drevesnih vrstah">
                      {gz.sestava.map((d, i) => d > 0.01 && <i key={i} style={{ flexGrow: d, background: SKUPINE[i].barva }} />)}
                    </div>
                    <ul className="sestava-legenda">
                      {gz.sestava.map((d, i) => d >= 0.05 && <li key={i}><span style={{ background: SKUPINE[i].barva }} />{SKUPINE[i].ime} {Math.round(d * 100)} %</li>)}
                    </ul>
                  </div>
                )}
                <div className="gonilo">
                  <h3>Vlaga tal</h3>
                  <strong>{g!.vlaga.toFixed(2).replace(".", ",")} <small>m³/m³</small></strong>
                  <p>Sloj 3-9 cm. Pri najdbah je bila vlaga običajno okoli {String(model.vlaga_opt).replace(".", ",")} ali več.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Noga />
    </>
  );
}
