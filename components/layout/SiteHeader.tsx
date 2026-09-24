import Link from 'next/link';
import ToolSearch from '@/components/ToolSearch';
import ThemeToggle from '@/components/ThemeToggle';
import CategoryNav from '@/components/layout/CategoryNav';

/**
 * Site-wide, two-row header rendered once from the root layout so every
 * route inherits it automatically. Row 1 is the brand plus a compact,
 * persistent global search (no account/login controls - none exist on this
 * site). Row 2 is the horizontally-scrollable category nav (CategoryNav),
 * a client component since it needs the current pathname for active-state.
 */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-row1">
        <Link href="/" className="brand">
          <span className="brand-mark">{'{'}</span>
          Formatiq
          <span className="brand-mark">{'}'}</span>
        </Link>
        <ToolSearch idPrefix="header" variant="compact" label="Search all tools" />
        <ThemeToggle />
      </div>
      <div className="site-header-row2">
        <CategoryNav />
      </div>
    </header>
  );
}
