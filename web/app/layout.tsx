import type { Metadata } from "next";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/instrument-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gremo po gobe - gobarska napoved za Slovenijo",
  description: "Kje rastejo gobe ta teden? Indeks rasti za jurčke, lisičke, marele in štorovke po gozdnih območjih Slovenije.",
  metadataBase: new URL("https://gremopogobe.si"),
  openGraph: {
    title: "Gremo po gobe - gobja napoved za Slovenijo",
    description: "Kje rastejo gobe ta teden? Napoved za jurčke, lisičke, marele in štorovke po gozdnih območjih.",
    url: "https://gremopogobe.si",
    siteName: "Gremo po gobe",
    locale: "sl_SI",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "gremo po gobe - več kot nabiranje." }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl">
      <body>{children}</body>
    </html>
  );
}
