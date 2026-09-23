"use client";
import { useEffect } from "react";

export default function PWA() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    const t = setTimeout(() => navigator.serviceWorker.register("/sw.js").catch(() => {}), 1200);
    return () => clearTimeout(t);
  }, []);
  return null;
}
