"use client";
// Lokacijo iz fotografije uporabimo samo v brskalniku za nasvet - na strežnik ne pošljemo
// nikoli surovih koordinat, samo izbrano območje. Gobarji so glede svojih mest previdni.

export type GPS = { lat: number; lon: number };

export async function gpsIzSlike(datoteka: File): Promise<GPS | null> {
  try {
    const exifr = (await import("exifr")).default;
    const gps = await exifr.gps(datoteka);
    if (!gps || typeof gps.latitude !== "number" || typeof gps.longitude !== "number") return null;
    return { lat: gps.latitude, lon: gps.longitude };
  } catch {
    return null;
  }
}

function razdaljaKm(a: GPS, b: GPS) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function najblizjaTocka<T extends GPS>(gps: GPS, tocke: T[]): T {
  return tocke.reduce((a, b) => (razdaljaKm(gps, b) < razdaljaKm(gps, a) ? b : a));
}
