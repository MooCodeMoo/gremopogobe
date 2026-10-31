import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import { CLANKI } from "@/lib/clanki";
import { JsonLd, URL_STRANI, drobtinice } from "@/lib/seo";
import "../clanek.css";
import KdajRastejoJurcki from "@/components/clanki/KdajRastejoJurcki";

const VSEBINA: Record<string, () => React.JSX.Element> = { "kdaj-rastejo-jurcki": KdajRastejoJurcki };

export const dynamicParams = false;
export function generateStaticParams() { return CLANKI.map((c) => ({ slug: c.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CLANKI.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.naslov} | Gremo po gobe`,
    description: c.opis,
    alternates: { canonical: `/clanki/${c.slug}` },
    openGraph: { title: c.naslov, description: c.opis, url: `${URL_STRANI}/clanki/${c.slug}`, type: "article", locale: "sl_SI", publishedTime: c.datum },
  };
}

export default async function ClanekStran({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CLANKI.find((x) => x.slug === slug);
  const Vsebina = VSEBINA[slug];
  if (!c || !Vsebina) notFound();
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Članki", "/clanki"], [c.naslov, `/clanki/${c.slug}`]])} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article", headline: c.naslov, description: c.opis, inLanguage: "sl",
        datePublished: c.datum, dateModified: c.datum, mainEntityOfPage: `${URL_STRANI}/clanki/${c.slug}`,
        author: { "@type": "Organization", name: "Gremo po gobe", url: URL_STRANI },
        publisher: { "@type": "Organization", name: "Gremo po gobe", url: URL_STRANI, logo: { "@type": "ImageObject", url: `${URL_STRANI}/brand/logo.png` } },
      }} />
      <main className="cl2">
        <header className="cl2-hero">
          <img src={c.slika} alt={c.slikaAlt} width={1200} height={800} fetchPriority="high" />
          <div className="cl2-hero-in">
            <p className="cl2-kraj"><Link href="/clanki">Članki</Link></p>
            <h1>{c.naslov}</h1>
            <p className="cl2-meta">{new Date(c.datum).toLocaleDateString("sl-SI")} · {c.branje} branja · preverjeno {c.preverjeno}</p>
          </div>
          <a className="cl2-kredit" href="#slika-1">{c.slikaVir}</a>
        </header>
        <article className="cl2-tx">
          <Vsebina />
        </article>
      </main>
      <Noga />
    </>
  );
}
