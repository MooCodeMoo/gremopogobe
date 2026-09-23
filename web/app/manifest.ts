import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gremo po gobe - gobarska napoved",
    short_name: "Gremo po gobe",
    description: "Kje rastejo gobe ta teden? Napoved rasti za gozdna območja po Sloveniji.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F3EFE6",
    theme_color: "#F3EFE6",
    lang: "sl",
    categories: ["weather", "lifestyle", "travel"],
    icons: [
      { src: "/icons/ikona-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/ikona-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/ikona-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Vse regije", url: "/regije" },
      { name: "Vrste gob", url: "/vrste" },
    ],
  };
}
