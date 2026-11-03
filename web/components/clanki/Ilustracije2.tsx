import { LESTVICA, OZNAKE } from "@/lib/vrste";

const OBSEG = ["0-19", "20-39", "40-59", "60-79", "80-100"];

/** Lestvica indeksa: pet stopenj z barvami, kot na zemljevidu. Najvišja možna ocena je 90. */
export function LestvicaIndeksa() {
  return (
    <svg viewBox="0 0 600 150" role="img" aria-label="Lestvica indeksa ugodnosti: slabo 0 do 19, skromno 20 do 39, srednje 40 do 59, dobro 60 do 79, odlično 80 do 100, najvišja možna ocena je 90" className="cl-slika">
      <rect width="600" height="150" fill="#FBF9F4" />
      {LESTVICA.map((c, i) => (
        <g key={c}>
          <rect x={i * 112 + 20} y="34" width="104" height="46" rx={i === 0 || i === 4 ? 10 : 0} fill={c} />
          <text x={i * 112 + 72} y="63" textAnchor="middle" fontSize="16" fontWeight="700" fill={i >= 3 ? "#FFFFFF" : "#1D2118"}>{OZNAKE[i]}</text>
          <text x={i * 112 + 72} y="106" textAnchor="middle" fontSize="15" fill="#5A5E51">{OBSEG[i]}</text>
        </g>
      ))}
      {/* najvišja možna ocena 90: 80 + 10/20 širine zadnje stopnje */}
      <line x1={4 * 112 + 20 + 52} x2={4 * 112 + 20 + 52} y1="22" y2="34" stroke="#1D2118" strokeWidth="2" />
      <line x1={4 * 112 + 20 + 52} x2={4 * 112 + 20 + 52} y1="80" y2="88" stroke="#1D2118" strokeWidth="2" />
      <text x={4 * 112 + 20 + 52} y="16" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1D2118">največ 90</text>
      <text x="300" y="138" textAnchor="middle" fontSize="14" fill="#5A5E51">Barve so enake kot na zemljevidu. Ocena 100 zaradi previdnostnega popravka ni mogoča.</text>
    </svg>
  );
}

const X = (d: number) => 20 + ((d + 28) / 35) * 560; // dnevi od -28 do +7

/** Okno dežja: za današnji dan in za dan čez 6 dni. Napoved dežja v naslednjih 7 dneh v dežni del ne vstopa. */
export function OknoDeza() {
  const oznake = [-28, -21, -14, -7, 0, 7];
  return (
    <svg viewBox="0 0 600 220" role="img" aria-label="Časovnica: dež šteje v oknu od 10 do 28 dni nazaj, napoved za naslednjih 7 dni v dežni del ne vstopa" className="cl-slika">
      <rect width="600" height="220" fill="#FBF9F4" />
      <rect x={X(0)} y="14" width={X(7) - X(0)} height="150" fill="#E9EFE6" />
      <text x={(X(0) + X(7)) / 2} y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2F5D46">napoved</text>
      <text x={(X(0) + X(7)) / 2} y="48" textAnchor="middle" fontSize="13" fill="#2F5D46">7 dni</text>

      <text x={X(-28)} y="44" fontSize="14" fontWeight="600" fill="#1D2118">Za današnji dan</text>
      <rect x={X(-28)} y="52" width={X(-10) - X(-28)} height="34" rx="17" fill="#1F4F7A" />
      <text x={(X(-28) + X(-10)) / 2} y="74" textAnchor="middle" fontSize="14" fontWeight="700" fill="#FFFFFF">dež šteje: 10 do 28 dni nazaj</text>

      <text x={X(-22)} y="112" fontSize="14" fontWeight="600" fill="#1D2118">Za dan čez 6 dni</text>
      <rect x={X(-22)} y="120" width={X(-4) - X(-22)} height="34" rx="17" fill="#6A94B8" />
      <text x={(X(-22) + X(-4)) / 2} y="142" textAnchor="middle" fontSize="14" fontWeight="700" fill="#FFFFFF">enako okno, premaknjeno za 6 dni</text>

      <line x1={X(0)} x2={X(0)} y1="14" y2="168" stroke="#1D2118" strokeWidth="2" />
      <line x1="20" x2="580" y1="176" y2="176" stroke="#DDD6C6" strokeWidth="2" />
      {oznake.map((d) => (
        <g key={d}>
          <line x1={X(d)} x2={X(d)} y1="176" y2="182" stroke="#5A5E51" />
          <text x={X(d)} y="200" textAnchor="middle" fontSize="14" fill="#5A5E51">{d === 0 ? "danes" : d > 0 ? `+${d}` : `${d}`.replace("-", "−")}</text>
        </g>
      ))}
    </svg>
  );
}
