import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { kv } from "./kv";

export type Prijava = {
  email: string;
  obmocja: string[];
  potrjen: boolean;
  zeton: string;
  ustvarjen: string;
};

export const POSILJATELJ = process.env.POSILJATELJ ?? "Gremo po gobe <napoved@gremopogobe.si>";
export const idIz = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 20);
export const novZeton = () => randomBytes(24).toString("hex");
export const veljavenEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e.trim());

export function zetonUjema(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const shrani = (id: string, p: Prijava) => kv.set(`p:${id}`, JSON.stringify(p));
export async function preberi(id: string): Promise<Prijava | null> {
  const v = await kv.get(`p:${id}`);
  return v ? (JSON.parse(v) as Prijava) : null;
}
export const dodajVSeznam = (id: string) => kv.sadd("prijave", id);
export async function odstrani(id: string) {
  await kv.srem("prijave", id);
  await kv.del([`p:${id}`]);
}
export const vsePrijave = () => kv.smembers("prijave");

/** Pošlje eno ali več sporočil prek Resend. Vrne število uspešno oddanih. */
export async function posljiPosto(sporocila: { to: string; subject: string; html: string; headers?: Record<string, string> }[]) {
  const kljuc = process.env.RESEND_API_KEY?.trim();
  if (!kljuc) throw new Error("RESEND_API_KEY ni nastavljen");
  // V glavo smejo samo znaki ASCII; šumnik v ključu bi sicer sesul zahtevo z nejasno napako
  if (!/^[\x21-\x7e]+$/.test(kljuc)) {
    throw new Error("RESEND_API_KEY vsebuje nedovoljene znake (presledek ali šumnik). Prekopiraj ključ iz Resenda še enkrat.");
  }
  let poslano = 0;
  for (let i = 0; i < sporocila.length; i += 100) {
    const kos = sporocila.slice(i, i + 100).map((s) => ({ from: POSILJATELJ, ...s }));
    const res = await fetch(`${process.env.RESEND_URL ?? "https://api.resend.com"}/emails/batch`, {
      method: "POST",
      headers: { Authorization: `Bearer ${kljuc}`, "Content-Type": "application/json" },
      body: JSON.stringify(kos),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Resend ${res.status} ${(await res.text()).slice(0, 200)}`);
    poslano += kos.length;
  }
  return poslano;
}
