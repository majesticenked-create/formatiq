import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">{'{'}</span>
          Formatiq
          <span className="brand-mark">{'}'}</span>
        </Link>
        <nav className="nav-links">
          <Link href="/tools/formatters">Formatters</Link>
          <Link href="/tools/converters">Converters</Link>
          <Link href="/tools/generators">Generators</Link>
          <Link href="/tools/text-tools">Text Tools</Link>
        </nav>
      </div>
    </header>
  );
}
