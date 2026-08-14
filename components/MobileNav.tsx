'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories } from '@/lib/tools/registry';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  // Kept mounted for one exit-transition cycle after closing, since React would
  // otherwise remove the portaled node the instant `open` flips, giving the CSS
  // transition no time to play - see .mobile-nav-panel[data-state='closing'].
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  function closeMenu() {
    setOpen((wasOpen) => {
      if (wasOpen) setClosing(true);
      return false;
    });
  }

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      closeMenu();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        ref={toggleRef}
        type="button"
        className="mobile-nav-toggle"
        onClick={() => (open ? closeMenu() : setOpen(true))}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Rendered via portal into document.body, not as a descendant of .site-header - that
          element has backdrop-filter, which creates a new containing block for position:fixed
          children (same rule as filter/transform), so a fixed panel nested inside it never
          actually positions relative to the viewport. The portal sidesteps that entirely. */}
      {mounted &&
        (open || closing) &&
        createPortal(
          <div
            ref={panelRef}
            className="mobile-nav-panel"
            data-state={closing ? 'closing' : 'open'}
            onTransitionEnd={(e) => {
              if (e.target === e.currentTarget && closing) setClosing(false);
            }}
          >
            {categories.map((category) => (
              <Link key={category.slug} href={`/tools/${category.slug}`} onClick={closeMenu}>
                {category.navLabel}
              </Link>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
