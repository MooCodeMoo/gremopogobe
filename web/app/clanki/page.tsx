import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import { CLANKI } from "@/lib/clanki";
import { JsonLd, drobtinice } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Članki o gobah | Gremo po gobe",
  description: "Preverjeni članki o rasti gob, vremenu in nabiranju v Sloveniji. Z viri in navedbo, kako zanesljive so trditve.",
  alternates: { canonical: "/clanki" },
};

export default function Clanki() {
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Članki", "/clanki"]])} />
      <main>
        <section className="regije-vrh">
          <h1>Članki</h1>
          <p className="uvod siroko">Kako gobe rastejo, kaj o tem pravi znanost in kako to uporabiti v gozdu. Vsak članek ima navedene vire.</p>
        </section>
        <section className="odsek">
          <ul className="cl-seznam">
            {CLANKI.map((c) => (
              <li key={c.slug}>
                <Link href={`/clanki/${c.slug}`}>
                  <strong>{c.naslov}</strong>
                  <span>{c.opis}</span>
                  <small>{new Date(c.datum).toLocaleDateString("sl-SI")} · {c.branje} branja</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Noga />
    </>
  );
}
