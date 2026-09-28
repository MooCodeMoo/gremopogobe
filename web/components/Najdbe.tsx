"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { VRSTE, type VrstaId } from "@/lib/vrste";
import { TOCKE } from "@/lib/napoved";
import { gpsIzSlike, najblizjaTocka } from "@/lib/exif";
import { upload } from "@vercel/blob/client";

const TOZILNIK: Record<VrstaId, string> = { jurcek: "jurčka", lisicka: "lisičko", marela: "marelo", storovka: "štorovko" };
const NAJVECJA_SLIKA = 20 * 1024 * 1024; // enako kot v app/api/najdba/zeton

type Stat = { dni: number; skupaj: { da: number; ne: number }; po_vrstah: Record<string, { da: number; ne: number }> };

export default function Najdbe({ slug, ime }: { slug: string; ime: string }) {
  const [vrsta, setVrsta] = useState<VrstaId>("jurcek");
  const [stat, setStat] = useState<Stat | null>(null);
  const [stanje, setStanje] = useState<"" | "poslano" | "ze" | "napaka">("");
  const [sporocilo, setSporocilo] = useState("");
  const [posiljam, setPosiljam] = useState(false);
  const [slika, setSlika] = useState<File | null>(null);
  const [predogled, setPredogled] = useState<string | null>(null);
  const [opomba, setOpomba] = useState("");
  const [namig, setNamig] = useState<string | null>(null);
  const vhod = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/najdba?slug=${slug}`).then((r) => (r.ok ? r.json() : null)).then(setStat).catch(() => {});
  }, [slug]);

  useEffect(() => () => { if (predogled) URL.revokeObjectURL(predogled); }, [predogled]);

  function izberiSliko(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setNamig(null);
    if (!f) { setSlika(null); setPredogled(null); return; }
    if (f.size > NAJVECJA_SLIKA) { setStanje("napaka"); setSporocilo("Fotografija je prevelika (največ 20 MB)."); return; }
    setStanje("");
    setSlika(f);
    setPredogled((prej) => { if (prej) URL.revokeObjectURL(prej); return URL.createObjectURL(f); });
    // Lokacijo iz slike uporabimo samo tu, v brskalniku - na strežnik je ne pošljemo
    gpsIzSlike(f).then((gps) => {
      if (!gps) return;
      const t = najblizjaTocka(gps, TOCKE);
      if (t.slug !== slug) setNamig(t.ime);
    });
  }

  function odstraniSliko() {
    if (predogled) URL.revokeObjectURL(predogled);
    setSlika(null); setPredogled(null); setNamig(null);
    if (vhod.current) vhod.current.value = "";
  }

  async function poslji(najdeno: boolean) {
    setPosiljam(true);
    setSporocilo("");
    try {
      let slikaUrl: string | undefined;
      if (slika) {
        // Fotografija gre naravnost v shrambo, mimo naše strežniške funkcije - ta ima
        // omejitev velikosti zahteve, prava telefonska fotografija bi jo zlahka presegla.
        const nalozeno = await upload(`najdbe/${slug}/${vrsta}`, slika, { access: "public", handleUploadUrl: "/api/najdba/zeton" });
        slikaUrl = nalozeno.url;
      }
      const r = await fetch("/api/najdba", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, vrsta, najdeno, opomba: opomba.trim() || undefined, slikaUrl }),
      });
      if (r.status === 429) setStanje("ze");
      else if (!r.ok) { const o = await r.json().catch(() => ({}) as { napaka?: string }); setStanje("napaka"); setSporocilo(o.napaka ?? "Odgovora ni bilo mogoče shraniti."); }
      else {
        setStat(await r.json()); setStanje("poslano");
        track("najdba", { vrsta, najdeno, kje: "regija", sSliko: Boolean(slika) });
      }
    } catch {
      setStanje("napaka"); setSporocilo("Odgovora ni bilo mogoče shraniti. Poskusi kasneje.");
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
          <>
            <div className="najdbe-slika">
              <input ref={vhod} type="file" accept="image/*" capture="environment" onChange={izberiSliko} id={`slika-${slug}`} className="sr" />
              {predogled ? (
                <div className="najdbe-predogled">
                  <img src={predogled} alt="" />
                  <button type="button" onClick={odstraniSliko} aria-label="Odstrani fotografijo">×</button>
                </div>
              ) : (
                <label htmlFor={`slika-${slug}`} className="najdbe-dodaj-sliko">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 15l-5-5-9 9" /></svg>
                  Dodaj fotografijo (neobvezno)
                </label>
              )}
              {namig && <p className="najdbe-opomba">Fotografija je bila posneta bliže območju <strong>{namig}</strong>. Poročilo bo vseeno zabeleženo za {ime}.</p>}
              {predogled && (
                <input type="text" value={opomba} onChange={(e) => setOpomba(e.target.value.slice(0, 140))} placeholder="Opomba, npr. pod bukvijo ob poti (neobvezno, javno vidno)" className="najdbe-opomba-vnos" maxLength={140} />
              )}
            </div>
            <div className="najdbe-gumbi">
              <button type="button" className="gumb-da" disabled={posiljam} onClick={() => poslji(true)}>Našel sem</button>
              <button type="button" className="gumb-ne" disabled={posiljam} onClick={() => poslji(false)}>Nisem našel</button>
            </div>
          </>
        )}
        {stanje === "ze" && <p className="najdbe-opomba">Za to vrsto si danes že odgovoril.</p>}
        {stanje === "napaka" && <p className="najdbe-opomba">{sporocilo || "Odgovora ni bilo mogoče shraniti. Poskusi kasneje."}</p>}
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
