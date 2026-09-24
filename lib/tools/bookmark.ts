// Pure helpers backing components/layout/BookmarkHelper.tsx.
// JavaScript cannot create a browser bookmark, so nothing here pretends to:
// we only choose which instructions to show and offer a "copy URL" action.

import { BASE_URL } from './actionBar';

/** Always the production URL - never the current page URL (localhost/preview). */
export const BOOKMARK_URL = BASE_URL;

export type BookmarkPlatform = 'mac' | 'other' | 'mobile' | 'unknown';

export interface PlatformInput {
  /** navigator.userAgentData?.platform, else navigator.platform */
  platform?: string | null;
  userAgent?: string | null;
  maxTouchPoints?: number | null;
}

const MOBILE_RE = /iphone|ipad|ipod|android|mobile|windows phone|blackberry|opera mini/i;

/**
 * Minimal platform detection used ONLY to choose the shortcut text.
 * iPadOS Safari reports "MacIntel" with touch points, so a Mac platform with
 * maxTouchPoints > 1 is treated as mobile (touch) rather than as a Mac.
 */
export function detectBookmarkPlatform(input: PlatformInput): BookmarkPlatform {
  const platform = (input.platform ?? '').trim();
  const ua = (input.userAgent ?? '').trim();
  if (!platform && !ua) return 'unknown';
  const hay = `${platform} ${ua}`;
  if (MOBILE_RE.test(hay)) return 'mobile';
  if (/mac/i.test(platform) || (!platform && /macintosh|mac os x/i.test(ua))) {
    return (input.maxTouchPoints ?? 0) > 1 ? 'mobile' : 'mac';
  }
  if (/win|linux|x11|cros|chrome os|bsd/i.test(hay)) return 'other';
  return 'unknown';
}

export interface BookmarkInstructions {
  /** Keyboard shortcut, or null when none should be shown (mobile). */
  shortcut: string | null;
  /** Main guidance line. */
  hint: string;
}

const MENU_HINT = "You can bookmark this page from your browser's menu.";

export function getBookmarkInstructions(platform: BookmarkPlatform): BookmarkInstructions {
  switch (platform) {
    case 'mac':
      return { shortcut: '⌘ + D', hint: MENU_HINT };
    case 'other':
      return { shortcut: 'Ctrl + D', hint: MENU_HINT };
    case 'mobile':
      return {
        shortcut: null,
        hint: "Use your browser's menu and choose Add Bookmark, Add to Favorites, or Add to Home Screen.",
      };
    default:
      return { shortcut: null, hint: `Press ⌘ + D on Mac or Ctrl + D on Windows/Linux. ${MENU_HINT}` };
  }
}

export interface ClipboardLike {
  writeText?: (text: string) => Promise<void>;
}

/** Resolves true only after the clipboard promise resolves; false on any failure. */
export async function copyBookmarkUrl(clipboard: ClipboardLike | null | undefined): Promise<boolean> {
  if (!clipboard || typeof clipboard.writeText !== 'function') return false;
  try {
    await clipboard.writeText(BOOKMARK_URL);
    return true;
  } catch {
    return false;
  }
}
