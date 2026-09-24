import { describe, it, expect } from 'vitest';
import { categories, tools } from '../lib/tools/registry';
import { getActiveCategorySlug } from '../lib/tools/navigation';

describe('Site header — CategoryNav data source', () => {
  it('every category rendered comes from the real registry (non-empty, real slugs)', () => {
    expect(categories.length).toBeGreaterThan(0);
    categories.forEach((category) => {
      expect(typeof category.slug).toBe('string');
      expect(category.slug.length).toBeGreaterThan(0);
      expect(typeof category.navLabel).toBe('string');
      expect(category.navLabel.length).toBeGreaterThan(0);
    });
  });

  it('every category link points at a real /tools/{slug} route with at least one tool', () => {
    categories.forEach((category) => {
      const toolCount = tools.filter((t) => t.category === category.slug).length;
      expect(toolCount, `category ${category.slug} has no tools - its nav link would be a dead route`).toBeGreaterThan(
        0
      );
    });
  });

  it('has no duplicate category slugs (would render duplicate nav links)', () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    categories.forEach((c) => {
      if (seen.has(c.slug)) duplicates.push(c.slug);
      seen.add(c.slug);
    });
    expect(duplicates).toEqual([]);
  });

  it('every tool.category value resolves to a real category slug (no dead category references)', () => {
    const validSlugs = new Set(categories.map((c) => c.slug));
    tools.forEach((tool) => {
      expect(validSlugs.has(tool.category), `${tool.slug} references unknown category "${tool.category}"`).toBe(
        true
      );
    });
  });
});

describe('Site header — active category matching (getActiveCategorySlug)', () => {
  const slugs = categories.map((c) => c.slug);
  const firstSlug = slugs[0];

  it('matches a category index path', () => {
    expect(getActiveCategorySlug(`/tools/${firstSlug}`, slugs)).toBe(firstSlug);
  });

  it('matches a category tool-detail path (nested one level deeper)', () => {
    expect(getActiveCategorySlug(`/tools/${firstSlug}/some-tool-slug`, slugs)).toBe(firstSlug);
  });

  it('returns null for the homepage', () => {
    expect(getActiveCategorySlug('/', slugs)).toBeNull();
  });

  it('returns null for non-tool pages (about/contact/legal/sitemap)', () => {
    ['/about', '/contact', '/privacy', '/terms', '/cookies', '/accessibility', '/sitemap-page'].forEach((path) => {
      expect(getActiveCategorySlug(path, slugs)).toBeNull();
    });
  });

  it('returns null for a /tools/ segment that is not a real category slug', () => {
    expect(getActiveCategorySlug('/tools/not-a-real-category', slugs)).toBeNull();
  });

  it('returns null for an empty pathname', () => {
    expect(getActiveCategorySlug('', slugs)).toBeNull();
  });

  it('every real category slug is correctly matched as active on its own route', () => {
    categories.forEach((category) => {
      expect(getActiveCategorySlug(`/tools/${category.slug}`, slugs)).toBe(category.slug);
    });
  });
});
