// Pure, framework-free helpers backing components/ToolActionBar.tsx.
// Kept separate from the component so they can be unit tested without a
// DOM-rendering library (this codebase has none - see __tests__/*.test.ts,
// all of which test plain logic/data, not rendered markup).

export type ToolVote = 'helpful' | 'not-helpful';

export const BASE_URL = 'https://formatiq.tools';

/** Namespaced localStorage key for a single tool's stored vote. Scoped per
 * tool - never a cross-tool or cross-site identifier, so it can't function
 * as a fingerprint/visitor id. */
export function voteStorageKey(category: string, slug: string): string {
  return `formatiq:tool-vote:${category}:${slug}`;
}

/** Reads a previously stored vote for this tool, if any. Always safe to
 * call during prerendering / before mount: returns null instead of
 * throwing when localStorage is unavailable (SSR, privacy mode, etc). */
export function getStoredVote(category: string, slug: string): ToolVote | null {
  try {
    const raw = window.localStorage.getItem(voteStorageKey(category, slug));
    if (raw === 'helpful' || raw === 'not-helpful') return raw;
    return null;
  } catch {
    return null;
  }
}

/** Persists (or clears, when vote is null) the user's own vote for this
 * tool. Never throws. */
export function setStoredVote(category: string, slug: string, vote: ToolVote | null): void {
  try {
    const key = voteStorageKey(category, slug);
    if (vote === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, vote);
    }
  } catch {
    // localStorage unavailable (SSR, disabled, private mode quota, etc) -
    // the vote simply isn't persisted this time; the UI still updates.
  }
}

/** Builds the canonical URL for a tool the same way the shared tool page's
 * generateMetadata() does (app/tools/[category]/[slug]/page.tsx), so the
 * action bar never invents a second convention for this. */
export function buildCanonicalUrl(category: string, slug: string): string {
  return `${BASE_URL}/tools/${category}/${slug}`;
}

const FEEDBACK_EMAIL = 'hello@formatiq.tools';

/**
 * Builds a mailto: link pre-filled with tool context and the user's typed
 * message. Every dynamic piece goes through encodeURIComponent, so nothing
 * the user types (or the tool title) can break out of the mailto query
 * string or inject extra header-like fields.
 */
export function buildFeedbackMailto(params: {
  toolTitle: string;
  canonicalUrl: string;
  message: string;
  reason?: string;
}): string {
  const { toolTitle, canonicalUrl, message, reason } = params;
  const subject = `Feedback: ${toolTitle}`;
  const bodyLines = [
    reason ? `Reason: ${reason}` : null,
    message.trim() ? message.trim() : '(no message entered)',
    '',
    `Tool: ${toolTitle}`,
    `URL: ${canonicalUrl}`,
  ].filter((line): line is string => line !== null);

  const params_ = new URLSearchParams({
    subject,
    body: bodyLines.join('\n'),
  });
  // URLSearchParams encodes spaces as "+" (form-encoding); mailto wants
  // %20, so normalize before use.
  const query = params_.toString().replace(/\+/g, '%20');
  return `mailto:${FEEDBACK_EMAIL}?${query}`;
}

/**
 * Generates an honest iframe embed snippet for a tool. Only ever
 * references this tool's own canonical Formatiq URL - never a
 * user-supplied value - so it can't be used to embed arbitrary content.
 */
export function buildEmbedSnippet(canonicalUrl: string, toolTitle: string): string {
  return `<iframe src="${canonicalUrl}" title="${toolTitle} - Formatiq" width="100%" height="640" loading="lazy" style="border:1px solid #e3e6ea;border-radius:12px;"></iframe>`;
}

/**
 * Maps Formatiq's own theme value to the `data-theme` attribute Google's
 * "Add as preferred source" widget (news.google.com/swg/js/v1/publisher.js)
 * accepts on its `google-add-preferred-source-btn` div. Google only
 * documents 'dark' and 'light' (default light) - anything else Formatiq
 * might ever store falls back to 'light' rather than passing through an
 * unrecognized value.
 */
export function preferredSourceTheme(siteTheme: string | null | undefined): 'light' | 'dark' {
  return siteTheme === 'dark' ? 'dark' : 'light';
}

export const IMPROVEMENT_REASONS = [
  'Incorrect result',
  'Hard to use',
  'Missing feature',
  'Confusing explanation',
  'Other',
] as const;

export type ImprovementReason = (typeof IMPROVEMENT_REASONS)[number];
