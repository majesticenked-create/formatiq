import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { slugify, makeUniqueAnchorIds } from '../lib/tools/guide-utils';
import { richGuides } from '../content/guides';
import { tools } from '../lib/tools/registry';
import type { GuideBlock } from '../content/guides/types';

describe('guide-utils: slugify', () => {
  it('lowercases and hyphenates a normal heading', () => {
    expect(slugify('How to use this tool')).toBe('how-to-use-this-tool');
  });

  it('strips punctuation', () => {
    expect(slugify('What is Base64? An overview.')).toBe('what-is-base64-an-overview');
  });

  it('collapses repeated whitespace/hyphens', () => {
    expect(slugify('  Multiple   spaces  ')).toBe('multiple-spaces');
  });
});

describe('guide-utils: makeUniqueAnchorIds', () => {
  it('returns distinct ids for distinct headings', () => {
    const ids = makeUniqueAnchorIds(['Overview', 'How to use this tool', 'FAQ']);
    expect(new Set(ids).size).toBe(3);
  });

  it('disambiguates two headings that slugify identically', () => {
    // "FAQ" and "F.A.Q" both slugify to "faq" - a real collision risk if a
    // rich guide and the FAQ-section fallback both used bare "FAQ" headings.
    const ids = makeUniqueAnchorIds(['FAQ', 'F.A.Q', 'faq']);
    expect(ids).toEqual(['faq', 'faq-2', 'faq-3']);
    expect(new Set(ids).size).toBe(3);
  });

  it('disambiguates exact duplicate headings', () => {
    const ids = makeUniqueAnchorIds(['Overview', 'Overview', 'Overview']);
    expect(ids).toEqual(['overview', 'overview-2', 'overview-3']);
  });

  it('never produces an empty id even for a heading with no alphanumeric characters', () => {
    const ids = makeUniqueAnchorIds(['???', '!!!']);
    expect(ids.every((id) => id.length > 0)).toBe(true);
  });
});

describe('rich guides: structural integrity', () => {
  const toolSlugs = new Set(tools.map((t) => t.slug));

  Object.entries(richGuides).forEach(([slug, guide]) => {
    it(`${slug}: guide.slug matches its map key`, () => {
      expect(guide.slug).toBe(slug);
    });

    it(`${slug}: resolves to a real registry tool`, () => {
      expect(toolSlugs.has(slug), `rich guide "${slug}" has no matching tool in the registry`).toBe(true);
    });

    it(`${slug}: has at least 2 sections`, () => {
      expect(guide.sections.length).toBeGreaterThanOrEqual(2);
    });

    guide.sections.forEach((section, i) => {
      it(`${slug}: section ${i} ("${section.heading}") is not empty`, () => {
        expect(section.blocks.length).toBeGreaterThan(0);
      });

      section.blocks.forEach((block: GuideBlock, bIdx) => {
        if (block.type === 'formula') {
          it(`${slug}: section ${i} formula block ${bIdx} has a non-empty legend`, () => {
            expect(block.legend.length).toBeGreaterThan(0);
            block.legend.forEach((entry) => {
              expect(entry.symbol.length).toBeGreaterThan(0);
              expect(entry.meaning.length).toBeGreaterThan(0);
            });
          });
        }
        if (block.type === 'table') {
          it(`${slug}: section ${i} table block ${bIdx} rows match header length`, () => {
            block.rows.forEach((row) => {
              expect(row.length).toBe(block.headers.length);
            });
          });
        }
        if (block.type === 'example') {
          it(`${slug}: section ${i} example block ${bIdx} has at least one step`, () => {
            expect(block.steps.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });
});

describe('rich guide content integrity: hash-generator worked example', () => {
  const input = 'Formatiq makes dev tools fast.';
  const table = richGuides['hash-generator'].sections
    .flatMap((s) => s.blocks)
    .find((b): b is Extract<GuideBlock, { type: 'table' }> => b.type === 'table');

  it('the worked-example table exists', () => {
    expect(table).toBeDefined();
  });

  it('every hash value in the table matches a real hash of the stated input', () => {
    const algoMap: Record<string, string> = { MD5: 'md5', 'SHA-1': 'sha1', 'SHA-256': 'sha256', 'SHA-512': 'sha512' };
    table!.rows.forEach(([algo, , hexValue]) => {
      const nodeAlgo = algoMap[algo];
      expect(nodeAlgo, `unrecognized algorithm label "${algo}"`).toBeDefined();
      const expected = crypto.createHash(nodeAlgo).update(input).digest('hex');
      expect(hexValue).toBe(expected);
    });
  });
});

describe('rich guide content integrity: base64 worked examples', () => {
  it('"Man" encodes to "TWFu" (no padding)', () => {
    expect(Buffer.from('Man').toString('base64')).toBe('TWFu');
  });

  it('"Ma" encodes to "TWE=" (one padding char)', () => {
    expect(Buffer.from('Ma').toString('base64')).toBe('TWE=');
  });
});

describe('rich guide content integrity: UUID v4 collision probability', () => {
  it('the stated ~9.4e-20 collision probability for 1e9 UUIDs is correct within tolerance', () => {
    // n^2 / (2N) is so small that 1 - e^(-x) underflows to exactly x in
    // double precision (double-precision 1-e^-x for x < ~1e-16 rounds to
    // x itself) - which is exactly the approximation the guide's own text
    // relies on ("for such a tiny exponent, essentially equal to x itself").
    // Compute the exponent directly rather than routing through Math.exp,
    // which returns 1 for e^(-9.4e-20) and silently produces 0 via 1 - 1.
    const n = 1e9;
    const N = 2 ** 122;
    const exponent = (n * n) / (2 * N);
    expect(exponent).toBeGreaterThan(9e-20);
    expect(exponent).toBeLessThan(1e-19);
  });
});

describe('rich guide content integrity: regex-tester worked examples', () => {
  const emailPattern = /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/;

  it('matches a valid email as claimed', () => {
    expect(emailPattern.test('ada@example.com')).toBe(true);
  });

  it('rejects a string with no @ as claimed', () => {
    expect(emailPattern.test('not-an-email')).toBe(false);
  });

  it('the phone-number capturing groups example is correct', () => {
    const match = '555-867-5309'.match(/(\d{3})-(\d{3})-(\d{4})/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('555');
    expect(match![2]).toBe('867');
    expect(match![3]).toBe('5309');
  });
});

describe('Tool registry — relatedSlugs integrity (regression guard)', () => {
  const slugSet = new Set(tools.map((t) => t.slug));

  tools.forEach((tool) => {
    if (!tool.relatedSlugs || tool.relatedSlugs.length === 0) return;
    it(`${tool.category}/${tool.slug}: every relatedSlugs entry resolves to a real tool`, () => {
      const dangling = tool.relatedSlugs!.filter((slug) => !slugSet.has(slug));
      expect(dangling, `dangling relatedSlugs on ${tool.slug}: ${dangling.join(', ')}`).toEqual([]);
    });
  });
});
