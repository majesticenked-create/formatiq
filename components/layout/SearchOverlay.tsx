'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ToolSearch from '@/components/ToolSearch';
import { CloseIcon, SearchIcon } from '@/components/icons/UiIcons';

/** Icon button that opens the global search in a modal dialog. Reuses the one
 *  ToolSearch implementation (filterTools). Escape closes, focus is trapped
 *  in the dialog and restored to the button. Ctrl/Cmd+K also opens it. */
export default function SearchOverlay() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
        } else if (e.key === 'Tab' && dialogRef.current) {
          const f = dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input');
          if (f.length === 0) return;
          const first = f[0];
          const last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      document.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener('keydown', onKey);
      };
    } else if (wasOpen.current) {
      wasOpen.current = false;
      buttonRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className="icon-round-btn"
        aria-label="Search tools"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <SearchIcon size={18} />
      </button>
      {open && (
        <div className="search-overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div ref={dialogRef} className="search-overlay-panel" role="dialog" aria-modal="true" aria-label="Search all tools">
            <div className="search-overlay-head">
              <ToolSearch
                idPrefix="overlay"
                variant="large"
                label="Search all tools"
                autoFocus
                onNavigate={() => setOpen(false)}
              />
              <button type="button" className="icon-round-btn" aria-label="Close search" onClick={() => setOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <p className="search-overlay-hint">Press Esc to close</p>
          </div>
        </div>
      )}
    </>
  );
}
