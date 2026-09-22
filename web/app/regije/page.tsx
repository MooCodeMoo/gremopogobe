import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import SeznamRegij from "@/components/SeznamRegij";
import { getNapoved } from "@/lib/napoved";

export const revalidate = 10800;
export const metadata: Metadata = {
  title: "Gobja napoved po regijah | Gremo po gobe",
  description: "7-dnevna napoved rasti jurčkov, lisičk, marel in štorovk za 30 gozdnih območij po Sloveniji.",
  alternates: { canonical: "/regije" },
};

export default async function Regije() {
  const napoved = await getNapoved();
  return (
    <>
      <Nav />
      <main>
        <section className="regije-vrh">
          <h1>Vse regije</h1>
          <p className="uvod">Napoved za 7 dni po gozdnih območjih. Klikni na vrstico za podrobnosti.</p>
        </section>
        <section className="odsek">
          {napoved ? <SeznamRegij napoved={napoved} /> : (
            <p className="uvod">Vremenski podatki trenutno niso dosegljivi. Poskusi znova čez nekaj minut ali preberi <Link href="/vodic">vodič</Link>.</p>
          )}
        </section>
      </main>
      <Noga />
    </>
  );
}
