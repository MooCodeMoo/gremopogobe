"use client";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { mojaObmocja, poslusaj, preklopiObmocje } from "@/lib/moja";

export default function Spremljaj({ slug }: { slug: string }) {
  const [moje, setMoje] = useState(false);
  useEffect(() => {
    const osvezi = () => setMoje(mojaObmocja().includes(slug));
    osvezi();
    return poslusaj(osvezi);
  }, [slug]);

  return (
    <button type="button" className={`spremljaj${moje ? " aktivno" : ""}`} aria-pressed={moje} onClick={() => { const je = preklopiObmocje(slug).includes(slug); setMoje(je); track(je ? "spremljaj_dodaj" : "spremljaj_odstrani", { slug }); }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill={moje ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z" />
      </svg>
      {moje ? "Med mojimi območji" : "Spremljaj to območje"}
    </button>
  );
}
