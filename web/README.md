# gremopogobe.si - MVP

Next.js 15 (App Router), brez baze. Napoved se izračuna na strežniku iz Open-Meteo
in se prek ISR osveži vsake 3 ure (`revalidate = 10800`).

## Zagon
    npm install
    npm run dev          # http://localhost:3000

## Deploy na Vercel
    npx vercel           # ali poveži GitHub repo v Vercel dashboardu

Okoljske spremenljivke (neobvezno):
- `OPEN_METEO_API_KEY` - za komercialno rabo (glej spodaj)
- `OPEN_METEO_URL` - npr. https://customer-api.open-meteo.com/v1/forecast pri plačljivem paketu

## Struktura
- `data/tocke.json` - 30 gozdnih merilnih točk (ime, regija, koordinate). Dodajaš/popravljaš tukaj.
- `data/slovenija.json` - obris Slovenije (Natural Earth) in mreža pik za zemljevid.
- `lib/indeks.ts` - model indeksa (isti kot v `../gobji_indeks.py`). Parametri na vrhu datoteke.
- `lib/vrste.ts` - temperaturna okna in sezonski faktorji po vrstah, barvna lestvica.
- `lib/napoved.ts` - en klic na Open-Meteo za vse točke hkrati, pretvorba v dnevne vrednosti.
- `components/Raziskovalec.tsx` - interaktivni zemljevid (izbira vrste in dneva, IDW interpolacija med točkami).
- `app/regija/[slug]` - 30 statičnih strani regij (SEO: "gobe Pohorje" ...).
- `app/vodic` - pravila in sezonski koledar.

## Pomembno
- Brezplačni Open-Meteo API je samo za nekomercialno rabo. Ko stran monetiziraš
  (affiliate, oglasi), potrebuješ njihov plačljiv API paket.
- Atribucija Open-Meteo (CC BY 4.0) je v nogi strani - naj ostane.
- Pred objavo preveri besedilo pravil v `app/vodic/page.tsx` proti veljavni uredbi.
