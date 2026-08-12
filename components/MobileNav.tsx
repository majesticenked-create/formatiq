'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories } from '@/lib/tools/registry';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
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
        onClick={() => setOpen((v) => !v)}
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
        open &&
        createPortal(
          <div ref={panelRef} className="mobile-nav-panel">
            {categories.map((category) => (
              <Link key={category.slug} href={`/tools/${category.slug}`} onClick={() => setOpen(false)}>
                {category.navLabel}
              </Link>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
