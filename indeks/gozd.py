#!/usr/bin/env python3
"""
Tip gozda iz sestojne karte Zavoda za gozdove Slovenije (javni WFS servis).

  python3 gozd.py --test     # en poskusni klic: preveri povezavo in imena polj
  python3 gozd.py            # vse: točke, pike zemljevida, najdbe, ozadje (10-20 min, kešira)

Kaj naredi:
 1. Za 30 točk napovedi in 1228 pik zemljevida ugotovi delež gozda in sestavo drevesnih vrst.
 2. Primerja sestavo gozda na mestih GBIF najdb v Sloveniji z naključnimi točkami po Sloveniji
    in iz tega za vsako vrsto gob izračuna, kateri gozdovi ji ustrezajo.
 3. Zapiše gozd.json -> kopiraj v web/data/gozd.json.

Potrebuje: cache/gbif_*.json iz kalibracija.py (za najdbe) in ../web/data/slovenija.json.
Brez zunanjih knjižnic.
"""
import argparse, json, math, random, re, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

WFS = "https://prostor.zgs.gov.si/geoserver/wfs"
TU = Path(__file__).parent
CACHE = TU / "cache"
SKUPINE = {  # ime skupine -> šifre skupin drevesnih vrst ZGS (lzskdvXX = delež v lesni zalogi)
    "smreka_jelka": ["11", "21"],
    "bor_macesen": ["30", "34", "39"],
    "bukev": ["41"],
    "hrast": ["50"],
    "listavci": ["60", "70", "80"],
}
IMENA_SK = list(SKUPINE)
VRSTE = ["jurcek", "lisicka", "marela", "storovka"]
_sloj = None


def http(params, poskusi=4):
    u = WFS + "?" + urllib.parse.urlencode(params)
    for k in range(poskusi):
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "gremopogobe-gozd/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception:
            if k == poskusi - 1:
                raise
            time.sleep(2 * (k + 1))


def sloj_sestoji():
    global _sloj
    if _sloj:
        return _sloj
    cap = http({"service": "WFS", "version": "1.0.0", "request": "GetCapabilities"}).decode("utf-8", "replace")
    imena = re.findall(r"<Name>([^<]+)</Name>", cap)
    kandidati = [n for n in imena if n.split(":")[-1].lower() == "sestoji"]
    if not kandidati:
        kandidati = [n for n in imena if "sestoj" in n.lower() and "drug" not in n.lower()]
    if not kandidati:
        sys.exit("Sloja 'sestoji' ni v WFS. Najdeni sloji: " + ", ".join(imena[:40]))
    _sloj = kandidati[0]
    return _sloj


def _v_obroču(x, y, obroc):
    c = False
    n = len(obroc)
    for i in range(n):
        x1, y1 = obroc[i][0], obroc[i][1]
        x2, y2 = obroc[(i + 1) % n][0], obroc[(i + 1) % n][1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def _vsebuje(geom, lon, lat):
    """Natančen test, ali točka leži v (Multi)Polygon geometriji (GeoJSON, EPSG:4326)."""
    if not geom:
        return False
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]] if geom["type"] == "Polygon" else []
    for poly in polys:
        if not poly:
            continue
        zunanji = poly[0]
        swap = zunanji and zunanji[0][0] > 40  # os lat/lon zamenjana
        x, y = (lat, lon) if swap else (lon, lat)
        if _v_obroču(x, y, zunanji) and not any(_v_obroču(x, y, luknja) for luknja in poly[1:]):
            return True
    return False


def sestava_v_tocki(lat, lon):
    """Sestava gozda v točki: None = ni gozda, sicer seznam deležev (0-1) po SKUPINE."""
    d = 0.0002  # ~20 m okvir za predizbor, nato natančen test v poligonu
    raw = http({"service": "WFS", "version": "1.0.0", "request": "GetFeature", "typeName": sloj_sestoji(),
                "outputFormat": "application/json", "srsName": "EPSG:4326", "maxFeatures": 30,
                "bbox": f"{lon - d},{lat - d},{lon + d},{lat + d},EPSG:4326"})
    feats = [f for f in json.loads(raw).get("features", []) if _vsebuje(f.get("geometry"), lon, lat)]
    if not feats:
        return None
    p = feats[0]["properties"]
    vals = []
    for sifre in SKUPINE.values():
        vals.append(sum(float(p.get(f"lzskdv{s}") or 0) for s in sifre))
    s = sum(vals)
    return [round(v / s, 3) for v in vals] if s > 0 else [0.2] * 5


