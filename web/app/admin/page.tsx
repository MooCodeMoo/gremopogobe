import type { Metadata } from "next";
import { cookies } from "next/headers";
import { kv, kvNaVoljo } from "@/lib/kv";
import { PISKOTEK, jeAdmin, preberiStatistiko } from "@/lib/stat";
import { TOCKE } from "@/lib/napoved";
import type { Prijava } from "@/lib/prijave";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nadzorna plošča", robots: { index: false, follow: false } };

const VRSTE: Record<string, string> = { jurcek: "Jurček", lisicka: "Lisička", marela: "Marela", storovka: "Štorovka" };
const IME_DOGODKA: Record<string, string> = {
  vrsta: "Izbira vrste", dan: "Izbira dneva", predvajaj: "Predvajaj teden", najdba: "Prijava najdbe",
  kosara: "404: klik na košaro", spremljaj_dodaj: "Območje dodano med moja", spremljaj_odstrani: "Območje odstranjeno",
  prijava_bilten: "Prijava na bilten", obvestila_vklop: "Obvestila vklopljena", obvestila_izklop: "Obvestila izklopljena",
};
const POGLEDI = [["pregled", "Pregled"], ["promet", "Promet"], ["vsebina", "Vsebina"], ["narocniki", "Naročniki"], ["najdbe", "Najdbe"]] as const;
type Pogled = (typeof POGLEDI)[number][0];

const imeObmocja = (slug: string) => TOCKE.find((t) => t.slug === slug)?.ime ?? slug;
const krat = (d: string) => `${Number(d.slice(8, 10))}. ${Number(d.slice(5, 7))}.`;
const stevilo = (n: number) => n.toLocaleString("sl-SI");
const razvrsti = (o: Record<string, number>, n = 12): [string, number][] => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);

function skupinaStrani(pot: string) {
  if (pot === "/") return "Naslovnica";
  if (pot.startsWith("/regija/") || pot === "/regije") return "Regije";
  if (pot.startsWith("/vrste")) return "Vrste";
  if (pot.startsWith("/clanki")) return "Članki";
  if (pot.startsWith("/vodic")) return "Vodič";
  if (pot.startsWith("/najdbe")) return "Najdbe";
  return "Druge strani";
}

function Vrstice({ vrstice, prazno = "Še ni podatkov." }: { vrstice: [string, number][]; prazno?: string }) {
  if (!vrstice.length) return <p className="prazno" style={{ padding: "10px 14px" }}>{prazno}</p>;
  const max = Math.max(1, ...vrstice.map(([, v]) => v));
  return (
    <div className="vrstice">
      {vrstice.map(([k, v]) => (
        <div className="vr" key={k}><span className="bar" style={{ width: `${Math.max(3, (v / max) * 100)}%` }} /><span className="ime" title={k}>{k}</span><span className="st">{stevilo(v)}</span></div>
      ))}
    </div>
  );
}

function Razlika({ zdaj, prej }: { zdaj: number; prej: number | null }) {
  if (prej === null) return <span className="pod">primerjava ni na voljo</span>;
  if (prej === 0) return <span className="pod">brez primerjave</span>;
  const p = Math.round(((zdaj - prej) / prej) * 100);
  if (p === 0) return <span className="pod"><span className="enako">enako</span> kot prej</span>;
  return <span className="pod"><span className={p > 0 ? "gor" : "dol"}>{p > 0 ? "▲" : "▼"} {Math.abs(p)} %</span> glede na prejšnje obdobje</span>;
}

function Kartica({ ime, vrednost, pod }: { ime: string; vrednost: React.ReactNode; pod: React.ReactNode }) {
  return <div className="kartica"><span className="ime">{ime}</span><b>{vrednost}</b>{pod}</div>;
}

