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

## E-poštni bilten (četrtek zjutraj)

1. Resend: ustvari račun, dodaj domeno gremopogobe.si in vpiši prikazane DNS zapise (SPF, DKIM, DMARC) v Vercel DNS.
2. V Vercelu nastavi spremenljivke:
   - `RESEND_API_KEY` - ključ iz Resenda
   - `POSILJATELJ` - npr. `Gremo po gobe <napoved@gremopogobe.si>`
   - `CRON_SECRET` - poljubno geslo; Vercel ga sam pošlje cron zahtevi
   - `ODGOVOR_NA` (neobvezno) - naslov, kamor gredo odgovori uporabnikov
3. `vercel.json` sproži `/api/cron/bilten` vsak četrtek ob 5:00 UTC (7:00 po naše).
   Ročno ga lahko poženeš z: `curl -H "Authorization: Bearer <CRON_SECRET>" https://gremopogobe.si/api/cron/bilten`

Naročniki so v isti Redis bazi. Prijava zahteva potrditev prek e-pošte (dvojna privolitev),
odjava deluje z enim klikom tudi prek glave List-Unsubscribe.

## Potisna obvestila

1. Ustvari ključa VAPID (enkrat): `npx web-push generate-vapid-keys`
2. V Vercel dodaj spremenljivke:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - javni ključ (vidi ga brskalnik)
   - `VAPID_PRIVATE_KEY` - zasebni ključ
   - `VAPID_KONTAKT` (neobvezno) - `mailto:info@gremopogobe.si`
3. Cron `/api/cron/obvestila` teče vsak dan ob 6:00 UTC in obvesti tistega,
   pri katerem je indeks za njegova območja v naslednjih 3 dneh presegel izbrano mejo.
   Za isto območje in vrsto obvesti največ enkrat na 5 dni.
4. Na iPhonu obvestila delujejo samo, če je stran dodana na začetni zaslon.

Ročni preizkus: `curl -H "Authorization: Bearer <CRON_SECRET>" https://gremopogobe.si/api/cron/obvestila`

## Fotografije ob poročilih

Uporablja Vercel Blob za shranjevanje slik. Fotografija gre naravnost iz brskalnika v
shrambo (app/api/najdba/zeton izda kratkotrajen žeton), mimo strežniške funkcije, ki
ima za telo zahteve trdo omejitev okoli 4,5 MB - prava telefonska fotografija bi jo
zlahka presegla.

1. Vercel → projekt → zavihek **Storage** → **Create Database** → **Blob**.
2. Poveži z okoljema Production in Preview - spremenljivka `BLOB_READ_WRITE_TOKEN` se doda sama.
3. Redeploy, da jo build dobi.

Brez tega gumba za najdbe delujejo naprej (besedilo, brez fotografije), le nalaganje slike
vrne "trenutno ni na voljo".

Lokacija iz EXIF podatkov slike (če jo telefon zapiše) se uporabi samo v brskalniku za nasvet
("fotografija je bila posneta bliže X") - na strežnik se nikoli ne pošlje. Shranita se le
izbrano območje in neobvezna kratka opomba, ki jo vpiše uporabnik in je javno vidna na /najdbe.

Brskalnik fotografijo pred nalaganjem pomanjša na 1600 px (JPEG, običajno 300-600 KB) in s tem odstrani tudi EXIF podatke. Strežnik sprejme največ 6 MB in tipe image/jpeg, png, webp, heic ali heif. Ni
samodejnega pregleda vsebine - občasno preveri galerijo na /najdbe. Neprimerno sliko izbrišeš
v Vercel → Storage → Blob → poišči datoteko v mapi najdbe/<območje>/ → Delete.

## Pomembno
- Brezplačni Open-Meteo API je samo za nekomercialno rabo. Ko stran monetiziraš
  (affiliate, oglasi), potrebuješ njihov plačljiv API paket.
- Atribucija Open-Meteo (CC BY 4.0) je v nogi strani - naj ostane.
- Pred objavo preveri besedilo pravil v `app/vodic/page.tsx` proti veljavni uredbi.
