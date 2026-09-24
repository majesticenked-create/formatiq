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