function Graf({ dnevi }: { dnevi: { d: string; pv: number; u: number }[] }) {
  const W = 820, H = 230, L = 36, D = 12, T = 12, B = 28;
  const max = Math.max(5, ...dnevi.map((d) => d.pv));
  const lepMax = Math.ceil(max / 5) * 5;
  const x = (i: number) => L + (dnevi.length === 1 ? 0 : (i / (dnevi.length - 1)) * (W - L - D));
  const y = (v: number) => T + (1 - v / lepMax) * (H - T - B);
  const crta = (k: "pv" | "u") => dnevi.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join(" ");
  const obmocje = `${crta("pv")} L${x(dnevi.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const korak = Math.max(1, Math.ceil(dnevi.length / 8));
  const sirina = (W - L - D) / Math.max(1, dnevi.length - 1);
  return (
    <svg className="graf" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ogledi in obiskovalci po dnevih">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}><line className="mreza" x1={L} x2={W - D} y1={y(lepMax * f)} y2={y(lepMax * f)} /><text x={L - 6} y={y(lepMax * f) + 4} textAnchor="end">{Math.round(lepMax * f)}</text></g>
      ))}
      <path d={obmocje} fill="#0F3320" opacity=".09" />
      <path d={crta("pv")} fill="none" stroke="#0F3320" strokeWidth="2.2" strokeLinejoin="round" />
      <path d={crta("u")} fill="none" stroke="#8A3A1C" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
      {dnevi.map((d, i) => (
        <g key={d.d}>
          {i % korak === 0 && <text x={x(i)} y={H - 8} textAnchor="middle">{krat(d.d)}</text>}
          <rect className="vroc" x={x(i) - sirina / 2} y={T} width={sirina} height={H - T - B}><title>{`${krat(d.d)}: ${d.pv} ogledov, ${d.u} obiskovalcev`}</title></rect>
        </g>
      ))}
      <circle cx={x(dnevi.length - 1)} cy={y(dnevi[dnevi.length - 1].pv)} r="4" fill="#0F3320" />
    </svg>
  );
}

function Okvir({ naslov, desno, children }: { naslov: string; desno?: React.ReactNode; children: React.ReactNode }) {
  return <section className="okvir"><div className="okvir-glava"><h2 style={{ margin: 0 }}>{naslov}</h2>{desno}</div>{children}</section>;
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ dni?: string; napaka?: string; pogled?: string }> }) {
  const q = await searchParams;
  const jar = await cookies();

  if (!process.env.ADMIN_GESLO) return <main className="ad"><h1>Nadzorna plošča</h1><p>Dodaj spremenljivko <code>ADMIN_GESLO</code> v Vercel in ponovno objavi.</p></main>;
  if (!jeAdmin(jar.get(PISKOTEK)?.value)) {
    return (
      <main className="ad">
        <form className="vstop" method="post" action="/api/admin/vstop">
          <h1>Vstop</h1>
          <input type="password" name="geslo" placeholder="Geslo" autoFocus autoComplete="current-password" />
          <button className="rez" type="submit">Vstopi</button>
          {q.napaka && <p className="prazno">{q.napaka === "veliko" ? "Preveč poskusov, poskusi čez 15 minut." : "Napačno geslo."}</p>}
        </form>
      </main>
    );
  }
  if (!kvNaVoljo) return <main className="ad"><h1>Nadzorna plošča</h1><p>Baza (KV) ni nastavljena.</p></main>;

  const dni = [7, 30, 90].includes(Number(q.dni)) ? Number(q.dni) : 30;
  const pogled: Pogled = POGLEDI.some(([id]) => id === q.pogled) ? (q.pogled as Pogled) : "pregled";
  const povezava = (p: Pogled, d = dni) => `/admin?pogled=${p}&dni=${d}`;
  const primerjava = dni * 2 <= 120; // podatke hranimo 120 dni

  const [s, prej, zapisiSurovo, fotke, idPrijav, obvestila] = await Promise.all([
    preberiStatistiko(dni),
    primerjava ? preberiStatistiko(dni, dni) : Promise.resolve(null),
    kv.seznam("zapisi", 5000).catch(() => []),
    kv.seznam("fotke", 40).catch(() => []),
    kv.smembers("prijave").catch(() => [] as string[]),
    kv.smembers("obvestila").catch(() => [] as string[]),
  ]);
  const prijavaSurovo = await kv.mget(idPrijav.map((id) => `p:${id}`)).catch(() => [] as (string | null)[]);
  const prijave = prijavaSurovo.map((v, i) => { try { return v ? { id: idPrijav[i], ...(JSON.parse(v) as Prijava) } : null; } catch { return null; } }).filter((x): x is Prijava & { id: string } => x !== null);
  const potrjeni = prijave.filter((p) => p.potrjen);
  const cakajo = prijave.length - potrjeni.length;

  const pv = s.poDnevih.reduce((a, d) => a + d.pv, 0);
  const u = s.poDnevih.reduce((a, d) => a + d.u, 0);
  const pvPrej = prej ? prej.poDnevih.reduce((a, d) => a + d.pv, 0) : null;
  const uPrej = prej ? prej.poDnevih.reduce((a, d) => a + d.u, 0) : null;
  const danes = s.poDnevih[s.poDnevih.length - 1];
  const mobilno = s.naprave.mobilno ?? 0, namizno = s.naprave.namizno ?? 0;
  const skupajNap = Math.max(1, mobilno + namizno);
  const delezMobilno = Math.round((mobilno / skupajNap) * 100);

  const meja = Date.now() - dni * 864e5;
  const zapisi = zapisiSurovo.map((v) => { try { return JSON.parse(v) as { slug: string; vrsta: string; najdeno: boolean; ts: number }; } catch { return null; } }).filter((x): x is { slug: string; vrsta: string; najdeno: boolean; ts: number } => x !== null && x.ts >= meja);
  const najdenih = zapisi.filter((z) => z.najdeno).length;
  const poVrsti: Record<string, number> = {}, poObmocju: Record<string, number> = {};
  for (const z of zapisi) { const v = VRSTE[z.vrsta] ?? z.vrsta; poVrsti[v] = (poVrsti[v] ?? 0) + 1; const o = imeObmocja(z.slug); poObmocju[o] = (poObmocju[o] ?? 0) + 1; }
  const opombe = fotke.map((v) => { try { return JSON.parse(v) as { slug: string; vrsta: string; najdeno: boolean; opomba: string | null; url: string; datum: string }; } catch { return null; } }).filter((x): x is { slug: string; vrsta: string; najdeno: boolean; opomba: string | null; url: string; datum: string } => x !== null);

  const dogodki = Object.entries(s.dogodki).reduce<Record<string, Record<string, number>>>((a, [k, v]) => {
    const [ime, ...ostalo] = k.split(":"); (a[ime] ??= {})[ostalo.join(":") || "-"] = v; return a;
  }, {});
  const dogodkiSkupaj = Object.fromEntries(Object.entries(dogodki).map(([k, v]) => [IME_DOGODKA[k] ?? k, Object.values(v).reduce((a, b) => a + b, 0)]));
  const skupine: Record<string, number> = {};
  for (const [pot, n] of Object.entries(s.poti)) { const g = skupinaStrani(pot); skupine[g] = (skupine[g] ?? 0) + n; }

  const obmocjaNarocnikov: Record<string, number> = {};
  for (const p of potrjeni) for (const o of p.obmocja.length ? p.obmocja : ["vsa območja"]) { const i = o === "vsa območja" ? o : imeObmocja(o); obmocjaNarocnikov[i] = (obmocjaNarocnikov[i] ?? 0) + 1; }
  const poDnevihPrijav: Record<string, number> = {};
  for (const p of prijave) { const d = (p.ustvarjen ?? "").slice(0, 10); if (d) poDnevihPrijav[d] = (poDnevihPrijav[d] ?? 0) + 1; }
  const novihPrijav = prijave.filter((p) => p.ustvarjen && new Date(p.ustvarjen).getTime() >= meja).length;

  return (
    <main className="ad">
      <div className="vrh">
        <div><h1>Nadzorna plošča</h1><small>Brez piškotkov in brez shranjenih IP naslovov. Tvoji obiski se ne štejejo, dokler si prijavljen.</small></div>
        <div className="orodja">
          <div className="skupina" aria-label="Obdobje">
            {[7, 30, 90].map((n) => <a key={n} href={povezava(pogled, n)} aria-current={n === dni ? "page" : undefined}>{n} dni</a>)}
          </div>
          <form method="post" action="/api/admin/vstop"><input type="hidden" name="izhod" value="1" /><button className="rez" type="submit">Izpis</button></form>
        </div>
      </div>

      <nav className="zavihki" aria-label="Pogledi">
        {POGLEDI.map(([id, ime]) => (
          <a key={id} href={povezava(id)} aria-current={id === pogled ? "page" : undefined}>
            {ime}{id === "narocniki" && <span className="st">{potrjeni.length}</span>}{id === "najdbe" && <span className="st">{zapisi.length}</span>}
          </a>
        ))}
      </nav>

      {pogled === "pregled" && (
        <>
          <div className="kpi">
            <Kartica ime="Ogledi strani" vrednost={stevilo(pv)} pod={<Razlika zdaj={pv} prej={pvPrej} />} />
            <Kartica ime="Obiski (dnevni obiskovalci)" vrednost={stevilo(u)} pod={<Razlika zdaj={u} prej={uPrej} />} />
            <Kartica ime="Danes" vrednost={stevilo(danes.pv)} pod={<span className="pod">ogledov, {danes.u} obiskovalcev</span>} />
            <Kartica ime="Z mobilnika" vrednost={`${delezMobilno} %`} pod={<span className="pod">{stevilo(mobilno)} mobilnih, {stevilo(namizno)} namiznih</span>} />
            <Kartica ime="Naročniki na bilten" vrednost={potrjeni.length} pod={<span className="pod">{cakajo > 0 ? `${cakajo} še čaka na potrditev` : "vsi potrjeni"}</span>} />
            <Kartica ime="Prijave najdb" vrednost={zapisi.length} pod={<span className="pod">od tega {najdenih} »našel sem«</span>} />
          </div>
          <Okvir naslov="Ogledi po dnevih" desno={<div className="legenda"><span><i style={{ background: "#0F3320" }} />Ogledi</span><span><i style={{ background: "#8A3A1C" }} />Obiskovalci</span></div>}>
            <Graf dnevi={s.poDnevih} />
          </Okvir>
          <div className="mreza2">
            <section><h2>Najbolj obiskane strani</h2><Vrstice vrstice={razvrsti(s.poti, 6)} /></section>
            <section><h2>Od kod prihajajo</h2><Vrstice vrstice={razvrsti(s.viri, 6)} prazno="Še ni zunanjih virov." /></section>
          </div>
        </>
      )}

      {pogled === "promet" && (
        <>
          <Okvir naslov={`Ogledi po dnevih (${dni} dni)`} desno={<div className="legenda"><span><i style={{ background: "#0F3320" }} />Ogledi</span><span><i style={{ background: "#8A3A1C" }} />Obiskovalci</span></div>}>
            <Graf dnevi={s.poDnevih} />
          </Okvir>
          <div className="mreza2">
            <section><h2>Strani</h2><Vrstice vrstice={razvrsti(s.poti, 20)} /></section>
            <section><h2>Viri obiskov</h2><Vrstice vrstice={razvrsti(s.viri, 20)} prazno="Še ni zunanjih virov." /></section>
          </div>
          <section className="okvir">
            <h2>Naprave</h2>
            <div className="naprave" role="img" aria-label="Delež mobilnih in namiznih"><i style={{ width: `${delezMobilno}%` }} /><i style={{ width: `${100 - delezMobilno}%` }} /></div>
            <div className="legenda"><span><i style={{ background: "#0F3320" }} />Mobilno {delezMobilno} %</span><span><i style={{ background: "#B9C9BD" }} />Namizno {100 - delezMobilno} %</span></div>
          </section>
        </>
      )}

      {pogled === "vsebina" && (
        <>
          <div className="mreza2">
            <section><h2>Po delih strani</h2><Vrstice vrstice={razvrsti(skupine)} /></section>
            <section><h2>Kaj klikajo</h2><Vrstice vrstice={razvrsti(dogodkiSkupaj)} prazno="Dogodki se začnejo beležiti ob prvem kliku." /></section>
          </div>
          <div className="mreza2">
            <section><h2>Izbrana vrsta</h2><Vrstice vrstice={razvrsti(Object.fromEntries(Object.entries(dogodki.vrsta ?? {}).map(([k, v]) => [VRSTE[k] ?? k, v])))} /></section>
            <section><h2>Izbran dan (0 = privzeti)</h2><Vrstice vrstice={razvrsti(dogodki.dan ?? {})} /></section>
          </div>
        </>
      )}

      {pogled === "narocniki" && (
        <>
          <div className="kpi">
            <Kartica ime="Potrjeni na bilten" vrednost={potrjeni.length} pod={<span className="pod">prejmejo bilten vsak četrtek</span>} />
            <Kartica ime="Čakajo na potrditev" vrednost={cakajo} pod={<span className="pod">prijavljeni, a niso kliknili povezave</span>} />
            <Kartica ime={`Novih prijav (${dni} dni)`} vrednost={novihPrijav} pod={<span className="pod">potrjenih in nepotrjenih</span>} />
            <Kartica ime="Obvestila" vrednost={obvestila.length} pod={<span className="pod">naročniki na obvestila</span>} />
          </div>
          <div className="mreza2">
            <section><h2>Izbrana območja (potrjeni)</h2><Vrstice vrstice={razvrsti(obmocjaNarocnikov)} prazno="Še ni potrjenih naročnikov." /></section>
            <section><h2>Prijave po dnevih</h2><Vrstice vrstice={Object.entries(poDnevihPrijav).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10).map(([d, n]) => [krat(d), n] as [string, number])} prazno="Še ni prijav." /></section>
          </div>
          <h2>Vsi prijavljeni</h2>
          <div className="tabela-okvir">
            {prijave.length === 0 ? <p className="prazno" style={{ padding: 16 }}>Še ni prijav.</p> : (
              <table className="t">
                <thead><tr><th>E-pošta</th><th>Stanje</th><th>Območja</th><th>Prijava</th></tr></thead>
                <tbody>
                  {[...prijave].sort((a, b) => (b.ustvarjen ?? "").localeCompare(a.ustvarjen ?? "")).map((p) => (
                    <tr key={p.id}>
                      <td>{p.email}</td>
                      <td><span className={`znacka ${p.potrjen ? "ok" : "cakajo"}`}>{p.potrjen ? "potrjen" : "čaka"}</span></td>
                      <td>{p.obmocja.length ? p.obmocja.map(imeObmocja).join(", ") : "vsa"}</td>
                      <td>{p.ustvarjen ? krat(p.ustvarjen.slice(0, 10)) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {pogled === "najdbe" && (
        <>
          <div className="kpi">
            <Kartica ime={`Prijave najdb (${dni} dni)`} vrednost={zapisi.length} pod={<span className="pod">od tega {najdenih} »našel sem«</span>} />
            <Kartica ime="Delež uspešnih" vrednost={zapisi.length ? `${Math.round((najdenih / zapisi.length) * 100)} %` : "-"} pod={<span className="pod">»našel sem« od vseh prijav</span>} />
          </div>
          <div className="mreza2">
            <section><h2>Po vrstah</h2><Vrstice vrstice={razvrsti(poVrsti)} prazno="Še ni prijav." /></section>
            <section><h2>Po območjih</h2><Vrstice vrstice={razvrsti(poObmocju)} prazno="Še ni prijav." /></section>
          </div>
          <h2>Zadnje opombe in fotografije</h2>
          {opombe.length === 0 ? <p className="prazno">Še ni opomb.</p> : (
            <div className="opombe">
              {opombe.slice(0, 30).map((o, i) => (
                <div className="opomba" key={i}>
                  {o.url && /^https?:/.test(o.url) && <img src={o.url} alt="" loading="lazy" />}
                  <small>{o.datum} · {VRSTE[o.vrsta] ?? o.vrsta} · {imeObmocja(o.slug)} · {o.najdeno ? "našel" : "ni našel"}</small>
                  {o.opomba || <span className="prazno">Brez opombe</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
