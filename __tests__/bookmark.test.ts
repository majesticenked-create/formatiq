import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BOOKMARK_URL,
  copyBookmarkUrl,
  detectBookmarkPlatform,
  getBookmarkInstructions,
} from '../lib/tools/bookmark';

const UA = {
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  win: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120.0',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile Safari/537.36',
};

describe('detectBookmarkPlatform', () => {
  it('mac', () => expect(detectBookmarkPlatform({ platform: 'MacIntel', userAgent: UA.mac, maxTouchPoints: 0 })).toBe('mac'));
  it('mac via userAgentData platform "macOS"', () =>
    expect(detectBookmarkPlatform({ platform: 'macOS', userAgent: UA.mac })).toBe('mac'));
  it('windows', () => expect(detectBookmarkPlatform({ platform: 'Win32', userAgent: UA.win })).toBe('other'));
  it('linux', () => expect(detectBookmarkPlatform({ platform: 'Linux x86_64', userAgent: UA.linux })).toBe('other'));
  it('iPhone', () => expect(detectBookmarkPlatform({ platform: 'iPhone', userAgent: UA.iphone, maxTouchPoints: 5 })).toBe('mobile'));
  it('Android', () => expect(detectBookmarkPlatform({ platform: 'Linux armv81', userAgent: UA.android, maxTouchPoints: 5 })).toBe('mobile'));
  it('iPadOS reporting as Mac (touch) is not treated as a Mac', () =>
    expect(detectBookmarkPlatform({ platform: 'MacIntel', userAgent: UA.mac, maxTouchPoints: 5 })).toBe('mobile'));
  it('unknown when nothing is available or unrecognised', () => {
    expect(detectBookmarkPlatform({})).toBe('unknown');
    expect(detectBookmarkPlatform({ platform: '', userAgent: '' })).toBe('unknown');
    expect(detectBookmarkPlatform({ platform: 'Plan9', userAgent: 'x' })).toBe('unknown');
  });
});

describe('getBookmarkInstructions', () => {
  it('shows the right shortcut per platform', () => {
    expect(getBookmarkInstructions('mac').shortcut).toBe('⌘ + D');
    expect(getBookmarkInstructions('other').shortcut).toBe('Ctrl + D');
  });
  it('mobile never yields a desktop shortcut', () => {
    const m = getBookmarkInstructions('mobile');
    expect(m.shortcut).toBeNull();
    expect(m.hint).not.toMatch(/⌘|Ctrl/);
    expect(m.hint).toMatch(/Add to Home Screen/);
  });
  it('unknown shows generic both-platform guidance', () => {
    const u = getBookmarkInstructions('unknown');
    expect(u.shortcut).toBeNull();
    expect(u.hint).toContain('Press ⌘ + D on Mac or Ctrl + D on Windows/Linux.');
  });
});

describe('copyBookmarkUrl', () => {
  it('canonical URL is exactly the production origin', () => expect(BOOKMARK_URL).toBe('https://formatiq.tools'));
  it('copies the canonical URL and resolves true', async () => {
    const written: string[] = [];
    const ok = await copyBookmarkUrl({ writeText: async (t) => void written.push(t) });
    expect(ok).toBe(true);
    expect(written).toEqual(['https://formatiq.tools']);
  });
  it('resolves false when the clipboard rejects', async () => {
    expect(await copyBookmarkUrl({ writeText: () => Promise.reject(new Error('denied')) })).toBe(false);
  });
  it('resolves false when the Clipboard API is unavailable', async () => {
    expect(await copyBookmarkUrl(undefined)).toBe(false);
    expect(await copyBookmarkUrl({})).toBe(false);
  });
});

describe('BookmarkHelper source guard', () => {
  const src = readFileSync(join(__dirname, '../components/layout/BookmarkHelper.tsx'), 'utf8');
  const lib = readFileSync(join(__dirname, '../lib/tools/bookmark.ts'), 'utf8');
  it('has disclosure a11y wiring and Escape handling', () => {
    expect(src).toContain('aria-expanded');
    expect(src).toContain('aria-controls');
    expect(src).toContain("'Escape'");
    expect(src).toContain('"Bookmark Formatiq"');
  });
  it('never claims a bookmark was made, uses no legacy APIs, persists nothing', () => {
    for (const s of [src, lib]) {
      expect(s).not.toMatch(/AddFavorite|addPanel|Bookmarked!/);
      expect(s).not.toMatch(/localStorage|sessionStorage|document\.cookie/);
      expect(s).not.toMatch(/window\.location/);
    }
  });
  it('is placed in the shared header and the mobile menu', () => {
    expect(readFileSync(join(__dirname, '../components/layout/SiteHeader.tsx'), 'utf8')).toContain('<BookmarkHelper />');
    expect(readFileSync(join(__dirname, '../components/layout/MobileMenu.tsx'), 'utf8')).toContain('BookmarkHelper');
  });
});
