import type { Metadata } from "next";
import { Nav, Noga } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Pravila nabiranja gob in sezonski koledar | Gremo po gobe",
  description: "Koliko gob smeš nabrati, kakšne so kazni in kdaj raste katera vrsta v Sloveniji.",
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
  ["Količina", "Za lastne potrebe največ 2 kg gob na osebo na dan. Nabiranje nekaterih vrst je prepovedano."],
  ["Oprema", "Gobe odrežemo z nožem in jih nosimo v zračni posodi, na primer v pleteni košari. Plastične vrečke niso dovoljene."],
  ["Kazni", "Po uredbi o varstvu samoniklih gliv od 250 do 2.500 € za posameznike in od 400 do 4.000 € za pravne osebe in s.p."],
  ["Kje", "Na zavarovanih območjih je nabiranje lahko omejeno ali prepovedano. Gozd ima lastnika, bodi gost."],
];

export default function Vodic() {
  const zdaj = new Date().getMonth() + 1;
  return (
    <>
      <Nav />
      <main>
        <section className="vodic-vrh">
          <div>
            <h1>Kaj moraš vedeti, preden greš v gozd</h1>
            <p className="uvod">V Sloveniji raste okoli 3000 vrst gob, od tega približno 200 strupenih. Nabiraj samo tisto, kar zanesljivo poznaš.</p>
            <p className="opozorilo">Ta stran ni pomoč pri določanju užitnosti. Za določanje obišči gobarsko razstavo ali determinatorja v najbližjem gobarskem društvu.</p>
          </div>
          <div id="pravila">
            <h2 className="naslov">Pravila</h2>
            <dl className="pravila-seznam">
              {PRAVILA.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
            </dl>
          </div>
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
