import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { categories, tools } from '../lib/tools/registry';
import {
  ALL_TOOLS_HREF,
  HEADER_NAV_ITEMS,
  HOME_SECTION_IDS,
  getActiveCategorySlug,
} from '../lib/tools/navigation';
import { getCategoryIcon } from '../components/icons/CategoryIcons';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('Header nav targets are real', () => {
  it('ALL_TOOLS_HREF is an existing route', () => {
    expect(ALL_TOOLS_HREF).toBe('/sitemap-page');
    expect(existsSync(join(root, 'app/sitemap-page/page.tsx'))).toBe(true);
  });

  it('every hash link targets a section id that is rendered on the homepage', () => {
    const page = read('app/page.tsx');
    HEADER_NAV_ITEMS.forEach((item) => {
      if (item.type !== 'link' || !item.href.startsWith('/#')) return;
      const id = item.href.slice(2);
      const key = (Object.keys(HOME_SECTION_IDS) as Array<keyof typeof HOME_SECTION_IDS>).find(
        (k) => HOME_SECTION_IDS[k] === id
      );
      expect(key, `no HOME_SECTION_IDS entry for #${id}`).toBeDefined();
      expect(page).toContain(`HOME_SECTION_IDS.${key}`);
    });
  });

  it('categories anchor is rendered by CategoryDirectory', () => {
    expect(read('components/home/CategoryDirectory.tsx')).toContain('HOME_SECTION_IDS.categories');
  });

  it('non-hash link hrefs resolve to an app route', () => {
    HEADER_NAV_ITEMS.forEach((item) => {
      if (item.type !== 'link' || item.href.includes('#')) return;
      expect(existsSync(join(root, 'app', item.href, 'page.tsx')), item.href).toBe(true);
    });
  });

  it('has the expected order and includes a Categories menu', () => {
    expect(HEADER_NAV_ITEMS.map((i) => i.label)).toEqual(['Tools', 'Categories', 'New', 'Popular']);
  });

  it('shows no Blog link unless a real blog route exists', () => {
    const hasBlog = existsSync(join(root, 'app/blog'));
    const labels = HEADER_NAV_ITEMS.map((i) => i.label);
    if (!hasBlog) expect(labels).not.toContain('Blog');
    if (!hasBlog) expect(read('components/Footer.tsx')).not.toMatch(/href="\/blog/);
  });
});

describe('Category menu still detects the active category', () => {
  const slugs = categories.map((c) => c.slug);
  it('marks each category route active and everything else inactive', () => {
    slugs.forEach((slug) => {
      expect(getActiveCategorySlug(`/tools/${slug}`, slugs)).toBe(slug);
      expect(getActiveCategorySlug(`/tools/${slug}/anything`, slugs)).toBe(slug);
    });
    expect(getActiveCategorySlug('/', slugs)).toBeNull();
    expect(getActiveCategorySlug('/about', slugs)).toBeNull();
    expect(getActiveCategorySlug('/tools/nope', slugs)).toBeNull();
  });

  it('header menus read categories from the registry and mark aria-current', () => {
    ['components/layout/HeaderNav.tsx', 'components/layout/MobileMenu.tsx'].forEach((f) => {
      const src = read(f);
      expect(src).toContain("from '@/lib/tools/registry'");
      expect(src).toContain('getActiveCategorySlug');
      expect(src).toContain("aria-current={isActive ? 'page' : undefined}");
    });
  });

  it('search overlay reuses the single ToolSearch implementation (which uses filterTools)', () => {
    expect(read('components/layout/SearchOverlay.tsx')).toContain("from '@/components/ToolSearch'");
    expect(read('components/ToolSearch.tsx')).toContain('filterTools');
  });
});

describe('Homepage data comes from the registry', () => {
  it('stats row derives tool and category counts from the registry (no literals)', () => {
    const src = read('components/home/StatsRow.tsx');
    expect(src).toContain('tools.length');
    expect(src).toMatch(/new Set\(tools\.map/);
  });

  it('every category has a real icon and at least one tool', () => {
    categories.forEach((c) => {
      expect(typeof getCategoryIcon(c.slug)).toBe('function');
      expect(tools.some((t) => t.category === c.slug)).toBe(true);
    });
  });

  it('the hero CTA/preview target (json-formatter) exists in the registry', () => {
    expect(tools.some((t) => t.category === 'formatters' && t.slug === 'json-formatter')).toBe(true);
  });

  it('popular and new selections resolve to registry tools', () => {
    const popular = tools.filter((t) => t.isPopular);
    const fresh = tools.filter((t) => t.isNew).slice(0, 5);
    expect(popular.length).toBeGreaterThan(0);
    expect(fresh.length).toBeGreaterThan(0);
    [...popular, ...fresh].forEach((t) => expect(tools.includes(t)).toBe(true));
  });
});

describe('Honest-claims guard (source level)', () => {
  const files = [
    'app/page.tsx',
    'app/layout.tsx',
    'components/Footer.tsx',
    'components/home/StatsRow.tsx',
    'components/home/HeroPreview.tsx',
  ];
  it('never claims 100% client-side / nothing leaves the browser / free forever', () => {
    files.forEach((f) => {
      const src = read(f);
      expect(src, f).not.toMatch(/100%/);
      expect(src, f).not.toMatch(/nothing you paste is ever uploaded/i);
      expect(src, f).not.toMatch(/free forever/i);
    });
  });

  it('hero preview is presentational: aria-hidden mock, no <button>', () => {
    const src = read('components/home/HeroPreview.tsx');
    expect(src).toContain('aria-hidden="true"');
    expect(src).not.toMatch(/<button/);
  });
});
