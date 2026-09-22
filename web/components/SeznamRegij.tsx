"use client";
import Link from "next/link";
import { useState } from "react";
import { VRSTE, OZNAKE, barva, besediloNa, stopnja, type VrstaId } from "@/lib/vrste";
import type { Napoved, TockaNapoved } from "@/lib/napoved";

const DN = ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];
const dan = (iso: string) => DN[new Date(iso).getDay()];
const dat = (iso: string) => `${new Date(iso).getDate()}.`;
type Razvrsti = "najboljse" | "abeceda" | "pokrajina";

export default function SeznamRegij({ napoved }: { napoved: Napoved }) {
  const [vrsta, setVrsta] = useState<VrstaId>("jurcek");
  const [razvrsti, setRazvrsti] = useState<Razvrsti>("najboljse");
  const vrh = (t: TockaNapoved) => Math.max(...t.indeks[vrsta]);

  const tocke = [...napoved.tocke].sort((a, b) =>
    razvrsti === "najboljse" ? vrh(b) - vrh(a)
    : razvrsti === "abeceda" ? a.ime.localeCompare(b.ime, "sl")
    : a.regija.localeCompare(b.regija, "sl") || vrh(b) - vrh(a)
  );
  const skupine: [string, TockaNapoved[]][] = razvrsti === "pokrajina"
    ? [...new Set(tocke.map((t) => t.regija))].map((r) => [r, tocke.filter((t) => t.regija === r)])
    : [["", tocke]];

  return (
    <>
      <div className="seznam-kontrole">
        <div className="segment" role="group" aria-label="Vrsta">
          {VRSTE.map((v) => (
            <button key={v.id} type="button" aria-pressed={v.id === vrsta} onClick={() => setVrsta(v.id)}>{v.ime}</button>
          ))}
        </div>
        <label className="razvrsti">
          Razvrsti
          <select value={razvrsti} onChange={(e) => setRazvrsti(e.target.value as Razvrsti)}>
            <option value="najboljse">Najboljše ta teden</option>
            <option value="abeceda">Po abecedi</option>
            <option value="pokrajina">Po pokrajini</option>
          </select>
        </label>
      </div>

      <div className="seznam" role="table" aria-label={`Napoved po območjih za vrsto ${VRSTE.find((v) => v.id === vrsta)!.ime}`}>
        <div className="seznam-vrstica glava" role="row">
          <span role="columnheader">Območje</span>
          <div className="trak" role="columnheader">
            {napoved.dnevi.map((d) => <span key={d}>{dan(d)} <b>{dat(d)}</b></span>)}
          </div>
          <span role="columnheader" className="desno">Vrh tedna</span>
        </div>
        {skupine.map(([ime, lst]) => (
          <div key={ime || "vse"} role="rowgroup">
            {ime && <div className="seznam-skupina" role="row"><span role="rowheader">{ime}</span></div>}
            {lst.map((t) => {
              const vals = t.indeks[vrsta];
              const m = Math.max(...vals);
              const i = vals.indexOf(m);
              return (
                <Link key={t.slug} href={`/regija/${t.slug}`} className="seznam-vrstica" role="row">
                  <span role="rowheader" className="seznam-ime"><strong>{t.ime}</strong>{razvrsti !== "pokrajina" && <small>{t.regija}</small>}</span>
                  <div className="trak" role="cell">
                    {vals.map((v, k) => (
                      <span key={k} className="celica" style={{ background: barva(v), color: besediloNa(v) }} title={`${dan(napoved.dnevi[k])}: ${v}`}>{v}</span>
                    ))}
                  </div>
                  <span role="cell" className="desno seznam-vrh">
                    <span>{OZNAKE[stopnja(m)]}, {dan(napoved.dnevi[i]).toLowerCase()}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
