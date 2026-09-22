#!/usr/bin/env python3
"""
Gobji indeks - prototip.

Za gozdne točke iz tocke.json potegne vreme z Open-Meteo (14 dni nazaj + 7 dni
naprej) in za vsak dan izračuna indeks rasti 0-100 za 4 vrste.

  python gobji_indeks.py                 # pravi podatki z Open-Meteo
  python gobji_indeks.py --vrsta jurcek  # samo ena vrsta
  python gobji_indeks.py --json out.json # shrani rezultat
  python gobji_indeks.py --demo          # sintetično vreme (brez interneta)

Brez zunanjih knjižnic (samo standardni Python 3.9+).
"""
import argparse, json, math, random, sys, urllib.parse, urllib.request
from datetime import date, timedelta
from pathlib import Path

API = "https://api.open-meteo.com/v1/forecast"
PAST_DAYS, FORECAST_DAYS = 14, 7

# Temperaturno okno tal [min, opt_od, opt_do, max] v °C in sezonski faktor po mesecih.
VRSTE = {
    "jurcek":   {"ime": "Jurček",   "temp": (8, 12, 18, 23),  "sezona": {6: .6, 7: .8, 8: .9, 9: 1, 10: .9, 11: .3}},
    "lisicka":  {"ime": "Lisička",  "temp": (10, 13, 20, 25), "sezona": {6: .8, 7: 1, 8: 1, 9: .9, 10: .6}},
    "marela":   {"ime": "Marela",   "temp": (10, 14, 21, 26), "sezona": {7: .7, 8: 1, 9: 1, 10: .7, 11: .2}},
    "storovka": {"ime": "Štorovka", "temp": (5, 9, 15, 19),   "sezona": {9: .7, 10: 1, 11: .9, 12: .3}},
}

# Parametri modela - te boš kalibriral s povratnimi informacijami "našel / nisem našel".
DEZ_ZAMIK = (5, 14)      # dnevi nazaj, ko dež najbolj šteje (micelij potrebuje ~teden)
DEZ_MIN, DEZ_OPT = 15, 50  # mm v oknu zamika: pod MIN nič, nad OPT polno
VLAGA_MIN, VLAGA_OPT = 0.15, 0.30  # m³/m³, sloj 3-9 cm
VROCINA_T, VROCINA_DEZ, VROCINA_KAZEN = 27, 5, 0.6

# Če obstaja model.json (izhod kalibracija.py), prepiše zgornje ročne vrednosti.
_mf = Path(__file__).parent / "model.json"
if _mf.exists():
    _m = json.loads(_mf.read_text(encoding="utf-8"))
    DEZ_ZAMIK = tuple(_m["dez_zamik"]); DEZ_MIN, DEZ_OPT = _m["dez_min"], _m["dez_opt"]
    VLAGA_MIN, VLAGA_OPT = _m["vlaga_min"], _m["vlaga_opt"]
    for _k, _v in _m["vrste"].items():
        VRSTE[_k]["temp"] = tuple(_v["temp"]); VRSTE[_k]["sezona"] = {int(a): b for a, b in _v["sezona"].items()}
PAST_DAYS = max(PAST_DAYS, DEZ_ZAMIK[1])


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def trapez(t, lo, o1, o2, hi):
    if t <= lo or t >= hi:
        return 0.0
    if t < o1:
        return (t - lo) / (o1 - lo)
    if t > o2:
        return (hi - t) / (hi - o2)
    return 1.0


def indeks_dan(d, i, vrsta):
    """d = dnevni podatki ene točke, i = indeks dneva v seznamu."""
    v = VRSTE[vrsta]
    a, b = DEZ_ZAMIK
    dez = sum(d["padavine"][max(0, i - b): max(0, i - a + 1)])
    s_dez = clamp((dez - DEZ_MIN) / (DEZ_OPT - DEZ_MIN))
    s_vlaga = clamp((d["vlaga_tal"][i] - VLAGA_MIN) / (VLAGA_OPT - VLAGA_MIN))
    okno = d["temp_tal"][max(0, i - 4): i + 1]
    s_temp = trapez(sum(okno) / len(okno), *v["temp"])
    mesec = date.fromisoformat(d["datum"][i]).month
    s_sez = v["sezona"].get(mesec, 0.0)
    kazen = 1.0
    if max(d["tmax"][max(0, i - 4): i + 1]) > VROCINA_T and sum(d["padavine"][max(0, i - 4): i + 1]) < VROCINA_DEZ:
        kazen = VROCINA_KAZEN
    val = 100 * s_sez * s_temp * (0.6 * s_dez + 0.4 * s_vlaga) * kazen
    return round(val), {"dez_mm": round(dez, 1), "vlaga": round(d["vlaga_tal"][i], 3),
                        "temp_tal": round(sum(okno) / len(okno), 1)}


