import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import { UPRAVLJAVEC } from "@/lib/upravljavec";
import { JsonLd, URL_STRANI, drobtinice } from "@/lib/seo";

export const metadata: Metadata = {
  title: "O projektu in kontakt | Gremo po gobe",
  description: "Kdo stoji za gremopogobe.si, zakaj je nastal in kako nas doseženeš.",
  alternates: { canonical: "/o-projektu" },
};

export default function OProjektu() {
  const u = UPRAVLJAVEC;
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["O projektu", "/o-projektu"]])} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "Gremo po gobe", url: URL_STRANI, email: u.mail, logo: `${URL_STRANI}/brand/logo.png` }} />
      <main>
        <section className="regije-vrh">
          <h1>O projektu</h1>
          <p className="uvod siroko">Gremo po gobe je brezplačna gobarska napoved za Slovenijo. Iz vremena, tal in gozda ocenimo, kje in kdaj so razmere za jurčke, lisičke, marele in štorovke najboljše.</p>
        </section>

        <section className="odsek besedilo">
          <h2 className="naslov">Zakaj</h2>
          <p>Gobe ne rastejo po koledarju, ampak po vremenu. Hoteli smo izlet v gozd načrtovati bolj pametno kot »saj je bilo nekaj dežja«, in to z odprtimi podatki, ki jih lahko vsak preveri.</p>

          <h2 className="naslov">Kako deluje</h2>
          <p>Napoved temelji na javnih vremenskih podatkih in zapisih najdb. Metodo, natančnost in omejitve odkrito opisujemo na strani <Link href="/metodologija">Kako izračunamo</Link>.</p>

          <h2 className="naslov">Kaj ta stran ni</h2>
          <p>Ni pomoč pri določanju užitnosti. Nobena stran ne more nadomestiti človeka, ki gobo drži v roki. Pomoč najdeš pri <Link href="/drustva">gobarskih društvih</Link>.</p>

          <h2 className="naslov" id="kontakt">Kontakt</h2>
          <p>Upravljavec: {u.ime}{u.naslov ? `, ${u.naslov}` : ""}.</p>
          <p>E-pošta: <a href={`mailto:${u.mail}`}>{u.mail}</a> (napake v napovedi, predlogi, sodelovanje, zasebnost).</p>
          <p className="najdbe-opomba">Več o podatkih, ki jih obdelujemo, najdeš na strani <Link href="/zasebnost">Zasebnost</Link>.</p>
        </section>
      </main>
      <Noga />
    </>
  );
}
