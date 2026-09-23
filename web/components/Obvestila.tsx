"use client";
import { useEffect, useState } from "react";
import { VRSTE, type VrstaId } from "@/lib/vrste";
import { mojaObmocja } from "@/lib/moja";

const JAVNI_KLJUC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function vBinarno(base64: string) {
  const p = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const s = atob(p);
  return Uint8Array.from([...s].map((c) => c.charCodeAt(0)));
}

export default function Obvestila() {
  const [podprto, setPodprto] = useState(false);
  const [vklopljeno, setVklopljeno] = useState(false);
  const [prag, setPrag] = useState(70);
  const [vrste, setVrste] = useState<VrstaId[]>([]);
  const [stanje, setStanje] = useState("");
  const [delam, setDelam] = useState(false);
  const [naZaslonu, setNaZaslonu] = useState(true);

  useEffect(() => {
    const jePodprto = "serviceWorker" in navigator && "PushManager" in window && Boolean(JAVNI_KLJUC);
    setPodprto(jePodprto);
    // iPhone zahteva, da je stran dodana na začetni zaslon
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const samostojno = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    setNaZaslonu(!iOS || samostojno);
    if (!jePodprto) return;
    navigator.serviceWorker.ready
      .then((r) => r.pushManager.getSubscription())
      .then((s) => setVklopljeno(Boolean(s)))
      .catch(() => {});
  }, []);

  async function vklopi() {
    setDelam(true); setStanje("");
    try {
      const dovoljenje = await Notification.requestPermission();
      if (dovoljenje !== "granted") { setStanje("Obvestila so v brskalniku zavrnjena. Vklopiš jih lahko v nastavitvah strani."); setDelam(false); return; }
      const reg = await navigator.serviceWorker.ready;
      const naroc = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vBinarno(JAVNI_KLJUC) });
      const s = naroc.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
      const r = await fetch("/api/obvestila", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: s.endpoint, keys: s.keys, obmocja: mojaObmocja(), vrste, prag }),
      });
      if (!r.ok) { setStanje("Naročnine ni bilo mogoče shraniti."); setDelam(false); return; }
      setVklopljeno(true);
      setStanje("Vklopljeno. Obvestilo dobiš, ko se razmere odprejo.");
    } catch {
      setStanje("Obvestil ni bilo mogoče vklopiti.");
    }
    setDelam(false);
  }

  async function izklopi() {
    setDelam(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const s = await reg.pushManager.getSubscription();
      if (s) {
        await fetch("/api/obvestila", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: s.endpoint }) });
        await s.unsubscribe();
      }
      setVklopljeno(false); setStanje("Obvestila so izklopljena.");
    } catch { setStanje("Izklop ni uspel."); }
    setDelam(false);
  }

  if (!podprto) return null;

  return (
    <section className="obvestila">
      <div>
        <h2>Obvesti me, ko raste</h2>
        <p>{naZaslonu
          ? "Obvestilo na telefon, ko indeks za tvoja območja preseže izbrano mejo. Največ eno obvestilo na območje in vrsto na pet dni."
          : "Na iPhonu obvestila delujejo šele, ko stran dodaš na začetni zaslon: gumb za deljenje v Safariju, nato Dodaj na začetni zaslon."}</p>
      </div>
      <div className="obvestila-vnos">
        {!vklopljeno && (
          <>
            <label>Meja
              <select value={prag} onChange={(e) => setPrag(Number(e.target.value))}>
                <option value={55}>55 - srednje ali bolje</option>
                <option value={70}>70 - dobro ali bolje</option>
                <option value={80}>80 - odlično</option>
              </select>
            </label>
            <div className="obvestila-vrste">
              {VRSTE.map((v) => (
                <button key={v.id} type="button" aria-pressed={vrste.includes(v.id)}
                  onClick={() => setVrste((p) => (p.includes(v.id) ? p.filter((x) => x !== v.id) : [...p, v.id]))}>{v.ime}</button>
              ))}
            </div>
            <p className="najdbe-opomba">{vrste.length ? "" : "Brez izbire dobiš obvestila za vse vrste."} {mojaObmocja().length ? `Velja za tvoja območja (${mojaObmocja().length}).` : "Velja za vso Slovenijo - območja izbereš z gumbom Spremljaj."}</p>
          </>
        )}
        <button type="button" className={vklopljeno ? "gumb-ne" : "gumb-da"} disabled={delam || !naZaslonu} onClick={vklopljeno ? izklopi : vklopi}>
          {vklopljeno ? "Izklopi obvestila" : "Vklopi obvestila"}
        </button>
        {stanje && <p className="najdbe-opomba">{stanje}</p>}
      </div>
    </section>
  );
}