def povpreci_po_dnevih(casi, vrednosti):
    dni = {}
    for t, v in zip(casi, vrednosti):
        if v is not None:
            dni.setdefault(t[:10], []).append(v)
    return {k: sum(x) / len(x) for k, x in dni.items()}


def pridobi_open_meteo(tocke):
    q = {
        "latitude": ",".join(str(t["lat"]) for t in tocke),
        "longitude": ",".join(str(t["lon"]) for t in tocke),
        "daily": "precipitation_sum,temperature_2m_max",
        "hourly": "soil_temperature_6cm,soil_moisture_3_to_9cm",
        "past_days": PAST_DAYS, "forecast_days": FORECAST_DAYS,
        "timezone": "Europe/Ljubljana",
    }
    url = API + "?" + urllib.parse.urlencode(q)
    with urllib.request.urlopen(url, timeout=30) as r:
        data = json.load(r)
    if isinstance(data, dict):
        data = [data]
    out = []
    for loc in data:
        dni = loc["daily"]["time"]
        st = povpreci_po_dnevih(loc["hourly"]["time"], loc["hourly"]["soil_temperature_6cm"])
        sm = povpreci_po_dnevih(loc["hourly"]["time"], loc["hourly"]["soil_moisture_3_to_9cm"])
        out.append({
            "datum": dni,
            "padavine": [p or 0.0 for p in loc["daily"]["precipitation_sum"]],
            "tmax": [t if t is not None else 20 for t in loc["daily"]["temperature_2m_max"]],
            "temp_tal": [st.get(x, 12.0) for x in dni],
            "vlaga_tal": [sm.get(x, 0.2) for x in dni],
            "visina": loc.get("elevation"),
        })
    return out


def demo_vreme(tocke):
    random.seed(1)
    danes = date.today()
    dni = [(danes + timedelta(days=k)).isoformat() for k in range(-PAST_DAYS, FORECAST_DAYS)]
    out = []
    for t in tocke:
        vlazno = 1.3 if t["lat"] < 45.9 else 1.0
        pad = [max(0, random.gauss(0, 4)) + (18 * vlazno if k in (4, 5) else 0) for k in range(len(dni))]
        tt = [17 - 0.18 * k - (t["lat"] - 45.5) * 1.5 + random.gauss(0, .4) for k in range(len(dni))]
        vl = [0.2 + 0.12 * math.exp(-max(0, k - 5) / 8) * (k >= 4) for k in range(len(dni))]
        out.append({"datum": dni, "padavine": pad, "tmax": [x + 6 for x in tt], "temp_tal": tt, "vlaga_tal": vl})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vrsta", choices=VRSTE, default=None)
    ap.add_argument("--json", help="shrani rezultat v datoteko")
    ap.add_argument("--demo", action="store_true", help="sintetično vreme brez interneta")
    args = ap.parse_args()

    tocke = json.loads((Path(__file__).parent / "tocke.json").read_text(encoding="utf-8"))
    vreme = demo_vreme(tocke) if args.demo else pridobi_open_meteo(tocke)
    danes = PAST_DAYS  # indeks današnjega dne v seznamu
    vrste = [args.vrsta] if args.vrsta else list(VRSTE)

    rezultat = []
    for t, d in zip(tocke, vreme):
        zapis = {**t, "dnevi": d["datum"][danes:], "indeks": {}, "gonila_danes": None}
        for vr in vrste:
            vals = [indeks_dan(d, i, vr) for i in range(danes, len(d["datum"]))]
            zapis["indeks"][vr] = [v for v, _ in vals]
            if zapis["gonila_danes"] is None:
                zapis["gonila_danes"] = vals[0][1]
        rezultat.append(zapis)

    vr = vrste[0]
    dnevi = rezultat[0]["dnevi"]
    glava = "".join(f"{date.fromisoformat(x).strftime('%d.%m'):>7}" for x in dnevi)
    print(f"\n{VRSTE[vr]['ime']} - indeks rasti 0-100" + ("  [DEMO PODATKI]" if args.demo else ""))
    print(f"{'Območje':<24}{glava}   dež 5-14d  tla °C  vlaga")
    for z in sorted(rezultat, key=lambda z: -max(z["indeks"][vr])):
        g = z["gonila_danes"]
        vrst = "".join(f"{v:>7}" for v in z["indeks"][vr])
        print(f"{z['ime']:<24}{vrst}   {g['dez_mm']:>7} mm  {g['temp_tal']:>6}  {g['vlaga']:.2f}")

    if args.json:
        Path(args.json).write_text(json.dumps(rezultat, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"\nShranjeno: {args.json}")


if __name__ == "__main__":
    main()
