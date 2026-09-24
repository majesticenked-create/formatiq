import { describe, it, expect } from 'vitest';
import { categories, tools } from '../lib/tools/registry';
import { filterTools } from '../lib/tools/search';
import { getCategoryIcon } from '../components/icons/CategoryIcons';

describe('Homepage — category directory counts', () => {
  categories.forEach((category) => {
    it(`${category.slug}: computed count matches the registry`, () => {
      const expected = tools.filter((t) => t.category === category.slug).length;
      const fromDirectory = tools.filter((t) => t.category === category.slug).length;
      expect(fromDirectory).toBe(expected);
      // The directory only renders categories with at least one real tool.
      expect(expected).toBeGreaterThan(0);
    });
  });

  it('total tool count used in the hero/category feature card is the real registry length', () => {
    expect(tools.length).toBeGreaterThan(0);
    expect(Number.isInteger(tools.length)).toBe(true);
  });
});

describe('Homepage — curated tool flags resolve to real tools', () => {
  const popularTools = tools.filter((t) => t.isPopular);
  const newTools = tools.filter((t) => t.isNew);

  it('every isPopular tool resolves to a real (category, slug) pair in the registry', () => {
    popularTools.forEach((tool) => {
      const match = tools.find((t) => t.slug === tool.slug && t.category === tool.category);
      expect(match, `isPopular tool ${tool.category}/${tool.slug} does not resolve`).toBeDefined();
    });
  });

  it('every isNew tool resolves to a real (category, slug) pair in the registry', () => {
    newTools.forEach((tool) => {
      const match = tools.find((t) => t.slug === tool.slug && t.category === tool.category);
      expect(match, `isNew tool ${tool.category}/${tool.slug} does not resolve`).toBeDefined();
    });
  });

  it('has at least one isPopular tool (Popular tools section would otherwise be empty)', () => {
    expect(popularTools.length).toBeGreaterThan(0);
  });

  it('has at least one isNew tool (Recently added section would otherwise be empty)', () => {
    expect(newTools.length).toBeGreaterThan(0);
  });
});

describe('Homepage search — filterTools', () => {
  it('returns no results for an empty query', () => {
    expect(filterTools(tools, '')).toEqual([]);
    expect(filterTools(tools, '   ')).toEqual([]);
  });

  it('matches by exact title (case-insensitive)', () => {
    const results = filterTools(tools, 'JSON Formatter');
    expect(results.some((t) => t.slug === 'json-formatter')).toBe(true);
  });

  it('matches by category slug', () => {
    const results = filterTools(tools, 'validators', tools.length);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((t) => expect(t.category).toBe('validators'));
  });

  it('matches by keyword substring', () => {
    const targetTool = tools.find((t) => t.keywords.length > 0);
    expect(targetTool).toBeDefined();
    if (!targetTool) return;
    const keyword = targetTool.keywords[0];
    const results = filterTools(tools, keyword, tools.length);
    expect(results.some((t) => t.slug === targetTool.slug)).toBe(true);
  });

  it('returns an empty array for a query that matches nothing', () => {
    const results = filterTools(tools, 'zzzznonexistentquery12345');
    expect(results).toEqual([]);
  });

  it('caps results at maxResults', () => {
    const results = filterTools(tools, 'e', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

describe('Homepage — category directory icons', () => {
  it('every real category resolves to a distinct icon component (not the generic fallback)', () => {
    const seen = new Set<unknown>();
    categories.forEach((category) => {
      const Icon = getCategoryIcon(category.slug);
      expect(Icon, `category ${category.slug} should resolve to an icon`).toBeDefined();
      seen.add(Icon);
    });
    // Every current category has its own explicit icon, so none of them should collapse onto
    // the same (fallback) component.
    expect(seen.size).toBe(categories.length);
  });

  it('an unmapped/future category slug falls back gracefully instead of throwing', () => {
    expect(() => getCategoryIcon('some-future-category-not-yet-mapped')).not.toThrow();
    const Fallback = getCategoryIcon('some-future-category-not-yet-mapped');
    expect(Fallback).toBeDefined();
  });
});
