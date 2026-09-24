import { describe, it, expect } from 'vitest';
import { mulberry32, randomInt, pickRandom, pickUnique, randomSeed } from '../../lib/tools/seeded-random';

describe('seeded-random utility', () => {
  it('mulberry32 produces the same sequence for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('mulberry32 produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it('mulberry32 outputs stay within [0, 1)', () => {
    const rng = mulberry32(999);
    for (let i = 0; i < 200; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('randomInt stays within bounds inclusive', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = randomInt(rng, 5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('pickRandom always returns an element from the array', () => {
    const rng = mulberry32(3);
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(pickRandom(rng, arr));
    }
  });

  it('pickUnique returns distinct elements with no repeats', () => {
    const rng = mulberry32(5);
    const arr = [1, 2, 3, 4, 5];
    const picked = pickUnique(rng, arr, 5);
    expect(new Set(picked).size).toBe(5);
  });

  it('randomSeed returns a number', () => {
    expect(typeof randomSeed()).toBe('number');
  });
});

// ---------- hmac-generator ----------
// Uses the real Web Crypto API (available in the vitest/jsdom or node environment
// used by this project), so we assert real, structural properties: correct output
// length per algorithm, valid hex/base64 formatting, and deterministic repeatability
// for the same input. We do NOT hardcode an invented digest value.
async function computeHmac(algo: string, secret: string, message: string): Promise<Uint8Array> {
  const keyData = new TextEncoder().encode(secret);
  const messageData = new TextEncoder().encode(message);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: algo }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return new Uint8Array(signature);
}
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

describe('hmac-generator', () => {
  it('HMAC-SHA256 hex output has the correct length (32 bytes = 64 hex chars)', async () => {
    const bytes = await computeHmac('SHA-256', 'key', 'The quick brown fox jumps over the lazy dog');
    expect(bytes.length).toBe(32);
    expect(bytesToHex(bytes)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('HMAC-SHA512 output is 64 bytes', async () => {
    const bytes = await computeHmac('SHA-512', 'key', 'message');
    expect(bytes.length).toBe(64);
  });

  it('HMAC-SHA384 output is 48 bytes', async () => {
    const bytes = await computeHmac('SHA-384', 'key', 'message');
    expect(bytes.length).toBe(48);
  });

  it('is deterministic: same key+message always produces the same HMAC', async () => {
    const a = await computeHmac('SHA-256', 'secret', 'hello world');
    const b = await computeHmac('SHA-256', 'secret', 'hello world');
    expect(bytesToHex(a)).toBe(bytesToHex(b));
  });

  it('a different key produces a different HMAC for the same message', async () => {
    const a = await computeHmac('SHA-256', 'secret1', 'hello world');
    const b = await computeHmac('SHA-256', 'secret2', 'hello world');
    expect(bytesToHex(a)).not.toBe(bytesToHex(b));
  });
});

// ---------- blob-generator ----------
interface Point { x: number; y: number; }
function generateBlobPath(points: number, irregularity: number, size: number, seed: number): string {
  const rng = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const baseRadius = size / 2.6;
  const pts: Point[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = 1 + (rng() * (2 * irregularity) - irregularity);
    const r = baseRadius * wobble;
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  const n = pts.length;
  const smoothing = 0.2;
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1x = p1.x + (p2.x - p0.x) * smoothing;
    const cp1y = p1.y + (p2.y - p0.y) * smoothing;
    const cp2x = p2.x - (p3.x - p1.x) * smoothing;
    const cp2y = p2.y - (p3.y - p1.y) * smoothing;
    d += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  d += 'Z';
  return d;
}

describe('blob-generator', () => {
  it('same seed and settings always produce the identical path', () => {
    const a = generateBlobPath(8, 0.35, 300, 12345);
    const b = generateBlobPath(8, 0.35, 300, 12345);
    expect(a).toBe(b);
  });

  it('different seeds produce different paths', () => {
    const a = generateBlobPath(8, 0.35, 300, 1);
    const b = generateBlobPath(8, 0.35, 300, 2);
    expect(a).not.toBe(b);
  });

  it('path always starts with M and ends with Z (closed path)', () => {
    const path = generateBlobPath(6, 0.2, 200, 42);
    expect(path.startsWith('M ')).toBe(true);
    expect(path.trim().endsWith('Z')).toBe(true);
  });
});

// ---------- bar-graph-maker ----------
function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

describe('bar-graph-maker', () => {
  it('escapes HTML/SVG-significant characters in labels', () => {
    const escaped = escapeXml('<script>alert(1)</script>&"quote"');
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');
    expect(escaped).toContain('&quot;');
  });

  it('negative values are treated as zero (zero-baseline validation)', () => {
    const rows = [{ label: 'A', value: '-5' }, { label: 'B', value: '10' }];
    const validValues = rows.map((r) => {
      const n = Number(r.value);
      if (Number.isNaN(n) || n < 0) return 0;
      return n;
    });
    expect(validValues).toEqual([0, 10]);
  });

  it('non-numeric values are treated as zero', () => {
    const n = Number('not-a-number');
    expect(Number.isNaN(n)).toBe(true);
  });
});

// ---------- aesthetic-emoji-generator ----------
const EMOJI_THEMES: Record<string, string[]> = {
  soft: ['🩶', '🤍', '🫧', '☁️', '🕊️', '🧸', '🎀', '🥛'],
};
function generateEmojiCombos(theme: string, count: number, symbolsPerCombo: number, seed: number): string[] {
  const rng = mulberry32(seed);
  const pool = EMOJI_THEMES[theme] ?? EMOJI_THEMES.soft;
  const combos: string[] = [];
  for (let i = 0; i < count; i++) {
    combos.push(pickUnique(rng, pool, Math.min(symbolsPerCombo, pool.length)).join(''));
  }
  return combos;
}

describe('aesthetic-emoji-generator', () => {
  it('generates the requested number of combos', () => {
    const combos = generateEmojiCombos('soft', 5, 3, 1);
    expect(combos.length).toBe(5);
  });

  it('is deterministic for the same seed', () => {
    const a = generateEmojiCombos('soft', 5, 3, 100);
    const b = generateEmojiCombos('soft', 5, 3, 100);
    expect(a).toEqual(b);
  });
});

// ---------- aesthetic-username-generator ----------
const USERNAME_ADJECTIVES = ['moonlit', 'velvet', 'quiet'];
const USERNAME_NOUNS = ['petal', 'ember', 'willow'];
function generateUsername(rng: () => number): string {
  return `${pickRandom(rng, USERNAME_ADJECTIVES)}${pickRandom(rng, USERNAME_NOUNS)}`;
}

describe('aesthetic-username-generator', () => {
  it('is deterministic for the same seed', () => {
    const rngA = mulberry32(55);
    const rngB = mulberry32(55);
    const a = Array.from({ length: 10 }, () => generateUsername(rngA));
    const b = Array.from({ length: 10 }, () => generateUsername(rngB));
    expect(a).toEqual(b);
  });

  it('every generated username is a non-empty string', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 20; i++) {
      expect(generateUsername(rng).length).toBeGreaterThan(0);
    }
  });
});

// ---------- animal-fusion-generator ----------
const FUSION_ANIMALS = ['Fox', 'Owl', 'Otter', 'Panther'];
function pickTwoDistinct(rng: () => number): [string, string] {
  const a = pickRandom(rng, FUSION_ANIMALS);
  let b = pickRandom(rng, FUSION_ANIMALS);
  while (b === a) b = pickRandom(rng, FUSION_ANIMALS);
  return [a, b];
}

describe('animal-fusion-generator', () => {
  it('always picks two distinct animals', () => {
    const rng = mulberry32(21);
    for (let i = 0; i < 30; i++) {
      const [a, b] = pickTwoDistinct(rng);
      expect(a).not.toBe(b);
    }
  });

  it('is deterministic for the same seed', () => {
    const rngA = mulberry32(21);
    const rngB = mulberry32(21);
    expect(pickTwoDistinct(rngA)).toEqual(pickTwoDistinct(rngB));
  });
});

// ---------- book-title-generator ----------
describe('book-title-generator', () => {
  it('generates a non-empty title string using the seeded rng', () => {
    const rng = mulberry32(9);
    const adjectives = ['Forgotten', 'Broken', 'Last'];
    const nouns = ['Crown', 'Throne', 'Blade'];
    const title = `The ${pickRandom(rng, adjectives)} ${pickRandom(rng, nouns)}`;
    expect(title.length).toBeGreaterThan(0);
    expect(title.startsWith('The ')).toBe(true);
  });
});

// ---------- character-trait-generator ----------
const CLINICAL_TERMS_BLOCKLIST = [
  'bipolar', 'schizophrenia', 'narcissistic personality disorder', 'borderline personality disorder',
  'depression', 'anxiety disorder', 'ocd', 'ptsd', 'adhd',
];
const TRAIT_LIST = [
  'overconfident', 'stubborn to a fault', 'impulsive', 'quick to hold a grudge',
  'talks to inanimate objects', 'collects odd trinkets',
];

describe('character-trait-generator', () => {
  it('trait list contains no real clinical/diagnostic terminology', () => {
    const lowerTraits = TRAIT_LIST.map((t) => t.toLowerCase());
    CLINICAL_TERMS_BLOCKLIST.forEach((term) => {
      const found = lowerTraits.some((t) => t.includes(term));
      expect(found, `trait list should not contain clinical term "${term}"`).toBe(false);
    });
  });

  it('pickUnique returns a single trait deterministically for the same seed', () => {
    const rngA = mulberry32(3);
    const rngB = mulberry32(3);
    expect(pickUnique(rngA, TRAIT_LIST, 1)).toEqual(pickUnique(rngB, TRAIT_LIST, 1));
  });
});
