#!/usr/bin/env python3
"""
Kalibracija gobjega indeksa na pravih najdbah (GBIF) in zgodovinskem vremenu (Open-Meteo).

Korak 1 - koliko je podatkov:
  python kalibracija.py --stej
  python kalibracija.py --stej --sirse   # tudi sosednji pasovi AT/IT/HR

Korak 2 - kalibracija (traja 5-20 min, odvisno od števila najdb; vreme se kešira v ./cache):
  python kalibracija.py

Rezultat: model.json (parametri za gobji_indeks.py in spletno stran) + poročilo v terminalu.

Pristop "isto mesto, drug dan": za vsako najdbo vzamemo 3 naključne dneve iste sezone na
isti lokaciji, kjer gobe niso bile najdene. Tako model primerja vreme ob najdbi z vremenom
na istem mestu ob drugih dneh - to izloči pristranskost, da ljudje poročajo le z znanih mest.
Brez zunanjih knjižnic (Python 3.9+).
"""
import argparse, json, math, random, sys, time, urllib.parse, urllib.request
from datetime import date, timedelta
from pathlib import Path

GBIF = "https://api.gbif.org/v1"
METEO = {
    # Enake spremenljivke kot jih uporablja napoved (tla 6 cm, vlaga 3-9 cm), podatki od 2022 naprej.
    "hf": ("https://historical-forecast-api.open-meteo.com/v1/forecast", "soil_temperature_6cm", "soil_moisture_3_to_9cm", 2022),
    # ERA5 reanaliza: daljša zgodovina (več najdb), a druga globina tal (0-7 cm).
    "era5": ("https://archive-api.open-meteo.com/v1/archive", "soil_temperature_0_to_7cm", "soil_moisture_0_to_7cm", 2010),
}
VRSTE = {
    "jurcek": ["Boletus edulis", "Boletus pinophilus", "Boletus reticulatus", "Boletus aereus"],
    "lisicka": ["Cantharellus cibarius", "Cantharellus pallens"],
    "marela": ["Macrolepiota procera"],
    "storovka": ["Armillaria mellea", "Armillaria ostoyae", "Armillaria gallica"],
}
# Trenutni (ročni) parametri - za primerjavo
STARI = {
    "dez_zamik": [5, 14], "dez_min": 15, "dez_opt": 50, "vlaga_min": 0.15, "vlaga_opt": 0.30,
    "vrste": {
        "jurcek": {"temp": [8, 12, 18, 23], "sezona": {6: .6, 7: .8, 8: .9, 9: 1, 10: .9, 11: .3}},
        "lisicka": {"temp": [10, 13, 20, 25], "sezona": {6: .8, 7: 1, 8: 1, 9: .9, 10: .6}},
        "marela": {"temp": [10, 14, 21, 26], "sezona": {7: .7, 8: 1, 9: 1, 10: .7, 11: .2}},
        "storovka": {"temp": [5, 9, 15, 19], "sezona": {9: .7, 10: 1, 11: .9, 12: .3}},
    },
}
CACHE = Path(__file__).parent / "cache"


def http_json(url, params, poskusi=4):
    u = url + "?" + urllib.parse.urlencode(params)
    for k in range(poskusi):
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "gremopogobe-kalibracija/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:
            if k == poskusi - 1:
                raise
            time.sleep(2 * (k + 1))


# ---------------- GBIF ----------------
def taxon_key(ime):
    r = http_json(f"{GBIF}/species/match", {"name": ime, "kingdom": "Fungi"})
    return r.get("usageKey") if r.get("matchType") != "NONE" else None


OBMOCJE = {"country": "SI"}  # --sirse zamenja z okvirjem okoli Slovenije
SIRSE = {"decimalLatitude": "45.0,47.3", "decimalLongitude": "12.8,17.2"}  # Furlanija, avstr. Koroška/Štajerska, Gorski kotar, Zagorje


