"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Beleži ogled strani v lasten števec (brez piškotkov). */
export default function Stat() {
  const pot = usePathname();
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || pot.startsWith("/admin")) return;
    try { navigator.sendBeacon?.("/api/stat", JSON.stringify({ t: "pv", p: pot, r: document.referrer })); } catch {}
  }, [pot]);
  return null;
}
