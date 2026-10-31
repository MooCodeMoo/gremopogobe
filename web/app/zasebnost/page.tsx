import type { Metadata } from "next";
import { Nav, Noga } from "@/components/Nav";
import { UPRAVLJAVEC } from "@/lib/upravljavec";
import { JsonLd, drobtinice } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Zasebnost in obdelava podatkov | Gremo po gobe",
  description: "Katere podatke zbiramo na gremopogobe.si, zakaj, kako dolgo jih hranimo in kako jih izbrišeš.",
  alternates: { canonical: "/zasebnost" },
};

export default function Zasebnost() {
  const u = UPRAVLJAVEC;
  return (
    <>
      <Nav />
      <JsonLd data={drobtinice([["Napoved", "/"], ["Zasebnost", "/zasebnost"]])} />
      <main>
        <section className="regije-vrh">
          <h1>Zasebnost</h1>
          <p className="uvod siroko">Zbiramo čim manj podatkov. Na kratko: brez piškotkov za sledenje, brez oglasov, brez prodaje podatkov. Posodobljeno 31. 10. 2026.</p>
        </section>

        <section className="odsek besedilo">
          <h2 className="naslov">Kdo je upravljavec</h2>
          <p>{u.ime}{u.naslov ? `, ${u.naslov}` : ""}. Kontakt za vsa vprašanja o podatkih: <a href={`mailto:${u.mail}`}>{u.mail}</a>.</p>

          <h2 className="naslov">Obisk strani</h2>
          <p>
            Obiske štejemo brez piškotkov in brez shranjenih IP naslovov. Uporabljamo Vercel Analytics (zbirni podatki) in lasten števec, ki
            hrani samo število ogledov strani, anonimni dnevni podpis obiskovalca (zgoščena vrednost, ki se vsak dan spremeni in je ni mogoče
            povezati z osebo), vrsto naprave (mobilno ali namizno), gostiteljsko ime strani, od koder si prišel, in izbire na strani (na primer izbrana vrsta).
            Podatki se hranijo do 120 dni.
          </p>

          <h2 className="naslov">Poročila o najdbah</h2>
          <p>
            Ob poročilu shranimo območje, vrsto, ali si gobe našel, datum in po želji kratko opombo ter fotografijo. Točne lokacije ne
            beležimo. Če fotografija vsebuje GPS podatke, jih preberemo samo v tvojem brskalniku, da ti predlagamo območje. Ne pošljemo
            jih na strežnik, fotografijo pa pred pošiljanjem pomanjšamo, s čimer se odstranijo vgrajeni metapodatki. Fotografije in opombe so lahko javno vidne
            v galeriji najdb. Tvoj IP naslov uporabimo samo za omejitev števila poročil in se po 24 urah izbriše.
          </p>

          <h2 className="naslov">Bilten po e-pošti</h2>
          <p>
            Ob prijavi shranimo e-naslov in izbrana območja. Prijavo potrdiš s povezavo v sporočilu (dvojna potrditev). Pošiljamo največ en tedenski
            bilten, v vsakem sporočilu je povezava za odjavo. Po odjavi se podatki izbrišejo. E-pošto pošilja ponudnik Resend, podatke hrani Upstash.
          </p>

          <h2 className="naslov">Obvestila v brskalniku</h2>
          <p>
            Če vklopiš obvestila, shranimo naslov naročnine, ki ga izda tvoj brskalnik, in izbrana območja, vrste ter prag. Obvestila lahko
            izklopiš kadar koli na strani ali v nastavitvah brskalnika, ob tem se naročnina izbriše. Priljubljena območja si strani zapomni samo v tvojem brskalniku (localStorage).
          </p>

          <h2 className="naslov">Tvoje pravice</h2>
          <p>
            Lahko zahtevaš vpogled, popravek ali izbris svojih podatkov, in sicer z e-pošto na <a href={`mailto:${u.mail}`}>{u.mail}</a>. Če meniš, da ravnamo napačno, se
            lahko pritožiš pri <a href="https://www.ip-rs.si/">Informacijskem pooblaščencu</a>.
          </p>

          <h2 className="naslov">Drugi viri podatkov</h2>
          <p>Vremenske podatke prevzemamo iz Open-Meteo.com, podatke o najdbah za kalibracijo modela iz zbirke GBIF, sestavo gozda iz podatkov Zavoda za gozdove Slovenije. Pri tem ne obdelujemo osebnih podatkov obiskovalcev.</p>
        </section>
      </main>
      <Noga />
    </>
  );
}