class Kes:
    def __init__(self):
        CACHE.mkdir(exist_ok=True)
        self.f = CACHE / "zgs_tocke_v2.json"  # v2: natančen test v poligonu
        self.d = json.loads(self.f.read_text()) if self.f.exists() else {}
        self.nove = 0

    def get(self, lat, lon):
        k = f"{lat:.4f},{lon:.4f}"
        if k not in self.d:
            try:
                self.d[k] = sestava_v_tocki(lat, lon)
            except Exception as e:
                return "napaka"
            self.nove += 1
            if self.nove % 200 == 0:
                self.shrani()
        return self.d[k]

    def shrani(self):
        self.f.write_text(json.dumps(self.d))


def mnozicno(kes, tocke, opis):
    print(f"{opis}: {len(tocke)} poizvedb ...", flush=True)
    out = [None] * len(tocke)
    with ThreadPoolExecutor(6) as ex:
        for i, r in enumerate(ex.map(lambda t: kes.get(*t), tocke)):
            out[i] = r
            if (i + 1) % 500 == 0:
                print(f"  {i + 1}/{len(tocke)}", flush=True)
    kes.shrani()
    napake = sum(1 for r in out if r == "napaka")
    if napake:
        print(f"  {napake} poizvedb ni uspelo - poženi znova, uspešne so shranjene.")
    return [None if r == "napaka" else r for r in out]


def povzemi(rez):
    """Več vzorčnih točk -> (delež gozda, povprečna sestava ali None)."""
    ok = [r for r in rez if r is not None or True]
    gozd = [r for r in rez if r]
    frac = len(gozd) / max(1, len(rez))
    if not gozd:
        return round(frac, 2), None
    return round(frac, 2), [round(sum(g[i] for g in gozd) / len(gozd), 3) for i in range(5)]


def auc(pos, neg):
    if not pos or not neg:
        return float("nan")
    vse = sorted([(x, 1) for x in pos] + [(x, 0) for x in neg])
    rs, i = 0.0, 0
    while i < len(vse):
        j = i
        while j < len(vse) and vse[j][0] == vse[i][0]:
            j += 1
        rs += (i + j + 1) / 2 * sum(1 for k in range(i, j) if vse[k][1])
        i = j
    return (rs - len(pos) * (len(pos) + 1) / 2) / (len(pos) * len(neg))


