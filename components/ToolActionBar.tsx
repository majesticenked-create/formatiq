'use client';

import { useEffect, useRef, useState } from 'react';
import {
  buildCanonicalUrl,
  buildEmbedSnippet,
  buildFeedbackMailto,
  getStoredVote,
  setStoredVote,
  preferredSourceTheme,
  IMPROVEMENT_REASONS,
  type ImprovementReason,
  type ToolVote,
} from '@/lib/tools/actionBar';

const THEME_CHANGE_EVENT = 'formatiq-theme-change';

export default function ToolActionBar({
  toolTitle,
  category,
  slug,
}: {
  toolTitle: string;
  category: string;
  slug: string;
}) {
  const canonicalUrl = buildCanonicalUrl(category, slug);

  const [vote, setVote] = useState<ToolVote | null>(null);
  const [reason, setReason] = useState<ImprovementReason | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  // Defaults to 'light' during prerendering/before mount, matching Google's
  // own documented default for the widget - updated client-side once we can
  // read Formatiq's actual theme, and kept in sync with the site's theme
  // toggle (see ThemeToggle.tsx / THEME_CHANGE_EVENT).
  const [preferredSrcTheme, setPreferredSrcTheme] = useState<'light' | 'dark'>('light');

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Restore this viewer's own previously-stored vote once mounted. Never
  // runs during prerendering (this only fires client-side after hydration).
  useEffect(() => {
    setVote(getStoredVote(category, slug));
  }, [category, slug]);

  // Track Formatiq's own theme so the Google widget's `data-theme` attribute
  // doesn't look mismatched. Known limitation: Google's widget is only
  // documented to read `data-theme` at initial render, so a live toggle
  // after the button has already rendered may not restyle the widget itself
  // until next navigation/reload - not something Formatiq controls.
  useEffect(() => {
    setPreferredSrcTheme(preferredSourceTheme(document.documentElement.getAttribute('data-theme')));

    function handleThemeChange(e: Event) {
      setPreferredSrcTheme(preferredSourceTheme((e as CustomEvent<string>).detail));
    }

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  function castVote(next: ToolVote) {
    setVote((current) => {
      const resolved = current === next ? null : next;
      setStoredVote(category, slug, resolved);
      if (resolved !== 'not-helpful') setReason(null);
      return resolved;
    });
  }

  async function handleShare() {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: toolTitle, url: canonicalUrl });
        return;
      } catch {
        // User cancelled the share sheet, or share failed - fall through
        // to the clipboard fallback so the action still does something.
      }
    }
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 1800);
    } catch {
      // Clipboard unavailable - nothing more we can honestly do here.
    }
  }

  function openFeedback() {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setFeedbackOpen(true);
  }

  function closeFeedback() {
    setFeedbackOpen(false);
    lastFocusedRef.current?.focus?.();
  }

  useEffect(() => {
    if (!feedbackOpen) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeFeedback();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackOpen]);

  const mailtoHref = buildFeedbackMailto({
    toolTitle,
    canonicalUrl,
    message: feedbackMessage,
    reason: reason ?? undefined,
  });

  const embedSnippet = buildEmbedSnippet(canonicalUrl, toolTitle);

  return (
    <div className="container tool-action-bar-wrap">
      <div className="tool-action-bar">
        <div className="tool-action-vote">
          <span className="tool-action-vote-label">Was this tool helpful?</span>
          <div className="tool-action-vote-buttons">
            <button
              type="button"
              className={`tool-action-btn tool-action-vote-btn${vote === 'helpful' ? ' is-helpful' : ''}`}
              aria-pressed={vote === 'helpful'}
              aria-label="This tool was helpful"
              onClick={() => castVote('helpful')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0 4.5-8a2 2 0 0 1 2.7 2l-.9 4.5H18a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.9 20H10a3 3 0 0 1-3-3v-6z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              Helpful
            </button>
            <button
              type="button"
              className={`tool-action-btn tool-action-vote-btn${vote === 'not-helpful' ? ' is-not-helpful' : ''}`}
              aria-pressed={vote === 'not-helpful'}
              aria-label="This tool was not helpful"
              onClick={() => castVote('not-helpful')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3zm0 0-4.5 8a2 2 0 0 1-2.7-2l.9-4.5H6a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 7.1 4H14a3 3 0 0 1 3 3v6z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              Not helpful
            </button>
          </div>
          {vote === 'helpful' && <p className="tool-action-ack">Thanks for the feedback.</p>}
          {vote === 'not-helpful' && (
            <div className="tool-action-ack">
              <p>Thanks — tell us what we could improve.</p>
              <div className="tool-action-reasons" role="group" aria-label="What could be improved">
                {IMPROVEMENT_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`tool-action-reason-chip${reason === r ? ' is-selected' : ''}`}
                    aria-pressed={reason === r}
                    onClick={() => setReason((current) => (current === r ? null : r))}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="tool-action-buttons">
          <button type="button" className="tool-action-btn" onClick={openFeedback}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            Feedback
          </button>
          <button type="button" className="tool-action-btn" onClick={handleShare}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {shareStatus === 'copied' ? 'Link copied' : 'Share'}
          </button>
          <button type="button" className="tool-action-btn" onClick={() => setEmbedOpen((v) => !v)} aria-expanded={embedOpen}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Embed
          </button>
        </div>
      </div>

      <div className="tool-action-preferred-source">
        <span className="tool-action-preferred-source-label">Prefer Formatiq on Google Search</span>
        <div
          className="tool-action-preferred-source-btn"
          google-add-preferred-source-btn=""
          data-theme={preferredSrcTheme}
        />
      </div>

      {embedOpen && (
        <div className="tool-action-embed">
          <p className="tool-action-embed-hint">Paste this snippet to embed this tool on your own page:</p>
          <pre className="tool-action-embed-code">
            <code>{embedSnippet}</code>
          </pre>
          <button
            type="button"
            className="tool-action-btn"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(embedSnippet);
                setEmbedCopied(true);
                setTimeout(() => setEmbedCopied(false), 1800);
              } catch {
                // Clipboard unavailable - the snippet is still selectable/copyable by hand.
              }
            }}
          >
            {embedCopied ? 'Copied!' : 'Copy snippet'}
          </button>
        </div>
      )}

      {feedbackOpen && (
        <div className="tool-action-dialog-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeFeedback()}>
          <div
            className="tool-action-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tool-feedback-title"
            ref={dialogRef}
          >
            <div className="tool-action-dialog-header">
              <h2 id="tool-feedback-title">Send feedback about {toolTitle}</h2>
              <button
                type="button"
                className="tool-action-dialog-close"
                aria-label="Close feedback panel"
                onClick={closeFeedback}
                ref={closeButtonRef}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="tool-action-dialog-note">
              Formatiq has no live support inbox for this yet - this opens an email pre-filled with your message and
              the tool link, so nothing is sent unless you send it.
            </p>
            <label htmlFor="tool-feedback-message">Your message</label>
            <textarea
              id="tool-feedback-message"
              rows={4}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="What happened, or what would make this tool better?"
            />
            <div className="tool-action-dialog-actions">
              <a href={mailtoHref} className="btn btn-primary" onClick={closeFeedback}>
                Open email to send
              </a>
              <a href={`/contact?tool=${encodeURIComponent(`${category}/${slug}`)}`} className="btn btn-secondary">
                Or use the Contact page
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
