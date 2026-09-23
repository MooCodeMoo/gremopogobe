import type { Metadata } from "next";
import { Nav, Noga } from "@/components/Nav";
import ZemljevidNajdb from "@/components/ZemljevidNajdb";
import { TOCKE } from "@/lib/napoved";

export const metadata: Metadata = {
  title: "Zemljevid najdb - kje ljudje najdejo gobe | Gremo po gobe",
  description: "Kje so gobarji zadnje dni res našli gobe? Poročila uporabnikov po območjih Slovenije.",
  alternates: { canonical: "/najdbe" },
};

export default function Najdbe() {
  return (
    <>
      <Nav />
      <main>
        <section className="regije-vrh">
          <h1>Zemljevid najdb</h1>
          <p className="uvod">Kaj poročajo gobarji zadnjih 14 dni. Vsak odgovor izboljša tudi napoved, ker model primerja poročila z vremenom.</p>
        </section>
        <section className="odsek">
          <ZemljevidNajdb tocke={TOCKE} />
        </section>
      </main>
      <Noga />
    </>
  );
}
