"use client";
import { useEffect, useState } from "react";
import { VRSTE, type VrstaId } from "@/lib/vrste";

const TOZILNIK: Record<VrstaId, string> = { jurcek: "jurčka", lisicka: "lisičko", marela: "marelo", storovka: "štorovko" };

type Stat = { dni: number; skupaj: { da: number; ne: number }; po_vrstah: Record<string, { da: number; ne: number }> };

export default function Najdbe({ slug, ime }: { slug: string; ime: string }) {
  const [vrsta, setVrsta] = useState<VrstaId>("jurcek");
  const [stat, setStat] = useState<Stat | null>(null);
  const [stanje, setStanje] = useState<"" | "poslano" | "ze" | "napaka">("");
  const [posiljam, setPosiljam] = useState(false);

  useEffect(() => {
    fetch(`/api/najdba?slug=${slug}`).then((r) => (r.ok ? r.json() : null)).then(setStat).catch(() => {});
  }, [slug]);

  async function poslji(najdeno: boolean) {
    setPosiljam(true);
    try {
      const r = await fetch("/api/najdba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, vrsta, najdeno }),
      });
      if (r.status === 429) setStanje("ze");
      else if (!r.ok) setStanje("napaka");
      else { setStat(await r.json()); setStanje("poslano"); }
    } catch {
      setStanje("napaka");
    }
    setPosiljam(false);
  }

  const v = stat?.po_vrstah?.[vrsta];
  const skupaj = (v?.da ?? 0) + (v?.ne ?? 0);

  return (
    <section className="najdbe">
      <div className="najdbe-besedilo">
        <h2>Si bil te dni na območju {ime}?</h2>
        <p>Tvoj odgovor izboljša napoved za vse. Ne beležimo, kje točno si bil, ampak samo območje, vrsto in dan.</p>
      </div>
      <div className="najdbe-vnos">
        <div className="segment" role="group" aria-label="Vrsta">
          {VRSTE.map((x) => (
            <button key={x.id} type="button" aria-pressed={x.id === vrsta} onClick={() => { setVrsta(x.id); setStanje(""); }}>{x.ime}</button>
          ))}
        </div>
        {stanje === "poslano" ? (
          <p className="najdbe-hvala">Hvala, zabeleženo.</p>
        ) : (
          <div className="najdbe-gumbi">
            <button type="button" className="gumb-da" disabled={posiljam} onClick={() => poslji(true)}>Našel sem</button>
            <button type="button" className="gumb-ne" disabled={posiljam} onClick={() => poslji(false)}>Nisem našel</button>
          </div>
        )}
        {stanje === "ze" && <p className="najdbe-opomba">Za to vrsto si danes že odgovoril.</p>}
        {stanje === "napaka" && <p className="najdbe-opomba">Odgovora ni bilo mogoče shraniti. Poskusi kasneje.</p>}
        {skupaj > 0 ? (
          <p className="najdbe-opomba">
            Zadnjih {stat!.dni} dni: {skupaj} {skupaj === 1 ? "odgovor" : skupaj === 2 ? "odgovora" : skupaj <= 4 ? "odgovori" : "odgovorov"} za {TOZILNIK[vrsta]}
            {skupaj === 1
              ? (v?.da ? ", gobe je našel." : ", gob ni našel.")
              : `, ${Math.round(((v?.da ?? 0) / skupaj) * 100)} % jih je gobe našlo.`}
          </p>
        ) : (
          <p className="najdbe-opomba">Za to vrsto še ni odgovorov v zadnjem tednu. Bodi prvi.</p>
        )}
      </div>
    </section>
  );
}
