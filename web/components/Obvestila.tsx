"use client";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
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
  const [telefon, setTelefon] = useState(false);
  const [odprteNastavitve, setOdprteNastavitve] = useState(false);

  useEffect(() => {
    const jePodprto = "serviceWorker" in navigator && "PushManager" in window && Boolean(JAVNI_KLJUC);
    setPodprto(jePodprto);
    // iPhone zahteva, da je stran dodana na začetni zaslon
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const samostojno = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    setNaZaslonu(!iOS || samostojno);
    setTelefon(/Android|iPad|iPhone|iPod/.test(navigator.userAgent));
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
      if (dovoljenje !== "granted") { setStanje("Obvestila so v tem brskalniku zavrnjena. Vklopiš jih v nastavitvah strani, pri naslovu levo od povezave."); setDelam(false); return; }
      const reg = await navigator.serviceWorker.ready;
      const naroc = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vBinarno(JAVNI_KLJUC) });
      const s = naroc.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
      const r = await fetch("/api/obvestila", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: s.endpoint, keys: s.keys, obmocja: mojaObmocja(), vrste, prag }),
      });
      if (!r.ok) { setStanje("Naročnine ni bilo mogoče shraniti."); setDelam(false); return; }
      setVklopljeno(true);
      track("obvestila_vklop", { prag, vrst: vrste.length });
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
      setVklopljeno(false); track("obvestila_izklop"); setStanje("Obvestila so izklopljena.");
    } catch { setStanje("Izklop ni uspel."); }
    setDelam(false);
  }

  if (!podprto) return null;

  const opisNastavitev = `${prag === 55 ? "srednje" : prag === 70 ? "dobro" : "odlično"} ali bolje${vrste.length ? `, ${vrste.length === 1 ? "samo " : ""}${vrste.map((id) => VRSTE.find((v) => v.id === id)!.ime.toLowerCase()).join(", ")}` : ", vse vrste"}`;

  return (
    <section className="obvestila">
      <div>
        <h2>Obvesti me, ko raste</h2>
        <p>{!naZaslonu
          ? "Na iPhonu obvestila delujejo šele, ko stran dodaš na začetni zaslon: gumb za deljenje v Safariju, nato Dodaj na začetni zaslon."
          : vklopljeno
            ? `Obveščamo te, ko se razmere odprejo: ${opisNastavitev}.`
            : telefon
              ? "Eno obvestilo na telefon, ko se razmere za tvoja območja odprejo. Nič drugega."
              : "Eno obvestilo v tem brskalniku, ko se razmere za tvoja območja odprejo. Nič drugega."}</p>
      </div>

      <div className="obvestila-vnos">
        <button type="button" className={vklopljeno ? "gumb-ne" : "gumb-da"} disabled={delam || !naZaslonu} onClick={vklopljeno ? izklopi : vklopi}>
          {vklopljeno ? "Izklopi obvestila" : "Vklopi obvestila"}
        </button>

        {!vklopljeno && naZaslonu && (
          <>
            <button type="button" className="povezava-gumb" aria-expanded={odprteNastavitve} onClick={() => setOdprteNastavitve((x) => !x)}>
              {odprteNastavitve ? "Skrij nastavitve" : `Nastavitve: ${opisNastavitev}`}
            </button>
            {odprteNastavitve && (
              <div className="obvestila-nastavitve">
                <label>Obvesti pri
                  <select value={prag} onChange={(e) => setPrag(Number(e.target.value))}>
                    <option value={55}>srednje ali bolje</option>
                    <option value={70}>dobro ali bolje</option>
                    <option value={80}>odlično</option>
                  </select>
                </label>
                <div className="obvestila-vrste">
                  {VRSTE.map((v) => (
                    <button key={v.id} type="button" aria-pressed={vrste.includes(v.id)}
                      onClick={() => setVrste((p) => (p.includes(v.id) ? p.filter((x) => x !== v.id) : [...p, v.id]))}>{v.ime}</button>
                  ))}
                </div>
                <p className="najdbe-opomba">{mojaObmocja().length ? `Velja za tvoja območja (${mojaObmocja().length}).` : "Velja za vso Slovenijo - posamezna območja izbereš z gumbom Spremljaj."}</p>
              </div>
            )}
          </>
        )}
        {stanje && <p className="najdbe-opomba">{stanje}</p>}
      </div>
    </section>
  );
}