def najdbe_gbif(ime, od_leta):
    key = taxon_key(ime)
    if not key:
        return []
    out, offset = [], 0
    while True:
        r = http_json(f"{GBIF}/occurrence/search", {
            "taxonKey": key, **OBMOCJE, "hasCoordinate": "true", "hasGeospatialIssue": "false",
            "year": f"{od_leta},{date.today().year}", "limit": 300, "offset": offset})
        for o in r["results"]:
            if not all(o.get(k) for k in ("year", "month", "day")):
                continue
            unc = o.get("coordinateUncertaintyInMeters")
            if unc and unc > 5000:
                continue
            out.append({"lat": round(o["decimalLatitude"], 3), "lon": round(o["decimalLongitude"], 3),
                        "datum": date(o["year"], o["month"], o["day"]).isoformat(), "vir": o.get("datasetName") or o.get("institutionCode") or "?"})
        offset += 300
        if r.get("endOfRecords") or offset >= r.get("count", 0):
            break
    return out


def vse_najdbe(od_leta):
    CACHE.mkdir(exist_ok=True)
    f = CACHE / f"gbif_{od_leta}_{'sirse' if OBMOCJE is SIRSE else 'si'}.json"
    if f.exists():
        return json.loads(f.read_text())
    res = {}
    for vr, imena in VRSTE.items():
        seen, lst = set(), []
        for ime in imena:
            for n in najdbe_gbif(ime, od_leta):
                k = (n["lat"], n["lon"], n["datum"])
                if k not in seen:
                    seen.add(k); lst.append(n)
        res[vr] = lst
        print(f"  {vr:<10} {len(lst):>5} najdb", flush=True)
    f.write_text(json.dumps(res))
    return res


# ---------------- Vreme ----------------
def vreme_leto(vir, lat, lon, leto):
    """Dnevne vrednosti za 1.5.-30.11. danega leta na lokaciji (zaokroženo na 0.1°, keširano)."""
    url, v_temp, v_vlaga, _ = METEO[vir]
    lat, lon = round(lat, 1), round(lon, 1)
    f = CACHE / f"{vir}_{lat}_{lon}_{leto}.json"
    if f.exists():
        return json.loads(f.read_text())
    konec = min(date(leto, 11, 30), date.today() - timedelta(days=2))
    r = http_json(url, {"latitude": lat, "longitude": lon, "start_date": f"{leto}-05-01", "end_date": konec.isoformat(),
                        "daily": "precipitation_sum,temperature_2m_max", "hourly": f"{v_temp},{v_vlaga}", "timezone": "Europe/Ljubljana"})
    dni = r["daily"]["time"]
    agg = {}
    for t, a, b in zip(r["hourly"]["time"], r["hourly"][v_temp], r["hourly"][v_vlaga]):
        d = agg.setdefault(t[:10], [[], []])
        if a is not None: d[0].append(a)
        if b is not None: d[1].append(b)
    povp = lambda x, fb: sum(x) / len(x) if x else fb
    out = {"datum": dni, "padavine": [p or 0 for p in r["daily"]["precipitation_sum"]],
           "tmax": [t if t is not None else 20 for t in r["daily"]["temperature_2m_max"]],
           "temp_tal": [povp(agg.get(d, [[], []])[0], None) for d in dni],
           "vlaga_tal": [povp(agg.get(d, [[], []])[1], None) for d in dni]}
    f.write_text(json.dumps(out))
    time.sleep(0.15)  # prijazno do brezplačnega API-ja
    return out


def gonila(w, datum, zamik):
    try:
        i = w["datum"].index(datum)
    except ValueError:
        return None
    a, b = zamik
    if i < b or w["temp_tal"][i] is None or w["vlaga_tal"][i] is None:
        return None
    okno = [x for x in w["temp_tal"][i - 4:i + 1] if x is not None]
    return {"dez": sum(w["padavine"][i - b:i - a + 1]), "temp": sum(okno) / len(okno), "vlaga": w["vlaga_tal"][i],
            "tmax5": max(w["tmax"][i - 4:i + 1]), "dez5": sum(w["padavine"][i - 4:i + 1]), "mesec": int(datum[5:7]), "leto": int(datum[:4])}


