import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav, Noga } from "@/components/Nav";
import { OPISI, opis } from "@/lib/vrste-opisi";
import { VRSTE, OZNAKE, barva, besediloNa, stopnja } from "@/lib/vrste";
import { getNapoved, kratekDan, datumKratko } from "@/lib/napoved";
import { JsonLd, drobtinice, metadataStrani } from "@/lib/seo";

export const revalidate = 10800;
export const generateStaticParams = () => OPISI.map((o) => ({ id: o.id }));
type P = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const o = opis((await params).id);
  if (!o) return {};
  return metadataStrani(
    `/vrste/${o.id}`,
    `${o.mnozina} – kdaj in kje rastejo | Gremo po gobe`,
    o.kratko,
  );
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
          <nav className="vrsta-povezave" aria-label="Vsebina strani">
            <a href="#napoved">Napoved za {o.mnozina.toLowerCase()}</a>
            <a href="#rastisce">Kje rastejo</a>
            <a href="#sezona">Kdaj rastejo</a>
            <a href="#zamenjave">Dvojnice in zamenjave</a>
          </nav>
        </section>

        <section className="odsek vrsta-napoved" id="napoved" aria-labelledby="naslov-napovedi">
          <h2 className="naslov" id="naslov-napovedi">Kje rastejo {o.mnozina.toLowerCase()} ta teden?</h2>
          {napoved && top.length > 0 ? (
            <>
              <p className="opomba">
                {napoved.zastarelo ? "Zadnji razpoložljivi podatki" : "Posodobljeno"}{" "}
                <time dateTime={napoved.posodobljeno}>{new Date(napoved.posodobljeno).toLocaleString("sl-SI", { timeZone: "Europe/Ljubljana", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}</time>.
                {" "}Najvišji indeks v naslednjih 7 dneh: <strong>{top[0].m}/100 – {OZNAKE[stopnja(top[0].m)].toLowerCase()}</strong>.
                {" "}To je ocena ugodnosti razmer, ne potrditev najdb.
              </p>
              <div className="vrsta-napoved-mreza">
                {top.map(({ t, m, dan }) => (
                  <Link key={t.slug} href={`/regija/${t.slug}`} className="top-vrstica">
                    <span className="top-ime">{t.ime}</span>
                    <span className="top-oznaka">{kratekDan(napoved.dnevi[dan])} {datumKratko(napoved.dnevi[dan])}</span>
                    <span className="znacka" style={{ background: barva(m), color: besediloNa(m) }}>{m}</span>
                  </Link>
                ))}
              </div>
            </>
          ) : <p>Napoved trenutno ni dosegljiva. Spodaj preberi, kdaj in v kakšnih rastiščih običajno rastejo {o.mnozina.toLowerCase()}.</p>}
          <p className="opomba"><Link href="/regije">Primerjaj vsa območja</Link>{" · "}<Link href="/najdbe">Preveri poročila gobarjev</Link>{" · "}<Link href="/metodologija">Kako izračunamo indeks</Link></p>
        </section>

        <section className="odsek vrsta-mreza">
          <div className="vrsta-besedilo">
            <h2 id="rastisce">Kje rastejo {o.mnozina.toLowerCase()}?</h2>
            <p>{o.kjeRaste}</p>
            <h2 id="sezona">Kdaj rastejo {o.mnozina.toLowerCase()}?</h2>
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

            <h2 id="zamenjave">Dvojnice in zamenjave</h2>
            <div className="dvojnice">
              {o.dvojnice.map((d) => (
                <div key={d.latinsko} className={`dvojnica ${d.nevarnost === "neužitna" ? "" : "nevarna"}`}>
                  <span className="oznaka-nevarnosti">{d.nevarnost}</span>
                  <strong>{d.ime}</strong> <em>{d.latinsko}</em>
                  <p>{d.opis}</p>
                </div>
              ))}
            </div>
            <p className="opozorilo">Ta stran ni določevalni ključ. Gobe, ki je ne poznaš zanesljivo, ne jej - pokaži jo determinatorju v <Link href="/drustva">gobarskem društvu</Link>.</p>

            <h2>Nasvet</h2>
            <p>{o.nasvet}</p>
          </div>

          <aside className="vrsta-stran">
            <div className="gonilo">
              <h2 className="naslov">Druge vrste gob</h2>
              {OPISI.filter((x) => x.id !== o.id).map((x) => <Link key={x.id} href={`/vrste/${x.id}`} className="povezava">{x.ime}</Link>)}
            </div>
          </aside>
        </section>
      </main>
      <Noga />
    </>
  );
}
