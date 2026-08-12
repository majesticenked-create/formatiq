import Link from 'next/link';
import { categories } from '@/lib/tools/registry';
import ThemeToggle from './ThemeToggle';
import MobileNav from './MobileNav';

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
          {categories.map((category) => (
            <Link key={category.slug} href={`/tools/${category.slug}`}>
              {category.navLabel}
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
