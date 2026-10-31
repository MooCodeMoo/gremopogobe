import type { Metadata } from "next";
import { cookies } from "next/headers";
import { kv, kvNaVoljo } from "@/lib/kv";
import { PISKOTEK, jeAdmin, preberiStatistiko } from "@/lib/stat";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nadzorna plošča", robots: { index: false, follow: false } };

const VRSTE: Record<string, string> = { jurcek: "Jurček", lisicka: "Lisička", marela: "Marela", storovka: "Štorovka" };
const IME_DOGODKA: Record<string, string> = {
  vrsta: "Izbira vrste", dan: "Izbira dneva", predvajaj: "Predvajaj teden", najdba: "Prijava najdbe",
  kosara: "404: klik na košaro", spremljaj_dodaj: "Območje dodano med moja", spremljaj_odstrani: "Območje odstranjeno", prijava_bilten: "Prijava na bilten", obvestila_vklop: "Obvestila vklopljena", obvestila_izklop: "Obvestila izklopljena",
};
const CSS = `
.ad{max-width:1100px;margin:0 auto;padding:28px var(--rob,20px) 80px;font-family:var(--sans)}
.ad h1{font-family:var(--serif);font-size:34px;margin:0 0 4px}.ad h2{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--sivo);margin:30px 0 10px}
.ad .vrh{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.ad .plosca{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.ad .k{background:var(--povrsina);border:1px solid var(--crta);border-radius:14px;padding:14px 16px}.ad .k b{display:block;font-family:var(--serif);font-size:30px}.ad .k span{font-size:12px;color:var(--sivo)}
.ad .stolpci{display:flex;align-items:flex-end;gap:3px;height:120px;background:var(--povrsina);border:1px solid var(--crta);border-radius:14px;padding:12px}
.ad .stolpci i{flex:1;background:var(--gozd);border-radius:3px 3px 0 0;min-height:2px;position:relative}.ad .stolpci i.dan2{background:#B9C9BD}
.ad .dva{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px}
.ad table{width:100%;border-collapse:collapse;background:var(--povrsina);border:1px solid var(--crta);border-radius:14px;overflow:hidden;font-size:14px}
.ad td{padding:8px 12px;border-top:1px solid var(--crta)}.ad tr:first-child td{border-top:0}.ad td:last-child{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.ad .opomba{background:var(--povrsina);border:1px solid var(--crta);border-radius:12px;padding:10px 14px;margin-bottom:8px;font-size:14px}.ad .opomba small{color:var(--sivo);display:block;margin-bottom:2px}
.ad a.rez,.ad button.rez{font:inherit;font-size:13px;padding:6px 12px;border-radius:999px;border:1px solid var(--crta);background:var(--povrsina);color:var(--crnilo);text-decoration:none;cursor:pointer}.ad a.rez[aria-current]{background:var(--gozd);color:#fff;border-color:var(--gozd)}
.ad form.vstop{max-width:340px;margin:18vh auto;display:flex;flex-direction:column;gap:10px}.ad input{font:inherit;padding:12px 14px;border-radius:12px;border:1px solid var(--crta)}.ad .prazno{color:var(--sivo);font-size:14px}
`;

function Tabela({ vrstice, prazno = "Še ni podatkov." }: { vrstice: [string, number][]; prazno?: string }) {
  if (!vrstice.length) return <p className="prazno">{prazno}</p>;
  return <table><tbody>{vrstice.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>;
}
const razvrsti = (o: Record<string, number>, n = 12): [string, number][] => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);