def h_surov(frac, sestava, v):
    gozdni = sum(s * w for s, w in zip(sestava, v["utezi"])) if sestava else 0
    return frac * v["gozd"] * gozdni + (1 - frac) * v["negozd"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--test", action="store_true")
    ap.add_argument("--ozadje", type=int, default=1500, help="število naključnih točk po Sloveniji")
    args = ap.parse_args()
    random.seed(7)

    print("Sloj:", sloj_sestoji())
    if args.test:
        for ime, la, lo in [("Kočevski Rog", 45.68, 15.00), ("Pokljuka", 46.34, 13.93), ("Ljubljana center", 46.051, 14.506)]:
            print(f"  {ime:<18}", sestava_v_tocki(la, lo))
        raw = http({"service": "WFS", "version": "1.0.0", "request": "GetFeature", "typeName": sloj_sestoji(),
                    "outputFormat": "application/json", "maxFeatures": 1})
        print("  polja:", ", ".join(sorted(json.loads(raw)["features"][0]["properties"].keys())))
        print("\nČe sta Kočevski Rog in Pokljuka seznama številk, Ljubljana pa None, vse deluje.")
        return

    geo = json.loads((TU.parent / "web" / "data" / "slovenija.json").read_text())
    P = geo["proj"]
    inv = lambda x, y: (P["lat1"] - y / P["ky"], x / P["kx"] + P["lon0"])  # -> (lat, lon)
    proj = lambda lat, lon: ((lon - P["lon0"]) * P["kx"], (P["lat1"] - lat) * P["ky"])
    korak = 18 / 3  # tretjina razmika pik
    kes = Kes()

    # 1) pike zemljevida: 5 vzorcev na piko
    vz = []
    for x, y in geo["dots"]:
        for dx, dy in [(0, 0), (-korak, -korak), (korak, -korak), (-korak, korak), (korak, korak)]:
            vz.append(inv(x + dx, y + dy))
    r = mnozicno(kes, vz, "Pike zemljevida")
    pike = [povzemi(r[i * 5:(i + 1) * 5]) for i in range(len(geo["dots"]))]

    # 2) točke napovedi: 9 vzorcev v krogu ~1.5 km
    tocke = json.loads((TU / "tocke.json").read_text(encoding="utf-8"))
    vz = []
    for t in tocke:
        for dx in (-0.012, 0, 0.012):
            for dy in (-0.008, 0, 0.008):
                vz.append((t["lat"] + dy, t["lon"] + dx))
    r = mnozicno(kes, vz, "Točke napovedi")
    tocke_g = {t["slug"]: povzemi(r[i * 9:(i + 1) * 9]) for i, t in enumerate(tocke)}

    # 3) najdbe v Sloveniji (iz keša kalibracije)
    najdbe = {v: [] for v in VRSTE}
    for f in CACHE.glob("gbif_*.json"):
        for v, lst in json.loads(f.read_text()).items():
            najdbe[v] += [(n["lat"], n["lon"]) for n in lst]
    def v_sloveniji(lat, lon):
        x, y = proj(lat, lon)
        return any(abs(x - dx) < 12 and abs(y - dy) < 12 for dx, dy in geo["dots"])
    for v in VRSTE:
        najdbe[v] = sorted({(round(a, 4), round(b, 4)) for a, b in najdbe[v] if v_sloveniji(a, b)})
    vse_n = sorted({p for v in VRSTE for p in najdbe[v]})
    r = mnozicno(kes, vse_n, "Najdbe v Sloveniji")
    najdbe_r = dict(zip(vse_n, r))

    # 4) ozadje: naključne točke po Sloveniji
    vz = []
    for _ in range(args.ozadje):
        x, y = random.choice(geo["dots"])
        vz.append(inv(x + random.uniform(-9, 9), y + random.uniform(-9, 9)))
    ozadje = mnozicno(kes, vz, "Naključne točke (ozadje)")
    ozadje_gozd = [s for s in ozadje if s]
    bg_frac = len(ozadje_gozd) / max(1, len(ozadje))

    # 5) kalibracija habitata po vrstah
    print("\n" + "=" * 78)
    print(f"Ozadje: {len(ozadje)} točk, {bg_frac:.0%} v gozdu")
    print(f"{'vrsta':<10}{'najdb':>6}{'v gozdu':>9}   {'uteži ' + ' / '.join(s[:6] for s in IMENA_SK):<48}{'AUC':>6}")
    vrste_out = {}
    for v in VRSTE:
        pos = [najdbe_r[p] for p in najdbe[v] if p in najdbe_r]
        n = len(pos)
        pos_g = [s for s in pos if s]
        if n < 15:
            vrste_out[v] = {"utezi": [1] * 5, "gozd": 1, "negozd": 1, "uporabi": False, "n": n, "auc": None}
            print(f"{v:<10}{n:>6}   premalo najdb v Sloveniji - brez vpliva gozda")
            continue
        p_frac = len(pos_g) / n
        pos_mean = [sum(s[i] for s in pos_g) / max(1, len(pos_g)) for i in range(5)]
        bg_mean = [sum(s[i] for s in ozadje_gozd) / max(1, len(ozadje_gozd)) for i in range(5)]
        utezi = [round(min(3, max(0.3, (pm + .02) / (bm + .02))), 2) for pm, bm in zip(pos_mean, bg_mean)]
        par = {"utezi": utezi, "gozd": round(p_frac / max(.01, bg_frac), 3),
               "negozd": round((1 - p_frac) / max(.01, 1 - bg_frac), 3)}
        hp = [h_surov(1 if s else 0, s, par) for s in pos]
        hb = [h_surov(1 if s else 0, s, par) for s in ozadje]
        a = auc(hp, hb)
        hb_sorted = sorted(hb)
        par["norm"] = round(hb_sorted[int(.95 * (len(hb_sorted) - 1))] or 1, 3)
        par.update({"uporabi": a >= 0.58, "n": n, "auc": round(a, 3)})
        vrste_out[v] = par
        opomba = "" if par["uporabi"] else "  (prešibko - ne uporabim)"
        print(f"{v:<10}{n:>6}{p_frac:>9.0%}   {' / '.join(f'{u:>5}' for u in utezi):<48}{a:>6.2f}{opomba}")
    print("\nUteži >1: vrsta ima ta gozd raje od povprečja, <1: manj. AUC 0,5 = gozd ne pomaga.")
    print("Pozor: najdbe iz iNaturalist so pristranske k dostopnim gozdovom ob poteh, zato so uteži groba ocena.")

    out = {"skupine": IMENA_SK, "vrste": vrste_out,
           "tocke": {k: {"gozd": f, "sestava": s} for k, (f, s) in tocke_g.items()},
           "pike": [[f] + (s if s else []) for f, s in pike]}
    (TU / "gozd.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print("\nShranjeno: gozd.json -> kopiraj v web/data/gozd.json")


if __name__ == "__main__":
    main()
