#!/usr/bin/env python3
"""
Nadmorske višine za pike zemljevida (Open-Meteo Elevation API).
Poženeš enkrat: python3 visine.py  ->  ../web/data/visine.json

Višina se uporablja za omejitev po vrstah: marela recimo skoraj ne raste
nad 1200 m, jurček in štorovka pa segata višje.
"""
import json, time, urllib.parse, urllib.request
from pathlib import Path

TU = Path(__file__).parent
API = "https://api.open-meteo.com/v1/elevation"


def poskusi(url, poskusov=6):
    for k in range(poskusov):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 429 or k == poskusov - 1:
                raise
            cakaj = 20 * (k + 1)
            print(f"  omejitev dosežena, čakam {cakaj} s ...", flush=True)
            time.sleep(cakaj)
        except Exception:
            if k == poskusov - 1:
                raise
            time.sleep(5 * (k + 1))


def main():
    geo = json.loads((TU.parent / "web" / "data" / "slovenija.json").read_text())
    P = geo["proj"]
    tocke = [(round(P["lat1"] - y / P["ky"], 4), round(x / P["kx"] + P["lon0"], 4)) for x, y in geo["dots"]]
    delno = TU / "cache" / "visine_delno.json"
    delno.parent.mkdir(exist_ok=True)
    visine = json.loads(delno.read_text()) if delno.exists() else []
    if visine:
        print(f"Nadaljujem pri {len(visine)}/{len(tocke)} ...")
    else:
        print(f"Pobiram višine za {len(tocke)} pik ...")

    KOS = 50
    while len(visine) < len(tocke):
        kos = tocke[len(visine):len(visine) + KOS]
        q = urllib.parse.urlencode({"latitude": ",".join(str(a) for a, _ in kos),
                                    "longitude": ",".join(str(b) for _, b in kos)})
        visine += [round(v) for v in poskusi(f"{API}?{q}")["elevation"]]
        delno.write_text(json.dumps(visine))
        print(f"  {len(visine)}/{len(tocke)}", flush=True)
        time.sleep(3)  # prijazno do brezplačnega API-ja

    cilj = TU.parent / "web" / "data" / "visine.json"
    cilj.write_text(json.dumps(visine, separators=(",", ":")))
    delno.unlink(missing_ok=True)
    print(f"Shranjeno: {cilj} (najnižja {min(visine)} m, najvišja {max(visine)} m)")


if __name__ == "__main__":
    main()
