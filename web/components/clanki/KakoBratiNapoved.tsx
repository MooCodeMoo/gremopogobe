import Link from "next/link";
import { LestvicaIndeksa, OknoDeza } from "./Ilustracije2";

export const VIRI_NAPOVED: { id: number; besedilo: React.ReactNode; vrsta: string }[] = [
  { id: 1, vrsta: "lasten model", besedilo: <>Model gremopogobe.si: parametri (okna dežja, vlage in temperature, sezonski faktorji, uspešnost razvrščanja) so v datoteki modela, izračunanem 22. 9. 2026 iz zapisov najdb od leta 2022. Računske primere v članku smo preverili z izvorno kodo indeksa. Metoda in omejitve: <Link href="/metodologija">Kako izračunamo</Link>.</> },
  { id: 2, vrsta: "vir podatkov, licenca CC BY 4.0", besedilo: <>Open-Meteo.com: padavine, temperatura zraka ter temperatura (6 cm) in vlaga tal (3 do 9 cm). Licenca preverjena 3. 11. 2026: »API data are offered under Attribution 4.0 International (CC BY 4.0)«. <a href="https://open-meteo.com/en/licence" rel="noopener">open-meteo.com</a></> },
  { id: 3, vrsta: "vir zapisov najdb", besedilo: <>GBIF (Global Biodiversity Information Facility): javni zapisi opažanj od leta 2022, iz katerih se je model naučil, skupaj z najdbami iz širše okolice. Zapis pomeni, da je nekdo vrsto opazil in vnesel, ne pa, da je bila košara polna. <a href="https://www.gbif.org/" rel="noopener">gbif.org</a></> },
  { id: 4, vrsta: "članek na tej strani", besedilo: <>Kdaj rastejo jurčki: zamik med dežjem in najdbami ter viri zanj. <Link href="/clanki/kdaj-rastejo-jurcki">gremopogobe.si/clanki</Link></> },
  { id: 5, vrsta: "uradni vir", besedilo: <>Ministrstvo za naravne vire in prostor: Nadzor nad nabiranjem gob (29. 9. 2026), omejitev 2 kg na osebo na dan. <a href="https://www.gov.si/novice/2026-09-29-nadzor-nad-nabiranjem-gob/" rel="noopener">gov.si</a></> },
];

const S = ({ n }: { n: number[] }) => <sup className="cl-vir">[{n.join(", ")}]</sup>;

