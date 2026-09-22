import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Gremo po gobe, domov">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 15c0-6.6 5.4-11 12-11s12 4.4 12 11z" />
        <path d="M12 15v9a4 4 0 0 0 8 0v-9" />
        <circle cx="11" cy="10" r="1.2" fill="currentColor" />
        <circle cx="19" cy="8.5" r="1.2" fill="currentColor" />
      </svg>
      <span>gremo po gobe</span>
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
        <Link href="/vodic">Vodič</Link>
        <Link href="/vodic#pravila">Pravila</Link>
      </nav>
    </header>
  );
}

export function Noga() {
  return (
    <footer className="noga">
      <span>gremopogobe.si. Vremenski podatki: <a href="https://open-meteo.com/">Open-Meteo.com</a> (CC BY 4.0)</span>
      <span>Indeks je ocena razmer, ne zagotovilo najdbe in ne pomoč pri določanju užitnosti.</span>
    </footer>
  );
}
