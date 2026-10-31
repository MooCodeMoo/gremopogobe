import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import model from "@/data/model.json";
import { JsonLd, drobtinice } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kako izračunamo gobarsko napoved | Gremo po gobe",
  description: "Kako nastane indeks ugodnosti razmer za gobe: katere podatke uporabljamo, kako je model preverjen, kako natančen je in česa ne zna.",
  alternates: { canonical: "/metodologija" },
};

type M = { vrste: Record<string, { temp: number[] }>; meta: { n: Record<string, number>; auc_cv: Record<string, { novo: number }>; od_leta: number; ustvarjeno: string }; dez_zamik: number[] };
const m = model as unknown as M;
const IME: Record<string, string> = { jurcek: "Jurček", lisicka: "Lisička", marela: "Marela", storovka: "Štorovka" };
const f = (x: number) => x.toFixed(2).replace(".", ",");

export default function Metodologija() {
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Kako izračunamo", "/metodologija"]])} />
      <main>
        <section className="regije-vrh">
          <h1>Kako izračunamo napoved</h1>
          <p className="uvod siroko">
            Številka na zemljevidu je <strong>indeks ugodnosti razmer od 0 do 100</strong>. Pove, kako dobro vreme zadnjih tednov ustreza
            razmeram, v katerih so ljudje v preteklosti pogosto našli določeno vrsto. Ni verjetnost, da boš gobe našel, in ni zagotovilo.
          </p>
        </section>

        <section className="odsek besedilo">
          <h2 className="naslov">Kaj vstopa v izračun</h2>
          <ul>
            <li><strong>Dež.</strong> Padavine zadnjih {m.dez_zamik[1]} dni. Največ šteje dež pred približno 10 do 28 dnevi, ker gobam traja, da iz podgobja zrastejo plodovi.</li>
            <li><strong>Temperatura tal.</strong> Temperatura v zgornjih 6 cm. Vsaka vrsta ima svoje okno, na primer jurček ugodne razmere pri {String(m.vrste.jurcek.temp[1]).replace(".", ",")} do {String(m.vrste.jurcek.temp[2]).replace(".", ",")} °C.</li>
            <li><strong>Vlaga tal.</strong> Vlažnost zgornjega sloja (3 do 9 cm). Brez nje tudi dober dež hitro izhlapi.</li>
            <li><strong>Gozd in nadmorska višina.</strong> Sestava gozda (smreka, bukev ...) po podatkih Zavoda za gozdove in višinsko okno posamezne vrste.</li>
            <li><strong>Sezona.</strong> Vsaka vrsta ima v letu svoj čas, zato jurčka v januarju ni.</li>
            <li><strong>Previdnostni popravek.</strong> Vse ocene dodatno znižamo za 10 %, ker model rad precenjuje razmere.</li>
          </ul>
          <p>Vremenske podatke prevzemamo iz <a href="https://open-meteo.com/">Open-Meteo.com</a> (CC BY 4.0), napoved se osvežuje večkrat na dan. Za 30 gozdnih območij izračunamo indeks, nato ga na zemljevidu razmažemo med točkami in ga utežimo z gozdom in višino na vsaki piki.</p>
        </section>

        <section className="odsek besedilo">
          <h2 className="naslov">Iz katerih najdb se je model naučil</h2>
          <p>
            Parametre (okna temperature, dežja in vlage) smo izračunali iz javnih zapisov najdb v zbirki <a href="https://www.gbif.org/">GBIF</a> od leta {m.meta.od_leta},
            skupaj z najdbami iz širše okolice, ker je v Sloveniji premalo zapisov. Zapis v GBIF pomeni, da je nekdo gobo opazil in jo vnesel,
            ne pa, da je bila košara polna. Zato je model rahlo optimističen in ga zmanjšujemo.
          </p>
          <table className="tabela-metodologija">
            <thead><tr><th scope="col">Vrsta</th><th scope="col" className="desno">Najdb v učni množici</th><th scope="col" className="desno">Uspešnost razvrščanja (AUC)</th></tr></thead>
            <tbody>
              {Object.keys(IME).map((id) => (
                <tr key={id}><th scope="row">{IME[id]}</th><td className="desno num">{m.meta.n[id]}</td><td className="desno num">{f(m.meta.auc_cv[id].novo)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="odsek besedilo">
          <h2 className="naslov">Kako natančen je model</h2>
          <p>
            Uspešnost smo preverili tako, da smo model naučili na vseh letih razen enega in ga preizkusili na izpuščenem letu. Mera AUC pove,
            kako pogosto ima dan z najdbo višji indeks kot dan brez nje: 0,5 je enako kot met kovanca, 1 je popolno razvrščanje. Naši rezultati
            so <strong>zmerni</strong> (približno 0,66 do 0,72 pri jurčku, lisički in marelah), pri štorovki je rezultat višji, a temelji na manjši množici zapisov.
          </p>
          <p>Zato indeks razumi kot pomoč pri odločitvi, kam in kdaj iti, ne kot napoved najdbe. Dan z indeksom 80 je v preteklosti pogosteje prinesel gobe kot dan z indeksom 30, ni pa nobenega zagotovila za konkretno jaso.</p>
        </section>

        <section className="odsek besedilo">
          <h2 className="naslov">Česa model ne ve</h2>
          <ul>
            <li>Ne ve, ali je lastnik gozda ali drug nabiralec že pobral gobe.</li>
            <li>Ne vidi mikrorastišč (pobočja, jase, rob gozda), ker računa za območje, ne za točko.</li>
            <li>Ne upošteva lokalnih neviht, ki jih vremenski model ni zaznal, ali vrzeli v vremenskih podatkih.</li>
            <li>Ne pomaga pri določanju užitnosti. Za to obišči determinatorja v <Link href="/drustva">gobarskem društvu</Link>.</li>
          </ul>
        </section>

        <section className="odsek besedilo">
          <h2 className="naslov">Poročila obiskovalcev</h2>
          <p>
            Poročila »našel sem« in »nisem našel« se prikazujejo na <Link href="/najdbe">zemljevidu najdb</Link> in zaenkrat <strong>ne spreminjajo</strong> indeksa.
            Namenjena so temu, da razmere primerjamo s tem, kar ljudje res najdejo, in model sčasoma preverimo. Pri območjih z manj kot 5 poročili uspešnosti ne ocenjujemo.
          </p>
          <p className="najdbe-opomba">Model je bil nazadnje izračunan {new Date(m.meta.ustvarjeno).toLocaleDateString("sl-SI")}. Pomanjkljivost ali napako nam sporoči na info@gremopogobe.si.</p>
        </section>
      </main>
      <Noga />
    </>
  );
}
