export const URL_STRANI = "https://gremopogobe.si";

/** JSON-LD drobtinice: [["Napoved", "/"], ["Regije", "/regije"], ...] */
export function drobtinice(pot: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: pot.map(([ime, url], i) => ({ "@type": "ListItem", position: i + 1, name: ime, item: URL_STRANI + url })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
