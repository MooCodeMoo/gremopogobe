// Servisni delavec: zadnja napoved ostane vidna tudi brez signala.
const RAZLICICA = "gpg-v2";
const OSNOVA = ["/", "/regije", "/vrste", "/vodic", "/brez-povezave", "/brand/logo.png", "/icons/ikona-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(RAZLICICA).then((c) => c.addAll(OSNOVA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((k) => Promise.all(k.filter((x) => x !== RAZLICICA).map((x) => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const zahteva = e.request;
  if (zahteva.method !== "GET" || new URL(zahteva.url).origin !== self.location.origin) return;
  if (new URL(zahteva.url).pathname.startsWith("/api/")) return;

  // Strani: najprej omrežje (sveža napoved), ob izpadu zadnja shranjena različica
  if (zahteva.mode === "navigate") {
    e.respondWith(
      fetch(zahteva)
        .then((o) => { const kopija = o.clone(); caches.open(RAZLICICA).then((c) => c.put(zahteva, kopija)); return o; })
        .catch(() => caches.match(zahteva).then((o) => o || caches.match("/brez-povezave")))
    );
    return;
  }

  // Statične datoteke: najprej predpomnilnik
  e.respondWith(
    caches.match(zahteva).then((o) => o || fetch(zahteva).then((r) => {
      if (r.ok && (zahteva.url.includes("/_next/static") || zahteva.url.includes("/brand/") || zahteva.url.includes("/icons/"))) {
        const kopija = r.clone();
        caches.open(RAZLICICA).then((c) => c.put(zahteva, kopija));
      }
      return r;
    }))
  );
});

// Potisna obvestila
self.addEventListener("push", (e) => {
  let p = { title: "Gremo po gobe", body: "Razmere za gobe so se izboljšale.", url: "/" };
  try { p = { ...p, ...e.data.json() }; } catch { /* prazno sporočilo */ }
  e.waitUntil(self.registration.showNotification(p.title, {
    body: p.body,
    icon: "/icons/ikona-192.png",
    badge: "/icons/ikona-192.png",
    data: { url: p.url },
    tag: "napoved",
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const cilj = new URL(e.notification.data?.url || "/", self.location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((okna) => {
      const odprto = okna.find((o) => o.url.startsWith(self.location.origin));
      if (odprto) { odprto.navigate(cilj); return odprto.focus(); }
      return self.clients.openWindow(cilj);
    })
  );
});
