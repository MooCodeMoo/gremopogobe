import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pravila nabiranja gob in sezonski koledar | Gremo po gobe",
  description: "Koliko gob smeš nabrati, katera pravila veljajo in kdaj raste katera vrsta v Sloveniji. Z uradnimi viri in datumom preverjanja.",
  alternates: { canonical: "/vodic" },
};

const MESECI = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
const KOLEDAR: [string, string, number[]][] = [
  ["Smrček", "Morchella", [3, 4, 5]],
  ["Jurček", "Boletus edulis", [6, 7, 8, 9, 10]],
  ["Lisička", "Cantharellus cibarius", [6, 7, 8, 9, 10]],
  ["Orjaški dežnik (marela)", "Macrolepiota procera", [7, 8, 9, 10]],
  ["Štorovka", "Armillaria", [9, 10, 11]],
  ["Bukov ostrigar", "Pleurotus ostreatus", [10, 11, 12, 1, 2]],
];
const PRAVILA = [
  ["Količina", "Za lastne potrebe največ 2 kg gob na osebo na dan. Zavarovanih vrst gliv ni dovoljeno nabirati."],
  ["Oprema", "Gobe nežno odvijemo ali odrežemo pri tleh, da ne poškodujemo podgobja, in jih nosimo v zračni posodi, na primer v pleteni košari. Brez plastičnih vrečk."],
  ["Kazni", "Za kršitve so predpisane globe, višino določajo veljavni predpisi (Zakon o ohranjanju narave, Zakon o gozdovih in uredbi o gobah). Inšpektorji lahko izdajo tudi plačilni nalog in zasežejo nabrano."],
  ["Kje", "V gozdnih rezervatih in ostankih pragozdov nabiranje ni dovoljeno, na zavarovanih območjih je lahko omejeno. Gozd ima lastnika, bodi gost."],
];

export default function Vodic() {
  const zdaj = new Date().getMonth() + 1;
  return (
    <>
      <Nav />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: [
          ["Koliko gob lahko naberem na dan?", "Za lastne potrebe največ 2 kg gob na osebo na dan. Zavarovanih vrst gliv ni dovoljeno nabirati."],
          ["V kaj lahko nabiram gobe?", "Gobe nežno odvijemo ali odrežemo pri tleh, da ne poškodujemo podgobja, in jih nosimo v zračni posodi, na primer v pleteni košari. Brez plastičnih vrečk."],
          ["Kakšne so kazni za nedovoljeno nabiranje gob?", "Za kršitve so predpisane globe, višino določajo veljavni predpisi (Zakon o ohranjanju narave, Zakon o gozdovih in uredbi o gobah). Inšpektorji lahko izdajo tudi plačilni nalog in zasežejo nabrano."],
          ["Koliko vrst gob raste v Sloveniji?", "V Sloveniji je raziskanih in določenih več kot 3000 vrst gob. Po navedbah Mikološke zveze Slovenije je okoli 30 vrst smrtno strupenih."],
        ].map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }} />
      <main>
        <section className="vodic-vrh">
          <div>
            <h1>Kaj moraš vedeti, preden greš v gozd</h1>
            <p className="uvod">V Sloveniji je raziskanih in določenih več kot 3000 vrst gob, okoli 30 jih je smrtno strupenih. Nabiraj samo tisto, kar zanesljivo poznaš.</p>
            <p className="opozorilo">Ta stran ni pomoč pri določanju užitnosti. Za določanje obišči gobarsko razstavo ali determinatorja v najbližjem <Link href="/drustva">gobarskem društvu</Link>.</p>
          </div>
          <div id="pravila">
            <h2 className="naslov">Pravila</h2>
            <dl className="pravila-seznam">
              {PRAVILA.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
            </dl>
          </div>
        </section>

        <section className="odsek viri">
          <h2 className="naslov">Uradni viri</h2>
          <p className="uvod">Pravila smo preverili 31. 10. 2026. Predpisi se spreminjajo, zato pred nabiranjem preveri tudi veljavno besedilo.</p>
          <ul className="viri-seznam">
            <li><a href="https://www.gov.si/novice/2026-09-29-nadzor-nad-nabiranjem-gob/" rel="noopener">Ministrstvo za naravne vire in prostor: Nadzor nad nabiranjem gob</a> (29. 9. 2026) - omejitev 2 kg na osebo na dan, prepoved uničevanja zavarovanih vrst gliv</li>
            <li><a href="https://www.gov.si/novice/2022-09-21-pri-nabiranju-gob-in-gozdnih-plodov-upostevajmo-gozdni-bonton/" rel="noopener">Ministrstvo za kmetijstvo, gozdarstvo in prehrano: Gozdni bonton</a> (21. 9. 2022) - način nabiranja, prepovedan vstop v gozdne rezervate</li>
            <li><a href="https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/1998-01-2689/uredba-o-varstvu-samoniklih-gliv" rel="noopener">Uredba o varstvu samoniklih gliv</a> (Uradni list RS, št. 57/1998), 5. člen</li>
            <li>Uredba o zavarovanih prosto živečih vrstah gliv (Uradni list RS, št. 58/2011): seznam zavarovanih vrst</li>
          </ul>
        </section>

        <section className="odsek">
          <h2 className="naslov">Sezonski koledar</h2>
          <div className="koledar-ovoj">
            <table className="koledar">
              <thead><tr><th scope="col"><span className="sr">Vrsta</span></th>{MESECI.map((m, i) => <th scope="col" key={m} className={i + 1 === zdaj ? "zdaj" : ""}>{m}</th>)}</tr></thead>
              <tbody>
                {KOLEDAR.map(([ime, lat, mes]) => (
                  <tr key={ime}>
                    <th scope="row"><strong>{ime}</strong><em>{lat}</em></th>
                    {MESECI.map((m, i) => {
                      const on = mes.includes(i + 1);
                      return <td key={m}><span className={on ? (i + 1 === zdaj ? "on zdaj" : "on") : ""} aria-label={on ? "sezona" : undefined} /></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Noga />
    </>
  );
}
