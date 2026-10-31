import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import { JsonLd, drobtinice, metadataStrani } from "@/lib/seo";
import SeznamRegij from "@/components/SeznamRegij";
import { getNapoved } from "@/lib/napoved";

export const revalidate = 10800;
export const metadata: Metadata = metadataStrani(
  "/regije",
  "Kje rastejo gobe? Napoved po regijah | Gremo po gobe",
  "Primerjaj 7-dnevno gobarsko napoved za 30 območij Slovenije. Preveri razmere za jurčke, lisičke, marele in štorovke ter izberi območje za izlet.",
);

export default async function Regije() {
  const napoved = await getNapoved();
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Napoved po regijah", "/regije"]])} />
      <main>
        <section className="regije-vrh">
          <h1>Gobarska napoved po regijah</h1>
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
