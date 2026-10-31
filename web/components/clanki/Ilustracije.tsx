import { VRSTE } from "@/lib/vrste";

/** Izvirna ilustracija: dva jurčka pod smreko in dež. */
export function HeroJurcki() {
  return (
    <svg viewBox="0 0 960 380" role="img" aria-label="Ilustracija: dva jurčka v mahu pod smrekami, nad njima dežni oblak" className="cl-slika">
      <defs>
        <linearGradient id="cl-nebo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E3E8D6" /><stop offset="1" stopColor="#F3EFE6" /></linearGradient>
      </defs>
      <rect width="960" height="380" fill="url(#cl-nebo)" />
      {/* smreke */}
      {[[90, 0.9], [200, 1.15], [760, 1.1], [880, 0.85]].map(([x, s], i) => (
        <g key={i} transform={`translate(${x} 300) scale(${s})`} fill="#1F3A2B" opacity={i % 2 ? 0.85 : 1}>
          <path d="M0 -250 L-48 -150 H-22 L-70 -70 H-34 L-90 10 H90 L34 -70 H70 L22 -150 H48 Z" />
          <rect x="-8" y="10" width="16" height="30" fill="#4B341C" />
        </g>
      ))}
      {/* oblak in dež */}
      <g fill="#C9D2BF"><ellipse cx="450" cy="50" rx="90" ry="26" /><ellipse cx="400" cy="62" rx="60" ry="22" /><ellipse cx="505" cy="64" rx="64" ry="22" /></g>
      <g stroke="#6F8F7A" strokeWidth="3" strokeLinecap="round" opacity=".7">
        {[395, 425, 455, 485, 515].map((x, i) => <path key={x} d={`M${x} ${90 + (i % 2) * 14} l-7 22`} />)}
        {[410, 440, 470, 500].map((x, i) => <path key={x} d={`M${x} ${128 + (i % 2) * 14} l-7 22`} />)}
      </g>
      {/* tla in mah */}
      <path d="M0 310 Q240 280 480 300 T960 296 V380 H0 Z" fill="#8FA878" />
      <path d="M0 336 Q300 314 560 332 T960 326 V380 H0 Z" fill="#6E8B5B" />
      <g fill="#A7BD91"><circle cx="150" cy="322" r="9" /><circle cx="172" cy="326" r="7" /><circle cx="730" cy="318" r="9" /><circle cx="756" cy="322" r="7" /><circle cx="320" cy="326" r="6" /></g>
      {/* velik jurček */}
      <g transform="translate(430 0)">
        <path d="M-34 208 Q-50 280 -42 318 H46 Q52 280 36 208 Z" fill="#EAD9B8" stroke="#C9B58E" strokeWidth="2" />
        <path d="M-24 236 Q0 246 26 236 M-28 262 Q0 272 30 262" stroke="#D6C29B" strokeWidth="2" fill="none" />
        <path d="M-108 214 Q-108 120 0 112 Q108 120 108 214 Q0 236 -108 214 Z" fill="#8A4B24" />
        <path d="M-96 196 Q-90 140 -20 126 Q-70 150 -80 196 Z" fill="#A9602F" opacity=".8" />
        <path d="M-108 214 Q0 236 108 214 Q100 224 0 232 Q-100 224 -108 214 Z" fill="#E8DAB8" />
      </g>
      {/* manjši jurček */}
      <g transform="translate(600 40) scale(.62)">
        <path d="M-30 208 Q-44 270 -36 318 H40 Q46 270 32 208 Z" fill="#EAD9B8" stroke="#C9B58E" strokeWidth="2" />
        <path d="M-96 214 Q-96 124 0 116 Q96 124 96 214 Q0 234 -96 214 Z" fill="#7A3F1D" />
        <path d="M-84 198 Q-78 146 -16 130 Q-60 154 -70 198 Z" fill="#9A5628" opacity=".8" />
        <path d="M-96 214 Q0 234 96 214 Q88 224 0 230 Q-88 224 -96 214 Z" fill="#E8DAB8" />
      </g>
      {/* mladi jurček */}
      <g transform="translate(310 118) scale(.36)">
        <path d="M-26 208 Q-36 262 -30 318 H34 Q38 262 28 208 Z" fill="#EAD9B8" />
        <path d="M-80 214 Q-80 130 0 122 Q80 130 80 214 Q0 232 -80 214 Z" fill="#8A4B24" />
      </g>
    </svg>
  );
}

