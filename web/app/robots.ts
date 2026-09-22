import type { MetadataRoute } from "next";
import { URL_STRANI } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${URL_STRANI}/sitemap.xml`, host: URL_STRANI };
}
