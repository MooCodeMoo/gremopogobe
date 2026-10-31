import type { Metadata } from "next";
import { Nav, Noga } from "@/components/Nav";
import Stran404 from "@/components/Stran404";

export const metadata: Metadata = {
  title: "Strani ni | Gremo po gobe",
  description: "Te strani ni. Ta stran je šla po gobe.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <Stran404 />
      <Noga />
    </>
  );
}
