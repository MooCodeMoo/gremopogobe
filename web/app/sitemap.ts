import type { MetadataRoute } from "next";
import { TOCKE } from "@/lib/napoved";
import { OPISI } from "@/lib/vrste-opisi";
import { URL_STRANI } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Datum izdelave sitemap-a ni datum spremembe vsebine.
  // lastModified dodamo, ko imamo zanesljiv čas posodobitve posamezne strani.
  return [
    { url: `${URL_STRANI}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${URL_STRANI}/regije`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${URL_STRANI}/najdbe`, changeFrequency: "daily", priority: 0.7 },
    { url: `${URL_STRANI}/vrste`, changeFrequency: "monthly", priority: 0.7 },
    ...OPISI.map((o) => ({ url: `${URL_STRANI}/vrste/${o.id}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...TOCKE.map((t) => ({ url: `${URL_STRANI}/regija/${t.slug}`, changeFrequency: "hourly" as const, priority: 0.8 })),
    { url: `${URL_STRANI}/drustva`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${URL_STRANI}/metodologija`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${URL_STRANI}/o-projektu`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${URL_STRANI}/zasebnost`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${URL_STRANI}/vodic`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
