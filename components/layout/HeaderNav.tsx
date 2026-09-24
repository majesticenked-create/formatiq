'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { categories } from '@/lib/tools/registry';
import { HEADER_NAV_ITEMS, getActiveCategorySlug } from '@/lib/tools/navigation';
import { ChevronDownIcon } from '@/components/icons/UiIcons';

/** Desktop nav. The "Categories" item is a disclosure menu listing the real
 *  registry categories; the active one (from the pathname) gets aria-current. */
export default function HeaderNav() {
  const pathname = usePathname() ?? '';
  const activeSlug = getActiveCategorySlug(
    pathname,
    categories.map((c) => c.slug)
  );
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onFocusOut(e: FocusEvent) {
      if (wrapRef.current && e.relatedTarget && !wrapRef.current.contains(e.relatedTarget as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    const el = wrapRef.current;
    el?.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      el?.removeEventListener('focusout', onFocusOut);
    };
  }, [open]);

  return (
    <nav className="site-nav" aria-label="Main">
      {HEADER_NAV_ITEMS.map((item) =>
        item.type === 'link' ? (
          <Link key={item.label} href={item.href} className="site-nav-link">
            {item.label}
          </Link>
        ) : (
          <div key={item.label} className="site-nav-menu" ref={wrapRef}>
            <button
              type="button"
              ref={buttonRef}
              className="site-nav-link site-nav-button"
              data-active={activeSlug ? true : undefined}
              aria-expanded={open}
              aria-controls="header-categories-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {item.label}
              <ChevronDownIcon size={16} className="site-nav-chevron" />
            </button>
            {open && (
              <ul id="header-categories-menu" className="site-nav-dropdown">
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
            )}
          </div>
        )
      )}
    </nav>
  );
}