export default function KakoBratiNapoved() {
  return (
    <>
      <p className="cl-uvod">
        Na zemljevidu vidiš številko, na primer 62. Je to dobro? Zakaj je v petek višja kot v ponedeljek? Ta vodič razloži, kaj številka pomeni,
        iz česa nastane in kako jo uporabiti za odločitev, kam in kdaj iti v gozd.
      </p>

      <h2>Najprej: kaj številka je in česa ni</h2>
      <p>
        Indeks ugodnosti razmer od 0 do 100 pove, <strong>kako dobro vreme zadnjih tednov ustreza razmeram, v katerih so ljudje v preteklosti pogosto našli to vrsto</strong><S n={[1]} />.
        Ni verjetnost, da boš gobe našel, in ni količina gob. Dan z indeksom 80 je v preteklosti pogosteje prinesel gobe kot dan z indeksom 30,
        za posamezno jaso pa ne pove nič.
      </p>
      <p>
        Najvišja možna ocena je <strong>90</strong>, ne 100: vse ocene namreč zaradi previdnosti znižamo za 10 %, ker model rad precenjuje razmere<S n={[1]} />.
        Če torej vidiš 85, je to skoraj vse, kar model sploh lahko pokaže.
      </p>

      <h2>Pet stopenj, pet barv</h2>
      <figure className="cl-figura">
        <LestvicaIndeksa />
        <figcaption>Lestvica indeksa. Na zemljevidu in v biltenu so barve enake.</figcaption>
      </figure>
      <ul>
        <li><strong>Slabo (0 do 19):</strong> vreme ne ustreza razmeram, v katerih so ljudje običajno našli vrsto.</li>
        <li><strong>Skromno (20 do 39):</strong> nekaj razmer je ugodnih, druge manjkajo.</li>
        <li><strong>Srednje (40 do 59):</strong> razmere so zmerne. Prava sestava gozda in višina lahko naredita razliko.</li>
        <li><strong>Dobro (60 do 79):</strong> večina razmer je ugodna.</li>
        <li><strong>Odlično (80 do 90):</strong> skoraj vse je na optimumu.</li>
      </ul>
      <p className="cl-opomba">Opisi stopenj so naš prevod številk v besede, ne izmerjena verjetnost najdbe.</p>

      <h2>Iz česa nastane številka</h2>
      <p>
        Indeks izračunamo za vsako vrsto posebej, iz štirih vremenskih vhodov, sezone in popravkov<S n={[1, 2]} />:
      </p>
      <p className="cl-formula">(0,6 × dež + 0,4 × vlaga) × temperatura tal × sezona × 0,9</p>
      <div className="cl-sestava">
        <div><b>Dež (60 % mokrega dela)</b><span>Vsota padavin v oknu 10 do 28 dni nazaj. Pod okoli 41 mm je ocena 0, pri okoli 95 mm in več je polna, vmes narašča premo.</span></div>
        <div><b>Vlaga tal (40 %)</b><span>Vlaga v sloju 3 do 9 cm. Pod 0,206 m³/m³ je ocena 0, pri 0,282 in več je polna.</span></div>
        <div><b>Temperatura tal</b><span>Povprečje zadnjih 5 dni na globini 6 cm. Vsaka vrsta ima okno, pri jurčku je ugodno med 11,5 in 19,1 °C, pod 7,1 in nad 21,3 °C pa je ocena 0.</span></div>
        <div><b>Sezona</b><span>Faktor po mesecih. Pri jurčku je september 0,94, oktober 0,97, november 0,26.</span></div>
        <div><b>Previdnost</b><span>Faktor 0,9, ki znižuje vse ocene.</span></div>
        <div><b>Vročinski popravek</b><span>Če je v zadnjih 5 dneh najvišja dnevna temperatura nad 27 °C in je padlo manj kot 5 mm dežja, se indeks pomnoži z 0,6.</span></div>
      </div>
      <p>
        Pri območjih na zemljevidu se nato upošteva še <strong>sestava gozda in nadmorska višina</strong>: faktor med 0,35 in 1 po tem, kako primeren je gozd in kako blizu optimuma je višina.
        Jurček ima višinski optimum med 250 in 1400 metri<S n={[1]} />.
      </p>

      <h2>Primer računa</h2>
      <p>
        Jurček, 15. oktober. V oknu 10 do 28 dni nazaj je padlo 70 mm dežja, vlaga tal je 0,25, temperatura tal 14 °C.
      </p>
      <ul>
        <li>Dež: (70 − 41,4) / (94,6 − 41,4) = 0,54</li>
        <li>Vlaga: (0,25 − 0,206) / (0,282 − 0,206) = 0,58</li>
        <li>Mokri del: 0,6 × 0,54 + 0,4 × 0,58 = 0,55</li>
        <li>Temperatura tal 14 °C je v ugodnem oknu: faktor 1. Sezona oktober: 0,97. Previdnost: 0,9.</li>
        <li>Indeks: 100 × 0,9 × 0,97 × 1 × 0,55 = <strong>48 (srednje)</strong></li>
      </ul>
      <p>Isti primer, če spremenimo eno stvar (izračunano z izvorno kodo indeksa, ena točka, jurček):</p>
      <div className="cl-tabela">
        <table>
          <thead><tr><th scope="col">Sprememba</th><th scope="col">Indeks</th></tr></thead>
          <tbody>
            <tr><td>Brez dežja v oknu</td><td>20</td></tr>
            <tr><td>Vlaga na pragu 0,206</td><td>28</td></tr>
            <tr><td>Vroč val (nad 27 °C), brez dežja zadnjih 5 dni</td><td>29</td></tr>
            <tr><td>Vse optimalno (95 mm, vlaga 0,282, tla 15 °C), oktober</td><td>87</td></tr>
            <tr><td>Isto, a v avgustu</td><td>90</td></tr>
            <tr><td>Isto, a v novembru</td><td>23</td></tr>
            <tr><td>Isto kot optimalno, a tla 22 °C</td><td>0</td></tr>
          </tbody>
        </table>
      </div>
      <p className="cl-opomba">To so računski primeri modela, ne napovedi za določen kraj.</p>

      <h2>Zakaj se številka čez teden malo spreminja</h2>
      <p>
        Dežni del indeksa gleda dež, ki je že padel, 10 do 28 dni nazaj. Ko premakneš dan za nekaj dni naprej, se okno premakne samo za toliko in ostane v preteklosti.
        Zato <strong>dež, ki bo padel to soboto, ne dvigne dežnega dela za to soboto</strong>. Napoved dežja v naslednjih 7 dneh vpliva le prek vlage tal in vročinskega popravka.
      </p>
      <figure className="cl-figura">
        <OknoDeza />
        <figcaption>Okno dežja za današnji dan in za dan čez 6 dni. Napoved (zeleno polje) vanj ne sega.</figcaption>
      </figure>
      <p>
        Hitreje se spreminjajo temperatura tal (5-dnevno povprečje), vlaga tal in vročinski popravek. Zato je indeks v naslednjem tednu običajno bolj miren kot vreme samo.
        Zakaj dež šteje z zamikom, je razloženo v članku <Link href="/clanki/kdaj-rastejo-jurcki">Kdaj rastejo jurčki</Link><S n={[4]} />.
      </p>

      <h2>Zakaj imajo območja različne številke</h2>
      <p>
        Izračun naredimo za 30 gozdnih območij in ga na zemljevidu razmažemo med točkami. Dve območji z enakim vremenom imata lahko različen indeks, ker ima eno več primernega gozda
        ali bolj ugodno višino<S n={[1]} />. Zato je pika na zemljevidu ocena za okolico, ne za mesto, kjer stojiš. Seznam »Najboljše za izbrani dan« na zemljevidu razvrsti območja od najvišjega indeksa navzdol.
      </p>

      <h2>Pet navad pri branju</h2>
      <ol>
        <li><strong>Gledaj barvo, ne decimalk.</strong> Razlika med 62 in 58 je znotraj napake modela. Razlika med »slabo« in »dobro« pa je pomembna.</li>
        <li><strong>Primerjaj med sabo.</strong> Najboljši dan in najboljše območje tega tedna povesta več kot posamezna številka.</li>
        <li><strong>Preveri, kaj je padlo zadnje 2 do 4 tedne.</strong> Napoved dežja za naprej indeksa ne dvigne.</li>
        <li><strong>Izberi vrsto.</strong> Vsaka ima svojo sezono in temperaturo: jurček je pri 11,5 do 19,1 °C tal, štorovka pri 8,8 do 12,2 °C<S n={[1]} />.</li>
        <li><strong>Primerjaj z najdbami.</strong> Na <Link href="/najdbe">zemljevidu najdb</Link> vidiš, kaj so ljudje res našli. Poročila indeksa ne spreminjajo, so pa dobra kontrola.</li>
      </ol>

      <h2>Kako dobra je napoved</h2>
      <p>
        Model smo preizkusili tako, da smo ga naučili na vseh letih razen enega in ga preverili na izpuščenem letu. Mera AUC pove, kako pogosto ima dan z najdbo višji indeks kot dan brez nje:
        0,5 je met kovanca, 1 je popolno razvrščanje. Pri jurčku je 0,71, pri lisički 0,66, pri marelah 0,72 in pri štorovki 0,88, pri tej na manjši množici (88 najdb)<S n={[1, 3]} />.
        To je <strong>zmerna</strong> napoved: pomaga pri odločitvi, kdaj in kam, ne obljublja najdbe.
      </p>

      <h2>Česa indeks ne zna</h2>
      <ul>
        <li>Ne ve, ali je gobe pred tabo že kdo pobral.</li>
        <li>Ne vidi mikrorastišč: pobočij, jas in robov gozda, ker računa za območje.</li>
        <li>Ne zazna lokalnih neviht, ki jih vremenski vir ni opazil.</li>
        <li>Ne pomaga pri določanju užitnosti. Za to obišči determinatorja v <Link href="/drustva">gobarskem društvu</Link>.</li>
      </ul>
      <p className="cl-okvir">
        Za lastne potrebe lahko na osebo na dan nabereš največ 2 kg gob<S n={[5]} />. Več o pravilih najdeš v <Link href="/vodic">vodiču</Link>.
        Preveri <Link href="/">napoved za tvoj vikend</Link>.
      </p>

      <section className="cl-viri" aria-labelledby="viri">
        <h2 id="viri">Viri in preverjanje</h2>
        <p className="cl-opomba">Članek je bil preverjen 3. 11. 2026. Številke o modelu so iz datoteke modela, računski primeri iz izvorne kode indeksa. Ob vsakem viru je zapisano, kako zanesljiv je.</p>
        <ol className="cl-viri-seznam">
          {VIRI_NAPOVED.map((v) => (
            <li key={v.id} id={`vir-${v.id}`}>{v.besedilo} <span className="cl-tip">({v.vrsta})</span></li>
          ))}
        </ol>
        <h3 className="cl-slike-naslov">Viri slik</h3>
        <p className="cl-opomba">Fotografija je z Wikimedia Commons. Ilustraciji sta delo gremopogobe.si.</p>
        <ol className="cl-viri-seznam">
          <li id="slika-1">Naslovna slika: Bernie, <a href="https://commons.wikimedia.org/wiki/File:AD2009Sep13_Boletus_edulis_01.jpg" rel="noopener">AD2009Sep13 Boletus edulis 01</a>, javna last. Pomanjšano in pretvorjeno v WebP.</li>
        </ol>
      </section>
    </>
  );
}