export default async function Admin({ searchParams }: { searchParams: Promise<{ dni?: string; napaka?: string }> }) {
  const q = await searchParams;
  const jar = await cookies();

  if (!process.env.ADMIN_GESLO) return <main className="ad"><style>{CSS}</style><h1>Nadzorna plošča</h1><p>Dodaj spremenljivko <code>ADMIN_GESLO</code> v Vercel in ponovno objavi.</p></main>;
  if (!jeAdmin(jar.get(PISKOTEK)?.value)) {
    return (
      <main className="ad"><style>{CSS}</style>
        <form className="vstop" method="post" action="/api/admin/vstop">
          <h1>Vstop</h1>
          <input type="password" name="geslo" placeholder="Geslo" autoFocus autoComplete="current-password" />
          <button className="rez" type="submit">Vstopi</button>
          {q.napaka && <p className="prazno">{q.napaka === "veliko" ? "Preveč poskusov, poskusi čez 15 minut." : "Napačno geslo."}</p>}
        </form>
      </main>
    );
  }
  if (!kvNaVoljo) return <main className="ad"><style>{CSS}</style><h1>Nadzorna plošča</h1><p>Baza (KV) ni nastavljena.</p></main>;

  const dni = [7, 30, 90].includes(Number(q.dni)) ? Number(q.dni) : 30;
  const [s, zapisiSurovo, fotke, prijave, obvestila] = await Promise.all([
    preberiStatistiko(dni),
    kv.seznam("zapisi", 5000).catch(() => []),
    kv.seznam("fotke", 40).catch(() => []),
    kv.smembers("prijave").catch(() => []),
    kv.smembers("obvestila").catch(() => []),
  ]);

  const pv = s.poDnevih.reduce((a, d) => a + d.pv, 0);
  const uSkupaj = s.poDnevih.reduce((a, d) => a + d.u, 0); // seštevek dnevnih obiskovalcev
  const danes = s.poDnevih[s.poDnevih.length - 1];
  const max = Math.max(1, ...s.poDnevih.map((d) => d.pv));
  const naprave = s.naprave;
  const skupajNap = Math.max(1, (naprave.mobilno ?? 0) + (naprave.namizno ?? 0));

  const meja = Date.now() - dni * 864e5;
  const zapisi = zapisiSurovo.map((v) => { try { return JSON.parse(v) as { slug: string; vrsta: string; najdeno: boolean; ts: number }; } catch { return null; } }).filter((x): x is NonNullable<typeof x> => !!x && x.ts >= meja);
  const najdenih = zapisi.filter((z) => z.najdeno).length;
  const poVrsti: Record<string, number> = {}, poObmocju: Record<string, number> = {};
  for (const z of zapisi) { poVrsti[VRSTE[z.vrsta] ?? z.vrsta] = (poVrsti[VRSTE[z.vrsta] ?? z.vrsta] ?? 0) + 1; poObmocju[z.slug] = (poObmocju[z.slug] ?? 0) + 1; }
  const opombe = fotke.map((v) => { try { return JSON.parse(v) as { slug: string; vrsta: string; najdeno: boolean; opomba: string | null; url: string; datum: string }; } catch { return null; } }).filter((x): x is NonNullable<typeof x> => !!x);

  const dogodki = Object.entries(s.dogodki).reduce<Record<string, Record<string, number>>>((a, [k, v]) => {
    const [ime, ...ostalo] = k.split(":"); (a[ime] ??= {})[ostalo.join(":") || "-"] = v; return a;
  }, {});

  return (
    <main className="ad"><style>{CSS}</style>
      <div className="vrh">
        <div><h1>Nadzorna plošča</h1><span className="prazno">Brez piškotkov in brez shranjenih IP naslovov. Tvoji obiski se ne štejejo, dokler si prijavljen.</span></div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[7, 30, 90].map((n) => <a key={n} className="rez" href={`/admin?dni=${n}`} aria-current={n === dni ? "page" : undefined}>{n} dni</a>)}
          <form method="post" action="/api/admin/vstop"><input type="hidden" name="izhod" value="1" /><button className="rez" type="submit">Izpis</button></form>
        </div>
      </div>

      <h2>Pregled ({dni} dni)</h2>
      <div className="plosca">
        <div className="k"><b>{danes.pv}</b><span>ogledov danes ({danes.u} obiskovalcev)</span></div>
        <div className="k"><b>{pv}</b><span>ogledov strani</span></div>
        <div className="k"><b>{uSkupaj}</b><span>obiskov (dnevni obiskovalci)</span></div>
        <div className="k"><b>{Math.round(((naprave.mobilno ?? 0) / skupajNap) * 100)}%</b><span>z mobilnika</span></div>
        <div className="k"><b>{prijave.length}</b><span>naročnikov na bilten</span></div>
        <div className="k"><b>{obvestila.length}</b><span>naročnikov na obvestila</span></div>
      </div>

      <h2>Ogledi po dnevih</h2>
      <div className="stolpci" role="img" aria-label="Ogledi po dnevih">
        {s.poDnevih.map((d) => <i key={d.d} title={`${d.d}: ${d.pv} ogledov, ${d.u} obiskovalcev`} style={{ height: `${(d.pv / max) * 100}%` }} />)}
      </div>

      <div className="dva">
        <div><h2>Najbolj obiskane strani</h2><Tabela vrstice={razvrsti(s.poti, 15)} /></div>
        <div><h2>Od kod prihajajo</h2><Tabela vrstice={razvrsti(s.viri)} prazno="Še ni zunanjih virov." /></div>
      </div>

      <h2>Kaj klikajo</h2>
      <div className="dva">
        <div><Tabela vrstice={razvrsti(Object.fromEntries(Object.entries(dogodki).map(([k, v]) => [IME_DOGODKA[k] ?? k, Object.values(v).reduce((a, b) => a + b, 0)])))} prazno="Dogodki se začnejo beležiti po objavi." /></div>
        <div>
          {dogodki.vrsta && <><p className="prazno">Izbrana vrsta</p><Tabela vrstice={razvrsti(Object.fromEntries(Object.entries(dogodki.vrsta).map(([k, v]) => [VRSTE[k] ?? k, v])))} /></>}
          {dogodki.dan && <><p className="prazno" style={{ marginTop: 14 }}>Izbran dan (0 = privzeti, ob sobotah/vikendu)</p><Tabela vrstice={razvrsti(dogodki.dan)} /></>}
        </div>
      </div>

      <h2>Prijave najdb ({zapisi.length}, od tega {najdenih} "našel sem")</h2>
      <div className="dva">
        <div><Tabela vrstice={razvrsti(poVrsti)} prazno="Še ni prijav." /></div>
        <div><Tabela vrstice={razvrsti(poObmocju)} prazno="Še ni prijav." /></div>
      </div>

      <h2>Kaj so napisali (opombe ob fotografijah)</h2>
      {opombe.filter((o) => o.opomba).length === 0 && <p className="prazno">Še ni opomb.</p>}
      {opombe.filter((o) => o.opomba).slice(0, 30).map((o, i) => (
        <div className="opomba" key={i}><small>{o.datum} · {VRSTE[o.vrsta] ?? o.vrsta} · {o.slug} · {o.najdeno ? "našel" : "ni našel"}</small>{o.opomba}</div>
      ))}
    </main>
  );
}