# ---------------- Model ----------------
def clamp(x): return max(0.0, min(1.0, x))
def trapez(t, lo, o1, o2, hi):
    if t <= lo or t >= hi: return 0.0
    if t < o1: return (t - lo) / (o1 - lo)
    if t > o2: return (hi - t) / (hi - o2)
    return 1.0


def indeks(g, p, vr):
    v = p["vrste"][vr]
    s_dez = clamp((g["dez"] - p["dez_min"]) / (p["dez_opt"] - p["dez_min"]))
    s_vl = clamp((g["vlaga"] - p["vlaga_min"]) / (p["vlaga_opt"] - p["vlaga_min"]))
    s_t = trapez(g["temp"], *v["temp"])
    s_s = v["sezona"].get(g["mesec"], v["sezona"].get(str(g["mesec"]), 0))
    kazen = 0.6 if g["tmax5"] > 27 and g["dez5"] < 5 else 1
    return 100 * s_s * s_t * (0.6 * s_dez + 0.4 * s_vl) * kazen


def auc(pos, neg):
    """Verjetnost, da ima naključna najdba višji indeks kot naključen dan brez najdbe (0.5 = naključno)."""
    if not pos or not neg: return float("nan")
    vse = sorted([(x, 1) for x in pos] + [(x, 0) for x in neg])
    rang, i = {}, 0
    rs = 0.0
    while i < len(vse):
        j = i
        while j < len(vse) and vse[j][0] == vse[i][0]: j += 1
        r = (i + j + 1) / 2
        rs += r * sum(1 for k in range(i, j) if vse[k][1] == 1)
        i = j
    return (rs - len(pos) * (len(pos) + 1) / 2) / (len(pos) * len(neg))


