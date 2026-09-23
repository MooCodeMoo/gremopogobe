import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Gremo po gobe, domov">
      <Image src="/brand/logo.png" alt="gremo po gobe" width={1200} height={368} priority sizes="170px" />
    </Link>
  );
}

export function Nav() {
  return (
    <header className="nav">
      <Logo />
      <nav aria-label="Glavna navigacija">
        <Link href="/">Napoved</Link>
        <Link href="/regije">Regije</Link>
        <Link href="/najdbe">Najdbe</Link>
        <Link href="/vrste">Vrste</Link>
        <Link href="/vodic">Vodič</Link>
      </nav>
    </header>
  );
}

export function Noga() {
  return (
    <footer className="noga">
      <Image src="/brand/logo-slogan.png" alt="gremo po gobe - več kot nabiranje." width={1400} height={383} sizes="220px" className="noga-logo" />
      <nav className="noga-povezave" aria-label="Povezave v nogi">
        <Link href="/regije">Vse regije</Link>
        <Link href="/najdbe">Zemljevid najdb</Link>
        <Link href="/vrste/jurcek">Jurčki</Link>
        <Link href="/vrste/lisicka">Lisičke</Link>
        <Link href="/vrste/marela">Marele</Link>
        <Link href="/vrste/storovka">Štorovke</Link>
        <Link href="/vodic">Pravila nabiranja</Link>
      </nav>
      <span>gremopogobe.si. Vremenski podatki: <a href="https://open-meteo.com/">Open-Meteo.com</a> (CC BY 4.0)</span>
      <span>Indeks je ocena razmer, ne zagotovilo najdbe in ne pomoč pri določanju užitnosti.</span>
    </footer>
  );
}
