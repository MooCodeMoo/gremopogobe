import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav, Noga } from "@/components/Nav";
import { OPISI, opis } from "@/lib/vrste-opisi";
import { VRSTE, OZNAKE, barva, besediloNa, stopnja } from "@/lib/vrste";
import { getNapoved, kratekDan, datumKratko } from "@/lib/napoved";
import { JsonLd, drobtinice, URL_STRANI } from "@/lib/seo";

export const revalidate = 10800;
export const generateStaticParams = () => OPISI.map((o) => ({ id: o.id }));
type P = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const o = opis((await params).id);
  if (!o) return {};
  return {
    title: `${o.ime} (${o.latinsko}) - kdaj in kje raste | Gremo po gobe`,
    description: o.kratko,
    alternates: { canonical: `/vrste/${o.id}` },
    openGraph: { title: `${o.ime} - kdaj in kje raste`, description: o.kratko, url: `${URL_STRANI}/vrste/${o.id}` },
  };
}

const MESECI = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];

export default async function VrstaStran({ params }: P) {
  const { id } = await params;
  const o = opis(id);
  if (!o) notFound();
  const vrsta = VRSTE.find((v) => v.id === o.id)!;
  const napoved = await getNapoved();
  const top = napoved
    ? [...napoved.tocke].map((t) => {
        const vals = t.indeks[o.id];
        const m = Math.max(...vals);
        return { t, m, dan: vals.indexOf(m) };
      }).sort((a, b) => b.m - a.m).slice(0, 5)
    : [];
  const f = (x: number) => String(x).replace(".", ",");

  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Vrste gob", "/vrste"], [o.ime, `/vrste/${o.id}`]])} />
      <main>
        <section className="vrsta-vrh">
          <nav aria-label="Drobtinice" className="drobtinice"><Link href="/">Napoved</Link><span>/</span><Link href="/vrste">Vrste gob</Link></nav>
          <h1>{o.ime} <em>{o.latinsko}</em></h1>
          {o.drugaImena.length > 0 && <p className="druga-imena">Znan tudi kot: {o.drugaImena.join(", ")}</p>}
          <p className="uvod siroko">{o.uvod}</p>
        </section>

        <section className="odsek vrsta-mreza">
          <div className="vrsta-besedilo">
            <h2>Kje raste</h2>
            <p>{o.kjeRaste}</p>
            <h2>Kdaj raste</h2>
            <p>{o.kdaj}</p>
            <div className="sezona" aria-label="Sezona po mesecih">
              {MESECI.map((m, i) => {
                const s = vrsta.sezona[i + 1] ?? 0;
                return <div key={m}><i style={{ opacity: s ? 0.25 + 0.75 * s : 1, background: s ? "#B85E2A" : "#ECE6D9" }} /><span>{m}</span></div>;
              })}
            </div>
            <p className="opomba">Iz najdb in vremena smo izračunali, da {o.ime.toLowerCase()} najbolje raste pri temperaturi tal {f(vrsta.temp[1])}-{f(vrsta.temp[2])} °C.</p>

            <h2>Prepoznava</h2>
            <ul className="seznam-tock">{o.prepoznava.map((p) => <li key={p}>{p}</li>)}</ul>

            <h2>Dvojnice in zamenjave</h2>
            <div className="dvojnice">
              {o.dvojnice.map((d) => (
                <div key={d.latinsko} className={`dvojnica ${d.nevarnost === "neužitna" ? "" : "nevarna"}`}>
                  <span className="oznaka-nevarnosti">{d.nevarnost}</span>
                  <strong>{d.ime}</strong> <em>{d.latinsko}</em>
                  <p>{d.opis}</p>
                </div>
              ))}
            </div>
            <p className="opozorilo">Ta stran ni določevalni ključ. Gobe, ki je ne poznaš zanesljivo, ne jej - pokaži jo determinatorju v gobarskem društvu.</p>

            <h2>Nasvet</h2>
            <p>{o.nasvet}</p>
          </div>

          <aside className="vrsta-stran">
            <div className="gonilo">
              <h3>Kje ta teden</h3>
              {top.length ? top.map(({ t, m, dan }) => (
                <Link key={t.slug} href={`/regija/${t.slug}`} className="top-vrstica">
                  <span className="top-ime">{t.ime}</span>
                  <span className="top-oznaka">{kratekDan(napoved!.dnevi[dan])} {datumKratko(napoved!.dnevi[dan])}</span>
                  <span className="znacka" style={{ background: barva(m), color: besediloNa(m) }}>{m}</span>
                </Link>
              )) : <p>Napoved se osvežuje.</p>}
              {top.length > 0 && <p className="opomba">Najvišji indeks v naslednjih 7 dneh, {OZNAKE[stopnja(top[0].m)].toLowerCase()} na vrhu.</p>}
              <Link href="/regije" className="povezava">Vse regije</Link>
            </div>
            <div className="gonilo">
              <h3>Druge vrste</h3>
              {OPISI.filter((x) => x.id !== o.id).map((x) => <Link key={x.id} href={`/vrste/${x.id}`} className="povezava">{x.ime}</Link>)}
            </div>
          </aside>
        </section>
      </main>
      <Noga />
    </>
  );
}
