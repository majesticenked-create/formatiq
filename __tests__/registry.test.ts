import { describe, it, expect } from 'vitest';
import { tools } from '../lib/tools/registry';

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

describe('Tool registry — longDescription word count', () => {
  tools.forEach((tool) => {
    it(`${tool.category}/${tool.slug}: longDescription has at least 40 words`, () => {
      const count = wordCount(tool.longDescription);
      expect(count, `${tool.slug} longDescription is only ${count} words (min 40)`).toBeGreaterThanOrEqual(40);
    });
  });
});

describe('Tool registry — structural integrity', () => {
  it('has no duplicate (category, slug) pairs', () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    tools.forEach((tool) => {
      const key = `${tool.category}/${tool.slug}`;
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
    });
    expect(duplicates, `duplicate (category, slug) pairs: ${duplicates.join(', ')}`).toEqual([]);
  });

  tools.forEach((tool) => {
    it(`${tool.category}/${tool.slug}: has at least 2 FAQs`, () => {
      expect(tool.faqs.length).toBeGreaterThanOrEqual(2);
    });
  });
});
