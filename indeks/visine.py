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


def main():
    geo = json.loads((TU.parent / "web" / "data" / "slovenija.json").read_text())
    P = geo["proj"]
    tocke = [(round(P["lat1"] - y / P["ky"], 4), round(x / P["kx"] + P["lon0"], 4)) for x, y in geo["dots"]]
    print(f"Pobiram višine za {len(tocke)} pik ...")
    visine = []
    for i in range(0, len(tocke), 100):
        kos = tocke[i:i + 100]
        q = urllib.parse.urlencode({"latitude": ",".join(str(a) for a, _ in kos),
                                    "longitude": ",".join(str(b) for _, b in kos)})
        with urllib.request.urlopen(f"{API}?{q}", timeout=60) as r:
            visine += [round(v) for v in json.load(r)["elevation"]]
        print(f"  {min(i + 100, len(tocke))}/{len(tocke)}", flush=True)
        time.sleep(0.3)
    cilj = TU.parent / "web" / "data" / "visine.json"
    cilj.write_text(json.dumps(visine, separators=(",", ":")))
    print(f"Shranjeno: {cilj} (najnižja {min(visine)} m, najvišja {max(visine)} m)")


if __name__ == "__main__":
    main()
