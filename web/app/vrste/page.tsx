import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import { OPISI } from "@/lib/vrste-opisi";
import { JsonLd, drobtinice } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Užitne gobe: jurček, lisička, marela, štorovka | Gremo po gobe",
  description: "Kdaj in kje rastejo najbolj priljubljene užitne gobe v Sloveniji, kako jih prepoznamo in s čim jih lahko zamenjamo.",
  alternates: { canonical: "/vrste" },
};

export default function Vrste() {
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Vrste gob", "/vrste"]])} />
      <main>
        <section className="regije-vrh">
          <h1>Vrste gob</h1>
          <p className="uvod">Štiri najbolj priljubljene užitne gobe, za katere računamo napoved rasti. Za vsako preberi, kdaj in kje raste, kako jo prepoznaš in s čim jo lahko zamenjaš.</p>
        </section>
        <section className="odsek">
          <div className="mreza-vrst">
            {OPISI.map((o) => (
              <Link key={o.id} href={`/vrste/${o.id}`} className="kartica vrsta-kartica">
                <strong>{o.ime}</strong>
                <em>{o.latinsko}</em>
                <p>{o.uvod.split(". ")[0]}.</p>
                <span className="vec">Preberi več</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Noga />
    </>
  );
}
