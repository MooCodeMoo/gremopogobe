import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";

export const metadata: Metadata = { title: "Brez povezave | Gremo po gobe", robots: { index: false } };

export default function BrezPovezave() {
  return (
    <>
      <Nav />
      <main>
        <section className="prazno">
          <h1>Ni povezave</h1>
          <p>Zadnjo napoved, ki si jo odprl, lahko pogledaš tudi brez signala. Ko boš spet na omrežju, se podatki samodejno osvežijo.</p>
          <p><Link href="/">Poskusi znova</Link></p>
        </section>
      </main>
      <Noga />
    </>
  );
}
