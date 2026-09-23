import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";

export const metadata: Metadata = { title: "Prijava na bilten | Gremo po gobe", robots: { index: false } };

const BESEDILA: Record<string, [string, string]> = {
  potrjeno: ["Prijava potrjena", "Bilten boš prejel vsak četrtek zjutraj. Odjaviš se lahko z enim klikom v vsakem sporočilu."],
  odjavljen: ["Odjavljen si", "Biltena ne boš več prejemal. Če si si premislil, se lahko kadarkoli prijaviš znova."],
  napaka: ["Povezava ni veljavna", "Povezava je morda potekla ali je bila že uporabljena. Poskusi se prijaviti znova."],
};

export default async function PrijavaStran({ searchParams }: { searchParams: Promise<{ stanje?: string }> }) {
  const { stanje } = await searchParams;
  const [naslov, besedilo] = BESEDILA[stanje ?? ""] ?? ["Bilten", "Prijavi se na domači strani, pa ti vsak četrtek pošljemo napoved za vikend."];
  return (
    <>
      <Nav />
      <main>
        <section className="prazno">
          <h1>{naslov}</h1>
          <p>{besedilo}</p>
          <p><Link href="/">Nazaj na napoved</Link></p>
        </section>
      </main>
      <Noga />
    </>
  );
}
