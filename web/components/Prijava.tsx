"use client";
import { useEffect, useState } from "react";
import { mojaObmocja } from "@/lib/moja";

export default function Prijava({ privzetoObmocje, ime }: { privzetoObmocje?: string; ime?: string }) {
  const [email, setEmail] = useState("");
  const [samoMoja, setSamoMoja] = useState(true);
  const [stanje, setStanje] = useState<"" | "poslano" | "napaka" | "posodobljeno">("");
  const [sporocilo, setSporocilo] = useState("");
  const [posiljam, setPosiljam] = useState(false);
  const [moja, setMoja] = useState<string[]>([]);
  useEffect(() => setMoja(mojaObmocja()), []);

  const obmocja = privzetoObmocje ? [privzetoObmocje] : samoMoja ? moja : [];

  async function poslji() {
    setPosiljam(true);
    setSporocilo("");
    try {
      const r = await fetch("/api/prijava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, obmocja }),
      });
      const o = await r.json().catch(() => ({}) as { napaka?: string; podrobnosti?: string });
      if (!r.ok) { setStanje("napaka"); setSporocilo([o.napaka ?? `Prijava ni uspela (${r.status}).`, o.podrobnosti].filter(Boolean).join(" ")); }
      else setStanje(o.stanje === "posodobljeno" ? "posodobljeno" : "poslano");
    } catch {
      setStanje("napaka"); setSporocilo("Prijava ni uspela. Poskusi kasneje.");
    }
    setPosiljam(false);
  }

  return (
    <section className="prijava">
      <div>
        <h2>Vikend napoved v nabiralnik</h2>
        <p>Vsak četrtek zjutraj kratek pregled: kje so razmere najboljše {privzetoObmocje ? `na območju ${ime}` : "in kdaj je vrh"}. Odjava z enim klikom.</p>
      </div>
      {stanje === "poslano" ? (
        <p className="prijava-hvala">Poslali smo ti sporočilo za potrditev. Odpri ga in klikni gumb.</p>
      ) : stanje === "posodobljeno" ? (
        <p className="prijava-hvala">Posodobljeno. Bilten dobiš ob četrtkih.</p>
      ) : (
        <div className="prijava-vnos">
          <label className="sr" htmlFor="prijava-email">E-naslov</label>
          <input id="prijava-email" type="email" inputMode="email" autoComplete="email" placeholder="tvoj@email.si"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="button" disabled={posiljam || email.length < 5} onClick={poslji}>Prijavi me</button>
          {!privzetoObmocje && moja.length > 0 && (
            <label className="prijava-izbira">
              <input type="checkbox" checked={samoMoja} onChange={(e) => setSamoMoja(e.target.checked)} />
              Samo moja območja ({moja.length})
            </label>
          )}
          {stanje === "napaka" && <p className="najdbe-opomba">{sporocilo}</p>}
        </div>
      )}
    </section>
  );
}
