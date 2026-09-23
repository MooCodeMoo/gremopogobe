import type { MetadataRoute } from "next";
import { TOCKE } from "@/lib/napoved";
import { OPISI } from "@/lib/vrste-opisi";
import { URL_STRANI } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const zdaj = new Date();
  return [
    { url: `${URL_STRANI}/`, lastModified: zdaj, changeFrequency: "hourly", priority: 1 },
    { url: `${URL_STRANI}/regije`, lastModified: zdaj, changeFrequency: "hourly", priority: 0.9 },
    { url: `${URL_STRANI}/najdbe`, lastModified: zdaj, changeFrequency: "daily", priority: 0.7 },
    { url: `${URL_STRANI}/vrste`, lastModified: zdaj, changeFrequency: "monthly", priority: 0.7 },
    ...OPISI.map((o) => ({ url: `${URL_STRANI}/vrste/${o.id}`, lastModified: zdaj, changeFrequency: "daily" as const, priority: 0.8 })),
    ...TOCKE.map((t) => ({ url: `${URL_STRANI}/regija/${t.slug}`, lastModified: zdaj, changeFrequency: "hourly" as const, priority: 0.8 })),
    { url: `${URL_STRANI}/drustva`, lastModified: zdaj, changeFrequency: "monthly", priority: 0.6 },
    { url: `${URL_STRANI}/vodic`, lastModified: zdaj, changeFrequency: "monthly", priority: 0.6 },
  ];
}
