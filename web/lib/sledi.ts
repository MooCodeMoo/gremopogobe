"use client";
import { track as vercelTrack } from "@vercel/analytics";

/** Pošlje dogodek v Vercel Analytics in v lasten števec. Podatki: vrednosti se združijo v kratek niz. */
export function track(ime: string, podatki?: Record<string, string | number | boolean>) {
  try { vercelTrack(ime, podatki); } catch {}
  try {
    const d = podatki ? Object.values(podatki).map(String).join("_") : "";
    navigator.sendBeacon?.("/api/stat", JSON.stringify({ t: "ev", n: ime, d }));
  } catch {}
}
