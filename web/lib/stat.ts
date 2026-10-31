// Lasten števec obiskov: brez piškotkov, brez shranjenih IP naslovov.
// Obiskovalec je dnevni zgoščeni podpis (IP + brskalnik + dan + skrivnost), ki gre samo v HyperLogLog (ni ga mogoče prebrati nazaj).
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { kv } from "@/lib/kv";

export const DOLZINA_HRANJENJA = 60 * 60 * 24 * 120; // 120 dni
export const DOVOLJENI_DOGODKI = new Set([
  "vrsta", "dan", "predvajaj", "najdba", "prijava_bilten", "obvestila_vklop", "obvestila_izklop", "spremljaj_dodaj", "spremljaj_odstrani", "kosara",
]);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|curl|wget|python|node-fetch|axios|monitor|uptime|facebookexternalhit|whatsapp|telegram|discord/i;

export const jeBot = (ua: string) => !ua || BOT.test(ua);
export const dan = (d = new Date()) => d.toISOString().slice(0, 10);

/** Pot, očiščena na znane oblike (zaščita pred smetjo v števcu). */
export function ocistiPot(p: unknown): string {
  if (typeof p !== "string") return "/ostalo";
  const pot = p.split(/[?#]/)[0].toLowerCase();
  if (pot === "/") return "/";
  const ok = /^\/(regije|vrste|vodic|najdbe|drustva|brez-povezave|prijava)(\/[a-z0-9-]{1,40})?$/.test(pot) || /^\/regija\/[a-z0-9-]{1,40}$/.test(pot);
  return ok ? pot.replace(/\/$/, "") : "/ostalo";
}

export function ocistiPovezavo(r: unknown): string {
  if (typeof r !== "string" || !r) return "(neposredno)";
  try {
    const h = new URL(r).hostname.replace(/^www\./, "");
    if (h === "gremopogobe.si" || h.endsWith(".vercel.app")) return "";
    return h.slice(0, 60);
  } catch { return "(neposredno)"; }
}

const podpis = (ip: string, ua: string, d: string) =>
  createHash("sha256").update(`${ip}|${ua}|${d}|${process.env.ADMIN_GESLO ?? "gpg"}`).digest("hex").slice(0, 32);

export async function zabeleziObisk(o: { ip: string; ua: string; pot: string; vir: string; naprava: "mobilno" | "namizno" }) {
  const d = dan();
  const k = (s: string) => `st:${d}:${s}`;
  const ukazi: (string | number)[][] = [
    ["INCR", k("pv")], ["PFADD", k("u"), podpis(o.ip, o.ua, d)],
    ["HINCRBY", k("p"), o.pot, 1], ["HINCRBY", k("dev"), o.naprava, 1],
  ];
  if (o.vir) ukazi.push(["HINCRBY", k("r"), o.vir, 1]);
  for (const s of ["pv", "u", "p", "dev", "r"]) ukazi.push(["EXPIRE", k(s), DOLZINA_HRANJENJA]);
  await kv.ukazi(ukazi);
}

export async function zabeleziDogodek(ime: string, podrobnost: string) {
  const d = dan();
  const kljuc = `st:${d}:e`;
  await kv.ukazi([["HINCRBY", kljuc, podrobnost ? `${ime}:${podrobnost}` : ime, 1], ["EXPIRE", kljuc, DOLZINA_HRANJENJA]]);
}

// ---- Prijava v nadzorno ploščo ----
export const PISKOTEK = "gpg_admin";
export const znakAdmin = () => createHmac("sha256", process.env.ADMIN_GESLO ?? "").update("gpg-admin-v1").digest("hex");
export function jeAdmin(piskotek: string | undefined) {
  if (!process.env.ADMIN_GESLO || !piskotek) return false;
  const a = Buffer.from(piskotek), b = Buffer.from(znakAdmin());
  return a.length === b.length && timingSafeEqual(a, b);
}
export function geslo_ok(vnos: string) {
  const g = process.env.ADMIN_GESLO ?? "";
  const a = Buffer.from(vnos), b = Buffer.from(g);
  return g.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

// ---- Branje ----
type Slovar = Record<string, number>;
const vSlovar = (r: unknown): Slovar => {
  const o: Slovar = {};
  if (Array.isArray(r)) for (let i = 0; i + 1 < r.length; i += 2) o[String(r[i])] = Number(r[i + 1]);
  return o;
};
const sestej = (a: Slovar, b: Slovar) => { for (const [k, v] of Object.entries(b)) a[k] = (a[k] ?? 0) + v; };

export async function preberiStatistiko(dni: number) {
  const datumi = Array.from({ length: dni }, (_, i) => dan(new Date(Date.now() - (dni - 1 - i) * 864e5)));
  const ukazi: (string | number)[][] = [];
  for (const d of datumi) for (const s of ["pv", "u", "p", "r", "dev", "e"]) {
    ukazi.push(s === "pv" ? ["GET", `st:${d}:pv`] : s === "u" ? ["PFCOUNT", `st:${d}:u`] : ["HGETALL", `st:${d}:${s}`]);
  }
  const r = await kv.ukazi(ukazi);
  const poDnevih = datumi.map((d, i) => ({ d, pv: Number(r[i * 6] ?? 0), u: Number(r[i * 6 + 1] ?? 0) }));
  const poti: Slovar = {}, viri: Slovar = {}, naprave: Slovar = {}, dogodki: Slovar = {};
  datumi.forEach((_, i) => {
    sestej(poti, vSlovar(r[i * 6 + 2])); sestej(viri, vSlovar(r[i * 6 + 3]));
    sestej(naprave, vSlovar(r[i * 6 + 4])); sestej(dogodki, vSlovar(r[i * 6 + 5]));
  });
  return { poDnevih, poti, viri, naprave, dogodki };
}
