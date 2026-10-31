import Link from "next/link";
import { CasnicaZamika, TemperaturnaOkna } from "./Ilustracije";

export const VIRI: { id: number; besedilo: React.ReactNode; vrsta: string }[] = [
  { id: 1, vrsta: "predtisk (še ni recenziran)", besedilo: <>Brejon Lamartiniere, E., Hoffman, J. I. (2025): <em>Predicting porcini: a decade of sporocarp monitoring reveals the meteorological triggers of Boletus edulis fruiting in central European beech forests</em>. bioRxiv, doi:10.64898/2025.12.12.693895. <a href="https://www.biorxiv.org/content/10.64898/2025.12.12.693895v1.full.pdf" rel="noopener">biorxiv.org</a></> },
  { id: 2, vrsta: "recenzirano", besedilo: <>Salerni, E., Paoli, L., Perini, C. (2023): <em>Combined impact of forest management and climate change on Boletus edulis productivity: may mycosilviculture mitigate the effects of climate extremes?</em> Italian Journal of Mycology 52: 76-88, doi:10.6092/issn.2531-7342/16464. <a href="https://italianmycology.unibo.it/article/view/16464" rel="noopener">italianmycology.unibo.it</a></> },
  { id: 3, vrsta: "recenzirano", besedilo: <><em>A king amongst dwarfs: Boletus edulis forms ectomycorrhiza with dwarf willow in the Swiss Alps</em>. Alpine Botany (2019). <a href="https://research-collection.ethz.ch/handle/20.500.11850/371435" rel="noopener">research-collection.ethz.ch</a></> },
  { id: 4, vrsta: "neodvisna analiza (ni recenzirana)", besedilo: <>Analiza približno 23.000 evropskih najdb jurčkov, opisana v razvojni zahtevi projekta funges (#327): vrh najdb 16, 23 in 25 dni po dežju glede na običajno temperaturo kraja. <a href="https://github.com/lodist/funges/pull/327" rel="noopener">github.com/lodist/funges</a></> },
  { id: 5, vrsta: "splošna enciklopedija", besedilo: <>Boletus edulis. Wikipedia (angleško): gostiteljska drevesa, sezona, vpliv suše in slane. <a href="https://en.wikipedia.org/wiki/Boletus_edulis" rel="noopener">en.wikipedia.org</a></> },
  { id: 6, vrsta: "popularni vir, tabela brez navedenega vira", besedilo: <>NaturNext: Rain, why does it make mushrooms grow? (zamik 5 do 10 dni). <a href="https://www.naturnext.eu/en/rain-why-it-makes-mushrooms-grow-science-and-myths-compared" rel="noopener">naturnext.eu</a></> },
  { id: 7, vrsta: "novinarski vir z navedbo strokovnjaka", besedilo: <>N1, 15. 8. 2023: »Letos polne košare že sredi poletja« (Slavko Šerod, Gobarsko društvo Lisička Maribor; podatki Mikološke zveze Slovenije). <a href="https://n1info.si/magazin/letos-polne-kosare-ze-sredi-poletja-dezevje-se-vsekakor-pozna-pri-rasti-gob/" rel="noopener">n1info.si</a></> },
  { id: 8, vrsta: "uradni vir", besedilo: <>Ministrstvo za naravne vire in prostor: Nadzor nad nabiranjem gob (29. 9. 2026), omejitev 2 kg na osebo na dan. <a href="https://www.gov.si/novice/2026-09-29-nadzor-nad-nabiranjem-gob/" rel="noopener">gov.si</a></> },
  { id: 9, vrsta: "turistični portal", besedilo: <>Slovenska turistična organizacija: Diši po gobah (več kot 3000 raziskanih vrst gliv). <a href="https://www.slovenia.info/sl/dozivetja/edinstvena-dozivetja-slovenije/133-disi-po-gobah" rel="noopener">slovenia.info</a></> },
  { id: 10, vrsta: "lasten model", besedilo: <>Model gremopogobe.si, naučen na zapisih najdb GBIF od leta 2022 (286 najdb jurčka). Metoda in omejitve: <Link href="/metodologija">Kako izračunamo</Link>.</> },
];

const Fotka = ({ src, alt, w, h, n, children }: { src: string; alt: string; w: number; h: number; n: number; children: React.ReactNode }) => (
  <figure className="cl-foto">
    <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
    <figcaption>{children} <a href={`#slika-${n}`}>Vir slike [{n}]</a></figcaption>
  </figure>
);

const S = ({ n }: { n: number[] }) => <sup className="cl-vir">[{n.join(", ")}]</sup>;

export default function KdajRastejoJurcki() {
  return (
    <>
      <Fotka src="/clanki/jurcka-gozd.webp" alt="Dva jurčka med praprotjo v gozdu" w={1200} h={800} n={1}>
        Jurčka (<em>Boletus edulis</em>) med praprotjo. Jurčki ne zrastejo čez noč, zato ni dovolj, da dežuje včeraj.
      </Fotka>

      <p className="cl-uvod">
        V petek vso noč dežuje. V soboto zjutraj odhitiš v gozd in nič. V nedeljo še enkrat, spet nič. To ni smola, to je biologija:
        jurčki se ne odzovejo na dež, ki ti pada na glavo, ampak na dež izpred nekaj dni do nekaj tednov.
      </p>

      <h2>Kar vidiš v gozdu, je samo plod</h2>
      <p>
        Goba, ki jo poberemo, je kratkotrajen plod. Večina organizma je podgobje, mreža nitk pod tlemi. Jurček pa ni samostojen:
        z drevesi živi v sožitju (mikoriza), kjer si izmenjujeta hranila. Med gostitelji navajajo med drugim smreko, bukev, hrast, bor in kostanj<S n={[5]} />,
        celo pritlikavo vrbo na 2440 metrih v švicarskih Alpah<S n={[3]} />. Podgobje je v tleh vedno, plodov pa ni. Zato mora nekaj sprožiti nastanek plodov, in to je pravi niz vremenskih razmer.
      </p>

      <Fotka src="/clanki/jurcek-bukev.webp" alt="Jurček v listju ob bukvi" w={1000} h={666} n={2}>
        Jurček ob bukvi. Gostiteljsko drevo je del zgodbe: brez njega podgobje ne obstaja.
      </Fotka>

      <h2>Dež je zagon, ne trenutek</h2>
      <p>
        Dež tla navlaži, plod pa potrebuje čas, da nastane in zraste. Kolikšen je ta zamik, viri ne povedo enako:
      </p>
      <ul>
        <li>popularni viri navajajo <strong>5 do 10 dni</strong> po izdatnem dežju<S n={[6]} />;</li>
        <li>neodvisna analiza okoli 23.000 evropskih najdb (ni recenzirana) kaže vrh najdb <strong>16 do 25 dni</strong> po dežju, in sicer krajši zamik v toplejših krajih (16 dni pri običajni povprečni temperaturi 13 °C ali več, 25 dni pod 9 °C)<S n={[4]} />;</li>
        <li>naš model, naučen na 286 zapisih najdb jurčka<S n={[10]} />, najbolje deluje, če upošteva dež <strong>10 do 28 dni</strong> nazaj.</li>
      </ul>
      <figure className="cl-figura">
        <CasnicaZamika />
        <figcaption>Razpon zamika med večjim dežjem in najdbami jurčkov po treh virih (dnevi po dežju). Viri se ne ujemajo povsem, zato jemljimo območje, ne eno številko.</figcaption>
      </figure>
      <p>
        Skupen sklep je preprost: dež včeraj ne bo naredil gob jutri. Najprej mine približno teden, največ najdb pa po analizah najdb pride <strong>nekje med dvema in štirimi tedni</strong> po dežju.
        Zato naša napoved ne gleda samo zadnjega dežja, ampak 28 dni nazaj.
      </p>

      <h2>Prevroče noči jih ustavijo</h2>
      <p>
        Dež sam ni dovolj. Desetletna nemška raziskava jurčkov v bukovih gozdovih (2015 do 2024, 1905 plodov; predtisk, še ni recenziran) je pokazala,
        da je večina plodov nastala pri temperaturah zraka med 7 in 19 °C, z optimumom okoli 13 °C, v obdobjih s petdnevnim povprečjem nad 17,5 °C in manj kot 1 mm dežja pa niso našli nobenega<S n={[1]} />.
        Podobno so v italijanski raziskavi na jelovih nasadih nenadni skoki najvišje temperature zavrli donos jurčkov v neredčenih in malo redčenih sestojih<S n={[2]} />.
        Rast zavrejo tudi dolga suša in prva slana<S n={[5]} />.
      </p>
      <p>
        Naš model zato namesto zraka gleda <strong>temperaturo tal</strong> v zgornjih 6 cm. Po zapisih najdb jurčkov so najugodnejša tla pri
        <strong> 11,5 do 19,1 °C</strong>, pod 7,1 in nad 21,3 °C pa ugodnih razmer ni<S n={[10]} />. Pri drugih vrstah so okna drugačna:
      </p>
      <figure className="cl-figura">
        <TemperaturnaOkna />
        <figcaption>Temperaturna okna tal po vrstah po modelu gremopogobe.si. Svetlo: razpon, v katerem so najdbe možne. Temno: najugodnejši del.</figcaption>
      </figure>

      <Fotka src="/clanki/jurcek-mah.webp" alt="Mlad jurček v mahu" w={1000} h={670} n={3}>
        Mlad jurček v mahu.
      </Fotka>

      <h2>Slovenski vzorec: jesen po deževnem poletju</h2>
      <p>
        Po besedah Slavka Šeroda iz Gobarskega društva Lisička Maribor vroče poletje gobam ne ustreza, optimum pa običajno pride jeseni, po izdatnejšem dežju in ohladitvi.
        Dobra gobarska leta so po njegovih besedah približno vsakih 5 do 7 let, izjemna pa še redkejša<S n={[7]} />.
        Po zapisih najdb od leta 2022 so za jurčke najugodnejši meseci avgust, september in oktober, julija jih je manj, novembra pa le še redki<S n={[10]} />.
      </p>

      <h2>Kako to uporabiš: pet korakov</h2>
      <ol>
        <li><strong>Poglej dež 2 do 4 tedne nazaj</strong>, ne samo zadnjih dni. Izdaten dež v tem oknu je dober znak.</li>
        <li><strong>Išči ohladitev.</strong> Tla naj bodo pod okoli 19 °C, noči pa vse hladnejše.</li>
        <li><strong>Izogni se vročini in suši</strong> po dežju. Dolg suh in vroč val lahko cel izplen pokvari.</li>
        <li><strong>Izberi pravi gozd.</strong> Jurček potrebuje drevesa, s katerimi živi v sožitju. Po našem višinskem oknu je najugodnejši med približno 250 in 1400 metri.</li>
        <li><strong>Preveri napoved.</strong> Na <Link href="/">gremopogobe.si</Link> vidiš indeks po območjih in <Link href="/najdbe">poročila drugih nabiralcev</Link>.</li>
      </ol>
      <p className="cl-okvir">
        Za lastne potrebe lahko na osebo na dan nabereš največ 2 kg gob<S n={[8]} />. Več o pravilih najdeš v <Link href="/vodic">vodiču</Link>.
        Nabiraj samo gobe, ki jih zanesljivo poznaš. V Sloveniji je raziskanih več kot 3000 vrst gob<S n={[9]} />, okoli 30 jih je smrtno strupenih<S n={[7]} />.
        Ta članek ni pomoč pri določanju: za to obišči <Link href="/drustva">gobarsko društvo</Link>.
      </p>

      <h2>Česa še ne vemo</h2>
      <p>
        Natančen zamik je odvisen od tal, dreves, višine in vremena in ga viri navajajo zelo različno, od 5 do 10 dni do skoraj meseca. Naša številka je ocena iz zapisov najdb, ne laboratorijska meritev,
        nemška raziskava pa je predtisk. Indeks na zemljevidu zato razumi kot pomoč pri načrtovanju izleta, ne kot napoved najdbe. Kako točno ga izračunamo, je opisano v
        <Link href="/metodologija"> metodologiji</Link>.
      </p>

      <section className="cl-viri" aria-labelledby="viri">
        <h2 id="viri">Viri in preverjanje</h2>
        <p className="cl-opomba">Članek je bil preverjen 31. 10. 2026. Ob vsakem viru je zapisano, kako zanesljiv je: trditve, ki temeljijo na predtisku ali neodvisni analizi, so tako označene.</p>
        <ol className="cl-viri-seznam">
          {VIRI.map((v) => (
            <li key={v.id} id={`vir-${v.id}`}>{v.besedilo} <span className="cl-tip">({v.vrsta})</span></li>
          ))}
        </ol>
        <h3 className="cl-slike-naslov">Viri slik</h3>
        <p className="cl-opomba">Fotografije so z Wikimedia Commons. Ilustraciji grafov sta izvirni delo gremopogobe.si.</p>
        <ol className="cl-viri-seznam">
          <li id="slika-1">Holger Krisp, <a href="https://commons.wikimedia.org/wiki/File:(Gemeine_Steinpilz)_Boletus_edulis.jpg" rel="noopener">(Gemeine Steinpilz) Boletus edulis</a>, <a href="https://creativecommons.org/licenses/by/3.0" rel="noopener">CC BY 3.0</a>. Pomanjšano in pretvorjeno v WebP.</li>
          <li id="slika-2">Henk Monster, <a href="https://commons.wikimedia.org/wiki/File:A_rather_big_Boletus_edulis_(eekhoorntjesbrood)_beside_a_beech_at_Velp_-_panoramio.jpg" rel="noopener">A rather big Boletus edulis (eekhoorntjesbrood) beside a beech at Velp</a>, <a href="https://creativecommons.org/licenses/by/3.0" rel="noopener">CC BY 3.0</a>. Pomanjšano in pretvorjeno v WebP.</li>
          <li id="slika-3">Ernie, <a href="https://commons.wikimedia.org/wiki/File:AD2009Sep13_Boletus_edulis_03.jpg" rel="noopener">AD2009Sep13 Boletus edulis 03</a>, javna last. Pomanjšano in pretvorjeno v WebP.</li>
        </ol>
      </section>
    </>
  );
}