def kvantil(a, q):
    a = sorted(a)
    if not a: return float("nan")
    k = (len(a) - 1) * q
    f = math.floor(k)
    return a[f] + (a[min(f + 1, len(a) - 1)] - a[f]) * (k - f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stej", action="store_true", help="samo preštej najdbe v GBIF")
    ap.add_argument("--vir", choices=METEO, default="hf", help="hf = enake spremenljivke kot napoved (od 2022), era5 = daljša zgodovina")
    ap.add_argument("--sirse", action="store_true", help="najdbe tudi iz sosednjih pasov AT/IT/HR/HU s podobnim podnebjem")
    ap.add_argument("--ozadje", type=int, default=3, help="število naključnih dni brez najdbe na najdbo")
    args = ap.parse_args()
    od_leta = METEO[args.vir][3]
    random.seed(42)
    global OBMOCJE
    if args.sirse:
        OBMOCJE = SIRSE

    kje = "v Sloveniji in sosednjih pasovih" if args.sirse else "v Sloveniji"
    print(f"GBIF najdbe {kje} od {od_leta} (s koordinatami in točnim datumom):")
    najdbe = vse_najdbe(od_leta)
    if args.stej:
        for vr, lst in najdbe.items():
            meseci = {}
            for n in lst: meseci[int(n["datum"][5:7])] = meseci.get(int(n["datum"][5:7]), 0) + 1
            viri = {}
            for n in lst: viri[n["vir"]] = viri.get(n["vir"], 0) + 1
            print(f"\n{vr}: {len(lst)}  po mesecih: {dict(sorted(meseci.items()))}")
            for v, c in sorted(viri.items(), key=lambda x: -x[1])[:3]: print(f"   {c:>5}  {v}")
        return

    lokacije = {(round(n["lat"], 1), round(n["lon"], 1), int(n["datum"][:4])) for lst in najdbe.values() for n in lst
                if 5 <= int(n["datum"][5:7]) <= 11}
    print(f"\nVreme za {len(lokacije)} kombinacij lokacija/leto (keširano v {CACHE})...")
    for k, (la, lo, le) in enumerate(sorted(lokacije)):
        try: vreme_leto(args.vir, la, lo, le)
        except Exception as e: print(f"  napaka {la},{lo},{le}: {e}")
        if k % 100 == 0: print(f"  {k}/{len(lokacije)}", flush=True)

    # Surovi vzorci: (vreme, datum, je_najdba) - gonila izračunamo posebej za vsak zamik dežja
    surovi = {vr: [] for vr in VRSTE}
    for vr, lst in najdbe.items():
        for n in lst:
            le, me = int(n["datum"][:4]), int(n["datum"][5:7])
            if not 5 <= me <= 11: continue
            try: w = vreme_leto(args.vir, n["lat"], n["lon"], le)
            except Exception: continue
            surovi[vr].append((w, n["datum"], True))
            d0 = date.fromisoformat(n["datum"])
            for _ in range(args.ozadje):
                for _ in range(20):
                    d = date(le, 6, 1) + timedelta(days=random.randint(0, 182))
                    if abs((d - d0).days) > 10: break
                surovi[vr].append((w, d.isoformat(), False))

    def vzorci_za(zamik):
        out = {}
        for vr, lst in surovi.items():
            pos, neg = [], []
            for w, d, je in lst:
                g = gonila(w, d, zamik)
                if g: (pos if je else neg).append(g)
            out[vr] = {"pos": pos, "neg": neg}
        return out

    def fit(pos_po_vrstah, zamik):
        vse = [g for l in pos_po_vrstah.values() for g in l]
        p = {"dez_zamik": list(zamik),
             "dez_min": round(kvantil([g["dez"] for g in vse], .15), 1),
             "dez_opt": round(kvantil([g["dez"] for g in vse], .55), 1),
             "vlaga_min": round(kvantil([g["vlaga"] for g in vse], .10), 3),
             "vlaga_opt": round(kvantil([g["vlaga"] for g in vse], .50), 3), "vrste": {}}
        if p["dez_opt"] - p["dez_min"] < 5: p["dez_opt"] = p["dez_min"] + 5
        if p["vlaga_opt"] - p["vlaga_min"] < 0.02: p["vlaga_opt"] = round(p["vlaga_min"] + 0.02, 3)
        for vr in VRSTE:
            pos = pos_po_vrstah.get(vr, [])
            if len(pos) < 15:
                p["vrste"][vr] = STARI["vrste"][vr]; continue
            t = [g["temp"] for g in pos]
            okno = [round(kvantil(t, q), 1) for q in (.02, .2, .8, .98)]
            for i in range(1, 4):
                if okno[i] <= okno[i - 1]: okno[i] = round(okno[i - 1] + 0.5, 1)
            mes = {}
            for g in pos: mes[g["mesec"]] = mes.get(g["mesec"], 0) + 1
            mx = max(mes.values())
            p["vrste"][vr] = {"temp": okno, "sezona": {m: round(0.15 + 0.85 * c / mx, 2) for m, c in sorted(mes.items())
                                                        if c >= max(2, 0.03 * len(pos))}}
        return p

    def navzkrizno(vz, zamik):
        """Vsako leto enkrat izpustimo, model nastavimo na ostalih in ocenimo na izpuščenem. Vrne zbrane ocene."""
        leta = sorted({g["leto"] for v in vz.values() for g in v["pos"]})
        ocene = {vr: {"pos_st": [], "neg_st": [], "pos_nv": [], "neg_nv": []} for vr in VRSTE}
        for le in leta:
            p = fit({vr: [g for g in v["pos"] if g["leto"] != le] for vr, v in vz.items()}, zamik)
            st = dict(STARI, dez_zamik=list(zamik))
            for vr, v in vz.items():
                for g in v["pos"]:
                    if g["leto"] == le: ocene[vr]["pos_st"].append(indeks(g, st, vr)); ocene[vr]["pos_nv"].append(indeks(g, p, vr))
                for g in v["neg"]:
                    if g["leto"] == le: ocene[vr]["neg_st"].append(indeks(g, st, vr)); ocene[vr]["neg_nv"].append(indeks(g, p, vr))
        return {vr: (auc(o["pos_st"], o["neg_st"]), auc(o["pos_nv"], o["neg_nv"]), len(o["pos_nv"])) for vr, o in ocene.items()}

    ZAMIKI = [(3, 10), (5, 14), (7, 21), (10, 28)]
    print("\nIščem najboljši zamik dežja (navzkrižno preverjanje po letih)...")
    rezultati = {}
    for z in ZAMIKI:
        r = navzkrizno(vzorci_za(z), z)
        n_vs = sum(x[2] for x in r.values())
        povp = sum(x[1] * x[2] for x in r.values() if x[1] == x[1]) / max(1, n_vs)
        rezultati[z] = (povp, r)
        print(f"  dež {z[0]:>2}-{z[1]:<2} dni nazaj: povprečni AUC {povp:.3f}")
    zamik = max(rezultati, key=lambda z: rezultati[z][0])
    vzorci = vzorci_za(zamik)
    r = rezultati[zamik][1]
    if sum(len(v["pos"]) for v in vzorci.values()) < 30:
        print("\nPremalo najdb z vremenom za kalibracijo.")
        return
    nov = fit({vr: v["pos"] for vr, v in vzorci.items()}, zamik)
    nov["meta"] = {"vir": args.vir, "od_leta": od_leta, "sirse": bool(args.sirse), "ustvarjeno": date.today().isoformat(),
                   "n": {vr: len(v["pos"]) for vr, v in vzorci.items()},
                   "auc_cv": {vr: {"staro": round(x[0], 3), "novo": round(x[1], 3)} for vr, x in r.items()}}

    print("\n" + "=" * 78)
    print(f"Najboljši zamik: dež {zamik[0]}-{zamik[1]} dni nazaj. Navzkrižno preverjanje po letih:")
    print(f"{'vrsta':<10}{'najdb':>7}   {'temp tal: staro -> novo':<36}{'AUC staro':>10}{'novo':>7}")
    for vr in VRSTE:
        a_st, a_nv, n = r[vr]
        if len(vzorci[vr]["pos"]) < 15:
            print(f"{vr:<10}{n:>7}   premalo najdb - ostane ročna nastavitev"); continue
        print(f"{vr:<10}{n:>7}   {str(STARI['vrste'][vr]['temp']):<17}-> {str(nov['vrste'][vr]['temp']):<17}{a_st:>10.2f}{a_nv:>7.2f}")
    print(f"\nDež {zamik[0]}-{zamik[1]} dni: {STARI['dez_min']}-{STARI['dez_opt']} mm -> {nov['dez_min']}-{nov['dez_opt']} mm")
    print(f"Vlaga tal:    {STARI['vlaga_min']}-{STARI['vlaga_opt']} -> {nov['vlaga_min']}-{nov['vlaga_opt']} m³/m³")
    print("\nAUC: 0,5 = kot met kovanca, 0,7 = uporabno, 0,8+ = dobro. 'staro' = ročni parametri z najboljšim zamikom.")
    for vr in VRSTE:
        nov["vrste"][vr]["sezona"] = {str(k): v for k, v in nov["vrste"][vr]["sezona"].items()}
    Path("model.json").write_text(json.dumps(nov, ensure_ascii=False, indent=1))
    print("\nShranjeno: model.json -> kopiraj v web/data/model.json in commitaj.")


if __name__ == "__main__":
    main()
