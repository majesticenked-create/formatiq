'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { BookmarkIcon } from '@/components/icons/UiIcons';
import {
  BOOKMARK_URL,
  copyBookmarkUrl,
  detectBookmarkPlatform,
  getBookmarkInstructions,
  type BookmarkPlatform,
} from '@/lib/tools/bookmark';

type NavigatorWithUAData = Navigator & { userAgentData?: { platform?: string } };

function readPlatform(): BookmarkPlatform {
  if (typeof navigator === 'undefined') return 'unknown';
  const nav = navigator as NavigatorWithUAData;
  return detectBookmarkPlatform({
    platform: nav.userAgentData?.platform || nav.platform,
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
  });
}

type CopyState = 'idle' | 'copied' | 'failed';

/**
 * "Bookmark us" helper. Browsers do not let a page create a bookmark, so this
 * only opens a small panel with instructions and a Copy URL action. Follows the
 * HeaderNav disclosure pattern (aria-expanded/aria-controls, Escape returns
 * focus to the button, outside click closes). Nothing is stored or sent.
 * variant "menu" renders inside the mobile menu, where the panel is inline.
 */
export default function BookmarkHelper({ variant = 'header' }: { variant?: 'header' | 'menu' }) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<BookmarkPlatform>('unknown');
  const [copy, setCopy] = useState<CopyState>('idle');
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = `bookmark-helper-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    setPlatform(readPlatform());
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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

  async function onCopy() {
    const ok = await copyBookmarkUrl(typeof navigator !== 'undefined' ? navigator.clipboard : undefined);
    setCopy(ok ? 'copied' : 'failed');
    if (timerRef.current) clearTimeout(timerRef.current);
    if (ok) timerRef.current = setTimeout(() => setCopy('idle'), 1800);
  }

  const { shortcut, hint } = getBookmarkInstructions(platform);

  return (
    <div className={`bookmark-helper bookmark-helper--${variant}`} ref={wrapRef}>
      <button
        type="button"
        ref={buttonRef}
        className="bookmark-btn"
        aria-label="Bookmark Formatiq"
        title="Bookmark Formatiq"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <BookmarkIcon size={18} />
        <span className="bookmark-btn-label">Bookmark us</span>
      </button>
      {open && (
        <div id={panelId} role="dialog" aria-label="Bookmark Formatiq" className="bookmark-panel">
          <p className="bookmark-panel-title">Bookmark Formatiq</p>
          <p className="bookmark-panel-text">Save Formatiq.tools so your favorite tools are one shortcut away.</p>
          {shortcut && <kbd className="bookmark-shortcut">{shortcut}</kbd>}
          <p className="bookmark-panel-hint">{hint}</p>
          <button type="button" className="btn btn-secondary bookmark-copy" onClick={onCopy}>
            Copy URL
          </button>
          <p className="bookmark-status" role="status" aria-live="polite">
            {copy === 'copied' && 'URL copied'}
            {copy === 'failed' && "Couldn't copy - select and copy:"}
          </p>
          {copy === 'failed' && (
            <input
              className="bookmark-url"
              readOnly
              value={BOOKMARK_URL}
              aria-label="Formatiq URL"
              onFocus={(e) => e.currentTarget.select()}
              autoFocus
            />
          )}
        </div>
      )}
    </div>
  );
}
