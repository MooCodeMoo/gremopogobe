import Link from "next/link";
import Raziskovalec from "@/components/Raziskovalec";
import { Nav, Noga } from "@/components/Nav";
import type { Metadata } from "next";
import { getNapoved } from "@/lib/napoved";
import { JsonLd, URL_STRANI } from "@/lib/seo";
import Prijava from "@/components/Prijava";
import { DEZ_ZAMIK } from "@/lib/indeks";

export const revalidate = 10800; // ISR: stran se osveži vsake 3 ure

export const metadata: Metadata = {
  title: "Gobarska napoved - kje rastejo gobe ta teden | Gremo po gobe",
  description: "Kje rastejo gobe ta vikend? Tedenska napoved rasti jurčkov, lisičk, marel in štorovk za 30 gozdnih območij po Sloveniji, posodobljena večkrat na dan.",
  alternates: { canonical: "/" },
};

const PRAVILA = [
  ["2 kg", "Na osebo na dan", "Za lastne potrebe. Nekaterih vrst ne smeš nabirati sploh."],
  ["Nož", "In zračna košara", "Plastične vrečke za prenašanje gob niso dovoljene."],
  ["3000", "Vrst gob v Sloveniji", "Okoli 200 je strupenih. Nabiraj samo tisto, kar zanesljivo poznaš."],
  ["2.500 €", "Najvišja globa za posameznika", "Za pravne osebe in s.p. do 4.000 €."],
];

export default async function Domov() {
  const napoved = await getNapoved();
  return (
    <>
      <Nav />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "Gremo po gobe", alternateName: "gremopogobe.si", url: URL_STRANI, inLanguage: "sl-SI", description: "Gobarska napoved rasti gob za Slovenijo." }} />
      <main>
        {napoved ? (
          <Raziskovalec napoved={napoved} />
        ) : (
          <section className="prazno">
            <h1>Napoved se ravno osvežuje</h1>
            <p>Vremenski podatki trenutno niso dosegljivi. Stran se samodejno posodobi v nekaj minutah, lahko pa medtem prebereš <Link href="/vodic">vodič</Link>.</p>
          </section>
        )}

        <section className="indeks-razlaga">
          <h2>Gobe ne rastejo po koledarju, ampak po vremenu.</h2>
          <div>
            <article><h3>Dež z zamikom</h3><p>Šteje dež {DEZ_ZAMIK[0]}-{DEZ_ZAMIK[1]} dni nazaj. Po izdatnem dežju se micelij najprej razraste, klobuki pa se pokažejo z zamikom.</p></article>
            <article><h3>Temperatura tal</h3><p>Vsaka vrsta ima svoje okno. Jurček ima rad hladnejša tla, marela prenese toplejše travnike.</p></article>
            <article><h3>Vlaga tal</h3><p>Brez vlage tudi dober dež izhlapi. Vroči, suhi dnevi indeks hitro spustijo.</p></article>
          </div>
        </section>

        <section className="odsek">
          <div className="odsek-glava">
            <h2 className="naslov">Preden greš v gozd</h2>
            <Link href="/vodic">Celoten vodič</Link>
          </div>
          <div className="pravila-mreza">
            {PRAVILA.map(([a, b, c]) => (
              <div key={a} className="pravilo"><strong>{a}</strong><span>{b}</span><p>{c}</p></div>
            ))}
          </div>
        </section>
        <section className="odsek">
          <Prijava />
        </section>
      </main>
      <Noga />
    </>
  );
}
