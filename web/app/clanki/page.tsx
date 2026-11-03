import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import { CLANKI } from "@/lib/clanki";
import { JsonLd, drobtinice } from "@/lib/seo";
import "./clanek.css";

export const metadata: Metadata = {
  title: "Članki o gobah | Gremo po gobe",
  description: "Preverjeni članki o rasti gob, vremenu in nabiranju v Sloveniji. Z viri in navedbo, kako zanesljive so trditve.",
  alternates: { canonical: "/clanki" },
};

const datum = (d: string) => new Date(d).toLocaleDateString("sl-SI");

export default function Clanki() {
  const urejeni = [...CLANKI].sort((a, b) => b.datum.localeCompare(a.datum));
  const [glavni, ...ostali] = urejeni;
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Članki", "/clanki"]])} />
      <main>
        <section className="cls">
          <header className="cls-vrh">
            <h1>Članki</h1>
            <p>Kako gobe rastejo, kaj o tem pravi znanost in kako to uporabiti v gozdu. Vsak članek ima navedene vire.</p>
          </header>
          {glavni && (
            <Link href={`/clanki/${glavni.slug}`} className="cls-glavni">
              <img src={glavni.slika} alt={glavni.slikaAlt} width={1200} height={800} fetchPriority="high" />
              <div>
                <span className="cls-znacka">Najnovejše</span>
                <h2>{glavni.naslov}</h2>
                <p>{glavni.opis}</p>
                <small>{datum(glavni.datum)} · {glavni.branje} branja</small>
              </div>
            </Link>
          )}
          {ostali.length > 0 && (
            <>
              <h2 className="cls-naslov">Starejši članki</h2>
              <ul className="cls-mreza">
                {ostali.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/clanki/${c.slug}`}>
                      <img src={c.slika} alt={c.slikaAlt} width={600} height={400} loading="lazy" />
                      <div>
                        <h3>{c.naslov}</h3>
                        <p>{c.opis}</p>
                        <small>{datum(c.datum)} · {c.branje} branja</small>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
      <Noga />
    </>
  );
}
