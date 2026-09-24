import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import HeaderNav from '@/components/layout/HeaderNav';
import SearchOverlay from '@/components/layout/SearchOverlay';
import BookmarkHelper from '@/components/layout/BookmarkHelper';
import MobileMenu from '@/components/layout/MobileMenu';
import { ALL_TOOLS_HREF } from '@/lib/tools/navigation';

/**
 * Site-wide single-row header rendered once from the root layout. Brand on the
 * left, nav (desktop) in the middle, and on the right: search (opens an
 * overlay reusing ToolSearch), theme toggle, the Bookmark helper, and the gold "Browse all tools"
 * CTA. Below the desktop breakpoint the nav and CTA move into MobileMenu.
 * Only the interactive pieces are client components; this shell is server-rendered.
 */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand" aria-label="Formatiq home">
          <span className="brand-mark" aria-hidden="true">{'{'}</span>
          Formatiq
          <span className="brand-mark" aria-hidden="true">{'}'}</span>
        </Link>
        <HeaderNav />
        <div className="site-header-actions">
          <SearchOverlay />
          <ThemeToggle />
          <BookmarkHelper />
          <Link href={ALL_TOOLS_HREF} className="btn btn-primary site-header-cta">
            Browse all tools
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
