import { createHash } from "crypto";
import webpush from "web-push";
import { kv } from "./kv";
import type { VrstaId } from "./vrste";

export type Narocnina = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  obmocja: string[]; // prazno = vsa
  vrste: VrstaId[];
  prag: number;
  zadnje: Record<string, string>; // "slug:vrsta" -> datum zadnjega obvestila
};

export const idIzEndpointa = (e: string) => createHash("sha256").update(e).digest("hex").slice(0, 24);
export const potisnNaVoljo = Boolean(process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

export function pripraviWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_KONTAKT ?? "mailto:info@gremopogobe.si",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return webpush;
}

export const shraniNarocnino = (id: string, n: Narocnina) => kv.set(`o:${id}`, JSON.stringify(n));
export async function preberiNarocnino(id: string): Promise<Narocnina | null> {
  const v = await kv.get(`o:${id}`);
  return v ? (JSON.parse(v) as Narocnina) : null;
}
export const dodajNarocnino = (id: string) => kv.sadd("obvestila", id);
export async function odstraniNarocnino(id: string) {
  await kv.srem("obvestila", id);
  await kv.del([`o:${id}`]);
}
export const vseNarocnine = () => kv.smembers("obvestila");
