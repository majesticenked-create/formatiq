/**
 * Pure helpers for building a table-of-contents from a list of heading
 * strings. Kept dependency-free and framework-agnostic so it can be unit
 * tested directly (see __tests__/tool-guide.test.ts).
 */

/** Slugify a heading into a URL-safe anchor id fragment (no uniqueness handling). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Slugify a list of headings into unique anchor ids, in order. Collisions
 * (including a heading that slugifies to the same value as an earlier one,
 * or two distinct headings that happen to slugify identically) get a
 * numeric suffix: "overview", "overview-2", "overview-3", ...
 */
export function makeUniqueAnchorIds(headings: string[]): string[] {
  const counts = new Map<string, number>();
  return headings.map((heading) => {
    const base = slugify(heading) || 'section';
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  });
}
