"use client";
import { useEffect, useState } from "react";
import { VRSTE, type VrstaId } from "@/lib/vrste";
import { mojaObmocja } from "@/lib/moja";
import type { TockaNapoved } from "@/lib/napoved";

export default function NajdbeHitro({ tocke }: { tocke: TockaNapoved[] }) {
  const [slug, setSlug] = useState(tocke[0]?.slug ?? "");
  const [vrsta, setVrsta] = useState<VrstaId>("jurcek");
  const [stanje, setStanje] = useState<"" | "poslano" | "ze" | "napaka">("");
  const [posiljam, setPosiljam] = useState(false);

  useEffect(() => {
    const moja = mojaObmocja();
    const prvo = tocke.find((t) => moja.includes(t.slug));
    if (prvo) setSlug(prvo.slug);
  }, [tocke]);

  async function poslji(najdeno: boolean) {
    setPosiljam(true);
    try {
      const r = await fetch("/api/najdba", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, vrsta, najdeno }),
      });
      setStanje(r.status === 429 ? "ze" : r.ok ? "poslano" : "napaka");
    } catch { setStanje("napaka"); }
    setPosiljam(false);
  }

  const urejene = [...tocke].sort((a, b) => a.ime.localeCompare(b.ime, "sl"));

  return (
    <section className="hitra-najdba">
      <div>
        <h2>Si bil v gozdu?</h2>
        <p>Povej, ali si gobe našel. Odgovori izboljšujejo napoved za vse, beležimo pa samo območje, vrsto in dan. <a href="/najdbe">Poglej zemljevid najdb</a></p>
      </div>
      <div className="hitra-vnos">
        <label className="sr" htmlFor="hitra-obmocje">Območje</label>
        <select id="hitra-obmocje" value={slug} onChange={(e) => { setSlug(e.target.value); setStanje(""); }}>
          {urejene.map((t) => <option key={t.slug} value={t.slug}>{t.ime}</option>)}
        </select>
        <label className="sr" htmlFor="hitra-vrsta">Vrsta</label>
        <select id="hitra-vrsta" value={vrsta} onChange={(e) => { setVrsta(e.target.value as VrstaId); setStanje(""); }}>
          {VRSTE.map((v) => <option key={v.id} value={v.id}>{v.ime}</option>)}
        </select>
        {stanje === "poslano" ? (
          <p className="hitra-hvala">Hvala, zabeleženo.</p>
        ) : (
          <div className="najdbe-gumbi">
            <button type="button" className="gumb-da" disabled={posiljam} onClick={() => poslji(true)}>Našel sem</button>
            <button type="button" className="gumb-ne" disabled={posiljam} onClick={() => poslji(false)}>Nisem našel</button>
          </div>
        )}
        {stanje === "ze" && <p className="najdbe-opomba">Za to območje in vrsto si danes že odgovoril.</p>}
        {stanje === "napaka" && <p className="najdbe-opomba">Odgovora ni bilo mogoče shraniti.</p>}
      </div>
    </section>
  );
}