const X0 = 150, DAN = 11.4;
const xd = (d: number) => X0 + d * DAN;
/** Razpon zamika med dežjem in plodovi po treh virih. */
export function CasnicaZamika() {
  const vrstice: [string, number, number, string][] = [
    ["Popularni viri", 5, 10, "#D9C79B"],
    ["Analiza najdb", 16, 25, "#C07A3A"],
    ["Naš model", 10, 28, "#6B2A15"],
  ];
  return (
    <svg viewBox="0 0 600 230" role="img" aria-label="Zamik med dežjem in plodovi jurčka: popularni viri 5 do 10 dni, analiza najdb 16 do 25 dni, naš model 10 do 28 dni" className="cl-slika">
      <rect width="600" height="230" fill="#FBF9F4" />
      {[0, 7, 14, 21, 28, 35].map((d) => (
        <g key={d}>
          <line x1={xd(d)} x2={xd(d)} y1="28" y2="170" stroke="#DDD6C6" strokeWidth="1.5" />
          <text x={xd(d)} y="196" textAnchor="middle" fontSize="15" fill="#5A5E51">{d === 0 ? "dež" : `${d} dni`}</text>
        </g>
      ))}
      {vrstice.map(([ime, a, b, barva], i) => (
        <g key={ime}>
          <text x="8" y={62 + i * 44} fontSize="15" fontWeight="600" fill="#1D2118">{ime}</text>
          <rect x={xd(a)} y={44 + i * 44} width={(b - a) * DAN} height="26" rx="13" fill={barva} />
          <text x={xd(a) + (b - a) * DAN / 2} y={62 + i * 44} textAnchor="middle" fontSize="14" fontWeight="600" fill={i === 0 ? "#1D2118" : "#fff"}>{a} do {b}</text>
        </g>
      ))}
      <g transform={`translate(${xd(0)} 20)`}><path d="M0 -8 q7 10 0 14 q-7 -4 0 -14 Z" fill="#4B7FA5" /></g>
    </svg>
  );
}

const TX0 = 110, TS = 18.2;
const xt = (t: number) => TX0 + t * TS;
/** Temperaturna okna tal po vrstah iz modela (data/model.json). */
export function TemperaturnaOkna() {
  return (
    <svg viewBox="0 0 600 250" role="img" aria-label="Temperaturna okna tal za jurčka, lisičko, marelo in štorovko" className="cl-slika">
      <rect width="600" height="250" fill="#FBF9F4" />
      {[0, 5, 10, 15, 20, 25].map((t) => (
        <g key={t}>
          <line x1={xt(t)} x2={xt(t)} y1="16" y2="200" stroke="#DDD6C6" strokeWidth="1.5" />
          <text x={xt(t)} y="224" textAnchor="middle" fontSize="15" fill="#5A5E51">{t} °C</text>
        </g>
      ))}
      {VRSTE.map((v, i) => {
        const [lo, o1, o2, hi] = v.temp;
        const y = 34 + i * 42;
        return (
          <g key={v.id}>
            <text x="8" y={y + 5} fontSize="15" fontWeight="600" fill="#1D2118">{v.ime}</text>
            <rect x={xt(lo)} y={y - 8} width={(hi - lo) * TS} height="16" rx="8" fill="#E8DAB8" />
            <rect x={xt(o1)} y={y - 8} width={(o2 - o1) * TS} height="16" rx="8" fill={v.id === "jurcek" ? "#6B2A15" : "#B85E2A"} />
          </g>
        );
      })}
    </svg>
  );
}
