// Minimalen odjemalec za Upstash Redis (REST). Deluje tudi z Vercel KV spremenljivkami.
const URL_KV = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
export const kvNaVoljo = Boolean(URL_KV && TOKEN);

async function poslji(ukazi: (string | number)[][]) {
  if (!kvNaVoljo) throw new Error("KV ni nastavljen");
  const res = await fetch(`${URL_KV}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(ukazi),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  const odgovor = (await res.json()) as { result: unknown; error?: string }[];
  return odgovor.map((o) => o.result);
}

export const kv = {
  ukazi: poslji,
  async incr(kljuci: string[]) {
    return poslji(kljuci.map((k) => ["INCR", k])) as Promise<number[]>;
  },
  /** Vrne true, če je ključ nastavljen prvič (uporabljeno za omejitev enega glasu na dan). */
  async prvic(kljuc: string, sekund: number) {
    const [r] = await poslji([["SET", kljuc, "1", "NX", "EX", sekund]]);
    return r !== null;
  },
  async mget(kljuci: string[]) {
    if (!kljuci.length) return [];
    const [r] = await poslji([["MGET", ...kljuci]]);
    return r as (string | null)[];
  },
  async zapisi(kljuc: string, vrednost: string, najvec: number) {
    return poslji([["LPUSH", kljuc, vrednost], ["LTRIM", kljuc, 0, najvec - 1]]);
  },
  async get(kljuc: string) {
    const [r] = await poslji([["GET", kljuc]]);
    return r as string | null;
  },
  async set(kljuc: string, vrednost: string) {
    await poslji([["SET", kljuc, vrednost]]);
  },
  async del(kljuci: string[]) {
    if (kljuci.length) await poslji([["DEL", ...kljuci]]);
  },
  async sadd(kljuc: string, clan: string) {
    await poslji([["SADD", kljuc, clan]]);
  },
  async srem(kljuc: string, clan: string) {
    await poslji([["SREM", kljuc, clan]]);
  },
  async smembers(kljuc: string) {
    const [r] = await poslji([["SMEMBERS", kljuc]]);
    return (r as string[]) ?? [];
  },
  async seznam(kljuc: string, koliko: number) {
    const [r] = await poslji([["LRANGE", kljuc, 0, koliko - 1]]);
    return (r as string[]) ?? [];
  },
};
