/**
 * Pure matching logic behind the site-wide header's category nav active-state.
 * Kept separate from the CategoryNav client component so the route-matching
 * behavior can be unit-tested without rendering React or mocking a router.
 */
export function getActiveCategorySlug(pathname: string, categorySlugs: string[]): string | null {
  const match = pathname.match(/^\/tools\/([^/]+)/);
  if (!match) return null;
  const candidate = match[1];
  return categorySlugs.includes(candidate) ? candidate : null;
}

/** Where "Browse all tools" points. There is no /tools index route; the
 *  sitemap page already lists every tool by category. */
export const ALL_TOOLS_HREF = '/sitemap-page';

/** Section ids on the homepage that header nav links deep-link to. */
export const HOME_SECTION_IDS = {
  popular: 'popular-tools',
  new: 'new-additions',
  categories: 'categories',
} as const;

export type HeaderNavItem =
  | { type: 'link'; label: string; href: string }
  | { type: 'categories'; label: string };

/** Single source of truth for the header (desktop + mobile menu) nav order.
 *  No Blog/About entries: there is no blog route, and About lives in the footer. */
export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { type: 'link', label: 'Tools', href: ALL_TOOLS_HREF },
  { type: 'categories', label: 'Categories' },
  { type: 'link', label: 'New', href: `/#${HOME_SECTION_IDS.new}` },
  { type: 'link', label: 'Popular', href: `/#${HOME_SECTION_IDS.popular}` },
];
