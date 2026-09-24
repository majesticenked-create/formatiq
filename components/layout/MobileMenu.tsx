'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { categories } from '@/lib/tools/registry';
import { ALL_TOOLS_HREF, HEADER_NAV_ITEMS, getActiveCategorySlug } from '@/lib/tools/navigation';
import BookmarkHelper from '@/components/layout/BookmarkHelper';
import { CloseIcon, MenuIcon } from '@/components/icons/UiIcons';

/** Mobile/tablet menu (shown below the desktop breakpoint). Disclosure button
 *  with aria-expanded/aria-controls; Escape closes and returns focus to it. */
export default function MobileMenu() {
  const pathname = usePathname() ?? '';
  const activeSlug = getActiveCategorySlug(
    pathname,
    categories.map((c) => c.slug)
  );
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="mobile-menu">
      <button
        type="button"
        ref={buttonRef}
        className="icon-round-btn"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
      </button>
      {open && (
        <div id="mobile-menu-panel" ref={panelRef} className="mobile-menu-panel">
          <nav aria-label="Mobile">
            <ul className="mobile-menu-list">
              {HEADER_NAV_ITEMS.map((item) =>
                item.type === 'link' ? (
                  <li key={item.label}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ) : (
                  <li key={item.label}>
                    <span className="mobile-menu-heading">{item.label}</span>
                    <ul className="mobile-menu-sublist">
                      {categories.map((category) => {
                        const isActive = category.slug === activeSlug;
                        return (
                          <li key={category.slug}>
                            <Link
                              href={`/tools/${category.slug}`}
                              aria-current={isActive ? 'page' : undefined}
                              data-active={isActive || undefined}
                            >
                              {category.navLabel}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                )
              )}
            </ul>
          </nav>
          <BookmarkHelper variant="menu" />
          <Link href={ALL_TOOLS_HREF} className="btn btn-primary mobile-menu-cta">
            Browse all tools
          </Link>
        </div>
      )}
    </div>
  );
}
