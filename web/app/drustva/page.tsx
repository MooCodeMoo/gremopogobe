import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Noga } from "@/components/Nav";
import { DRUSTVA, VIR_MZS } from "@/lib/drustva";
import { JsonLd, drobtinice } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Gobarska društva v Sloveniji - kje določijo gobe | Gremo po gobe",
  description: "Seznam gobarskih in mikoloških društev po regijah. Kam se obrniti, če želiš gobo zanesljivo določiti ali se naučiti nabirati.",
  alternates: { canonical: "/drustva" },
};

export default function Drustva() {
  const regije = [...new Set(DRUSTVA.map((d) => d.regija))];
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Gobarska društva", "/drustva"]])} />
      <main>
        <section className="regije-vrh">
          <h1>Gobarska društva</h1>
          <p className="uvod siroko">
            Nobena spletna stran ne more nadomestiti človeka, ki gobo vzame v roke. Društva pripravljajo razstave,
            predavanja in določevalne dneve, kjer ti determinator pove, kaj si nabral. Vsa spodaj našteta so včlanjena
            v Mikološko zvezo Slovenije.
          </p>
        </section>

        <section className="odsek">
          {regije.map((r) => (
            <div key={r} className="drustva-skupina">
              <h2>{r}</h2>
              <ul className="drustva-seznam">
                {DRUSTVA.filter((d) => d.regija === r).map((d) => (
                  <li key={d.ime + d.kraj}>
                    <span className="drustvo-ime">
                      {d.splet ? <a href={d.splet} target="_blank" rel="noopener noreferrer">{d.ime}</a> : d.ime}
                    </span>
                    <span className="drustvo-kraj">{d.kraj}</span>
                    {d.od && <span className="drustvo-leto">od {d.od}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="najdbe-opomba">
            Kontaktni podatki so objavljeni na strani <a href={VIR_MZS} target="_blank" rel="noopener noreferrer">Mikološke zveze Slovenije</a>,
            od koder je povzet tudi ta seznam. Če je kakšen podatek zastarel ali tvoje društvo manjka, piši na info@gremopogobe.si.
          </p>
        </section>

        <section className="odsek">
          <div className="najdbe">
            <div className="najdbe-besedilo">
              <h2>Preden gobo poješ</h2>
              <p>
                Če nisi povsem prepričan, je ne jej. Določevalni dnevi so brezplačni, društva pa gobe pregledajo tudi
                takrat, ko nisi njihov član. Preberi še <Link href="/vodic">pravila nabiranja</Link> in
                opise <Link href="/vrste">posameznih vrst</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Noga />
    </>
  );
}
