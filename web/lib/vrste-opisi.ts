import type { VrstaId } from "./vrste";

// Vsebina strani /vrste/[id]. Dvojnice so opisane previdno - stran ni določevalni ključ.
export type OpisVrste = {
  id: VrstaId;
  ime: string;
  latinsko: string;
  drugaImena: string[];
  kratko: string; // meta opis
  uvod: string;
  kjeRaste: string;
  kdaj: string;
  prepoznava: string[];
  dvojnice: { ime: string; latinsko: string; opis: string; nevarnost: "strupena" | "smrtno strupena" | "neužitna" }[];
  nasvet: string;
};

export const OPISI: OpisVrste[] = [
  {
    id: "jurcek",
    ime: "Jurček",
    latinsko: "Boletus edulis",
    drugaImena: ["goban", "smrekov jurček"],
    kratko: "Kdaj in kje rastejo jurčki v Sloveniji? Tedenska napoved rasti po območjih, vremenski pogoji, prepoznava in dvojnice.",
    uvod: "Jurček je najbolj iskana goba slovenskih gozdov. Pod imenom jurček gobarji nabirajo več sorodnih vrst gobanov, ki imajo vse čvrst bel bet, pod klobukom pa gobasto trosovnico namesto lističev.",
    kjeRaste: "Jurček živi v sožitju z drevesi, zato raste le v gozdu. Najpogosteje ga najdemo v smrekovih in mešanih gozdovih ter pod bukvijo, sorodni vrste pa tudi pod hrastom in borom. Rad ima zračne, ne pregoste sestoje z mahom ali nizko podrastjo.",
    kdaj: "Sezona traja od junija do oktobra, največ jih je praviloma septembra. Jurčki se množično pojavijo nekaj tednov po izdatnem dežju, ko so tla še topla, a se ponoči že hladijo.",
    prepoznava: [
      "Klobuk rjav, od svetlo lešnikovega do temno kostanjevega, na otip suh ali rahlo mastan.",
      "Pod klobukom gobasta trosovnica: pri mladih belkasta, pri starejših rumenkasto olivna.",
      "Bet debel, trebušast, z belo mrežico na zgornjem delu.",
      "Meso belo in ob prerezu ne spremeni barve.",
    ],
    dvojnice: [
      { ime: "Žolčasti goban", latinsko: "Tylopilus felleus", nevarnost: "neužitna", opis: "Zelo podoben, a izjemno grenak - ena goba pokvari celo jed. Trosovnica je rožnata, mrežica na betu temna." },
      { ime: "Vražji goban", latinsko: "Rubroboletus satanas", nevarnost: "strupena", opis: "Klobuk belkasto siv, trosovnica rdeča, bet z rdečo mrežico. Meso ob prerezu pomodri. Povzroča hude prebavne težave." },
    ],
    nasvet: "Jurčke vedno odrežemo z nožem in očistimo že v gozdu. Črvive in stare primerke pustimo, da trosijo naprej.",
  },
  {
    id: "lisicka",
    ime: "Lisička",
    latinsko: "Cantharellus cibarius",
    drugaImena: ["navadna lisička"],
    kratko: "Kdaj rastejo lisičke v Sloveniji? Napoved rasti po območjih, kje jih iskati, prepoznava in nevarne dvojnice.",
    uvod: "Lisička je rumena, dišeča goba, ki raste pogosto v skupinah. Ker jo črvi redko napadejo in jo je lepo videti v podrasti, je priljubljena tudi pri začetnikih - a ima dvojnice, na katere je treba paziti.",
    kjeRaste: "Raste v listnatih in iglastih gozdovih, najraje na kislih, zmerno vlažnih tleh pod smreko, bukvijo in hrastom. Pogosto jo najdemo ob gozdnih poteh in na mahovitih pobočjih.",
    kdaj: "Sezona se začne že junija in traja do oktobra, največ jih je poleti. Za razliko od jurčka lisička bolje prenaša toplejše vreme, potrebuje pa vlažna tla.",
    prepoznava: [
      "Cela goba je jajčno rumena do oranžna.",
      "Pod klobukom nima pravih lističev, ampak nizke, razvejane rebraste gube, ki se spuščajo na bet.",
      "Meso belkasto, čvrsto, z blagim sadnim vonjem po marelicah.",
      "Raste posamič ali v skupinah na tleh, ne na lesu.",
    ],
    dvojnice: [
      { ime: "Lažna lisička", latinsko: "Hygrophoropsis aurantiaca", nevarnost: "neužitna", opis: "Bolj oranžna, s pravimi, gostimi in razcepljenimi lističi. Raste pogosto na trhlem lesu ali iglicah. Ni vredna nabiranja." },
      { ime: "Oranžna goba v šopih na lesu", latinsko: "Omphalotus olearius", nevarnost: "strupena", opis: "Oranžna goba s pravimi lističi, ki raste v šopih na lesu ali koreninah listavcev. Povzroča hudo zastrupitev." },
    ],
    nasvet: "Lisičke se med prevozom rade zmečkajo, zato jih nosimo v plitvi košari. Pred pripravo jih ne namakamo, le očistimo s čopičem.",
  },
  {
    id: "marela",
    ime: "Marela",
    latinsko: "Macrolepiota procera",
    drugaImena: ["orjaški dežnik"],
    kratko: "Kdaj rastejo marele (orjaški dežnik) v Sloveniji? Napoved rasti, kje jih iskati, prepoznava in nevarne zamenjave.",
    uvod: "Marela ali orjaški dežnik je ena največjih užitnih gob pri nas - klobuk lahko meri več kot 30 cm. Zaradi velikosti in značilne oblike jo je težko zgrešiti, pri mladih primerkih pa je potrebna previdnost.",
    kjeRaste: "Raste na gozdnih robovih, jasah, travnikih ob gozdu in v svetlih, redkih gozdovih, pogosto pod borom. Za razliko od jurčka ne potrebuje gostega gozda.",
    kdaj: "Sezona traja od julija do oktobra, največ jih je avgusta in septembra.",
    prepoznava: [
      "Velik, sprva jajčast, nato razprt klobuk z rjavimi luskami na svetli podlagi.",
      "Bet visok, vitek, s kačasto rjavim vzorcem.",
      "Dvojni obroček, ki ga lahko premikamo gor in dol po betu.",
      "Bet se na dnu gomoljasto odebeli, a nima nožnice.",
    ],
    dvojnice: [
      { ime: "Mušnice", latinsko: "Amanita spp.", nevarnost: "smrtno strupena", opis: "Mlade, še zaprte marele je mogoče zamenjati z mušnicami. Mušnice imajo na dnu beta nožnico (ovojnico) in obroček, ki ga ni mogoče premikati. Nabiraj samo razprte, značilne primerke." },
      { ime: "Majhni dežniki", latinsko: "Lepiota spp.", nevarnost: "smrtno strupena", opis: "Drobne sorodne vrste s klobukom do nekaj centimetrov. Nekatere vsebujejo iste strupe kot zelena mušnica. Majhnih dežnikov nikoli ne nabiraj." },
    ],
    nasvet: "Uporabljamo samo klobuk, bet je trd in vlaknat. Klobuk je odličen ocvrt ali na žaru.",
  },
  {
    id: "storovka",
    ime: "Štorovka",
    latinsko: "Armillaria mellea",
    drugaImena: ["medena štorovka"],
    kratko: "Kdaj rastejo štorovke v Sloveniji? Jesenska napoved rasti po območjih, prepoznava, priprava in strupene dvojnice.",
    uvod: "Štorovka je jesenska goba, ki raste v velikih šopih na štorih in koreninah. Ko je sezona, jih je lahko ogromno, zato je priljubljena za vlaganje. Surova ali premalo kuhana je strupena.",
    kjeRaste: "Raste v šopih na štorih, podrtih deblih in koreninah listavcev in iglavcev, pogosto tudi na navidez golih tleh, kjer pod zemljo leži les. Pogosta je v hrastovih in bukovih gozdovih ter v sadovnjakih.",
    kdaj: "Klasična jesenska goba: od septembra do novembra, največ oktobra, ko se tla ohladijo.",
    prepoznava: [
      "Klobuk medeno rumen do rjav, z drobnimi temnejšimi luskicami na sredini.",
      "Lističi belkasti, pozneje rjavo pegasti.",
      "Na betu je izrazit bel obroček.",
      "Raste v gostih šopih, beti so na dnu zrasli.",
    ],
    dvojnice: [
      { ime: "Žveplenjača", latinsko: "Hypholoma fasciculare", nevarnost: "strupena", opis: "Raste v šopih na istih mestih. Klobuk žveplasto rumen, lističi zelenkasti, obročka nima. Meso je grenko." },
      { ime: "Drobna rjava goba na lesu", latinsko: "Galerina marginata", nevarnost: "smrtno strupena", opis: "Manjša rjava goba na lesu z obročkom, ki vsebuje iste strupe kot zelena mušnica. Raste lahko med štorovkami, zato vsako gobo v šopu preglej posebej." },
    ],
    nasvet: "Štorovke vedno dobro prekuhamo (vsaj 15 minut) in vodo zavržemo. Jemo samo mlade klobuke, bet je žilav.",
  },
];

export const opis = (id: string) => OPISI.find((o) => o.id === id) ?? null;
