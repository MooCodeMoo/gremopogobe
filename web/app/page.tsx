import Link from "next/link";
import Raziskovalec from "@/components/Raziskovalec";
import { Nav, Noga } from "@/components/Nav";
import { getNapoved } from "@/lib/napoved";

export const revalidate = 10800; // ISR: stran se osveži vsake 3 ure

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
            <article><h3>Dež z zamikom</h3><p>Šteje dež 5-14 dni nazaj. Micelij potrebuje približno teden dni, da se po močnejšem dežju pokažejo klobuki.</p></article>
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
      </main>
      <Noga />
    </>
  );
}
