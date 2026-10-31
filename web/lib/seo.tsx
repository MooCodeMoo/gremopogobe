import type { Metadata } from "next";

export const URL_STRANI = "https://gremopogobe.si";

/** Vsaka podstran dobi svoje oznake tudi pri deljenju povezave. */
export function metadataStrani(pot: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pot },
    openGraph: {
      title, description, url: new URL(pot, URL_STRANI).href,
      siteName: "Gremo po gobe", locale: "sl_SI", type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Gremo po gobe – gobarska napoved za Slovenijo" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

/** JSON-LD drobtinice: [["Napoved", "/"], ["Regije", "/regije"], ...] */
export function drobtinice(pot: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: pot.map(([ime, url], i) => ({ "@type": "ListItem", position: i + 1, name: ime, item: URL_STRANI + url })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
