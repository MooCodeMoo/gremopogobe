"use client";
const KLJUC = "moja-obmocja";
const DOGODEK = "moja-obmocja-sprememba";

export function mojaObmocja(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KLJUC) ?? "[]"); } catch { return []; }
}

export function preklopiObmocje(slug: string) {
  const zdaj = mojaObmocja();
  const novo = zdaj.includes(slug) ? zdaj.filter((s) => s !== slug) : [...zdaj, slug];
  localStorage.setItem(KLJUC, JSON.stringify(novo));
  window.dispatchEvent(new Event(DOGODEK));
  return novo;
}

export function poslusaj(f: () => void) {
  window.addEventListener(DOGODEK, f);
  window.addEventListener("storage", f);
  return () => { window.removeEventListener(DOGODEK, f); window.removeEventListener("storage", f); };
}
