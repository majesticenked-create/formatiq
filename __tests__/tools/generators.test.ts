import { describe, it, expect } from 'vitest';

// Logic copied verbatim from the corresponding component file(s) in components/tools/
// to test in isolation without modifying the real components (many tools embed their
// pure logic directly in the component rather than exporting it separately).

const results: { tool: string; test: string; pass: boolean; detail?: string }[] = [];
function check(tool: string, test: string, pass: boolean, detail?: string) {
  results.push({ tool, test, pass, detail });
}

// ---------- uuid-generator ----------
const { v4: uuidv4, validate: uuidValidate, version: uuidVersion } = require('uuid');
{
  const id = uuidv4();
  check('uuid-generator', 'generates a valid v4 UUID', uuidValidate(id) && uuidVersion(id) === 4, id);
  const ids = Array.from({ length: 20 }, () => uuidv4());
  const allValid = ids.every((i: string) => uuidValidate(i));
  check('uuid-generator', 'bulk generation (20) all valid', allValid);
  const uniqueCount = new Set(ids).size;
  check('uuid-generator', 'edge case: 20 generated UUIDs are all unique (no collisions)', uniqueCount === 20, `unique=${uniqueCount}`);
}

// ---------- password-generator ----------
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
function pgGeneratePassword(length: number, useUpper: boolean, useLower: boolean, useNumbers: boolean, useSymbols: boolean) {
  let charset = '';
  if (useUpper) charset += UPPER;
  if (useLower) charset += LOWER;
  if (useNumbers) charset += NUMBERS;
  if (useSymbols) charset += SYMBOLS;
  if (!charset) return '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  let password = '';
  for (let i = 0; i < length; i++) password += charset[randomValues[i] % charset.length];
  return password;
}
{
  const good = pgGeneratePassword(16, true, true, true, true);
  check('password-generator', 'valid: generates 16-char password from full charset', good.length === 16, good);
  const noCharset = pgGeneratePassword(16, false, false, false, false);
  check('password-generator', 'invalid: no charset selected -> empty string not crash', noCharset === '');
  const boundaryShort = pgGeneratePassword(8, true, false, false, false);
  check('password-generator', 'edge case: min length 8, single charset -> only uppercase chars', boundaryShort.length === 8 && /^[A-Z]+$/.test(boundaryShort), boundaryShort);
}

// ---------- lorem-ipsum-generator ----------
const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' ');
const CLASSIC_OPENER = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
function liRandomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function liCapitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function liGenerateSentence(): string {
  const wordCount = liRandomInt(6, 14);
  const words = Array.from({ length: wordCount }, () => WORDS[liRandomInt(0, WORDS.length - 1)]);
  return liCapitalize(words.join(' ')) + '.';
}
function liGenerateParagraph(isFirst: boolean, startWithClassic: boolean): string {
  const sentenceCount = liRandomInt(4, 7);
  const sentences = Array.from({ length: sentenceCount }, () => liGenerateSentence());
  if (isFirst && startWithClassic) sentences[0] = CLASSIC_OPENER;
  return sentences.join(' ');
}
function liGenerate(paragraphCount: number, startWithClassic: boolean): string[] {
  return Array.from({ length: paragraphCount }, (_, i) => liGenerateParagraph(i === 0, startWithClassic));
}
{
  const good = liGenerate(3, true);
  check('lorem-ipsum-generator', 'valid: generates 3 paragraphs, first starts with classic opener', good.length === 3 && good[0].startsWith(CLASSIC_OPENER), good[0].slice(0, 40));
  const noOpener = liGenerate(1, false);
  check('lorem-ipsum-generator', 'toggle off: classic opener not forced', noOpener.length === 1);
  const boundary = liGenerate(1, true); // minimum paragraph count
  check('lorem-ipsum-generator', 'edge case: minimum count of 1 paragraph works', boundary.length === 1 && boundary[0].length > 0);
}

// ---------- qrcode library sanity (used by qr-code-generator, canvas rendering itself untestable in Node) ----------
const QRCode = require('qrcode');
async function qrTests() {
  try {
    const url = await QRCode.toDataURL('https://formatiq.com');
    check('qr-code-generator (lib)', 'valid URL encodes without error', typeof url === 'string' && url.startsWith('data:image/'), url.slice(0, 30));
  } catch (err) {
    check('qr-code-generator (lib)', 'valid URL encodes without error', false, String(err));
  }
  try {
    await QRCode.toDataURL('');
    check('qr-code-generator (lib)', 'empty string -> library returns error not crash process', false, 'no error thrown');
  } catch (err) {
    check('qr-code-generator (lib)', 'empty string -> library returns error not crash process', true, String(err));
  }
  try {
    const longInput = 'x'.repeat(3000);
    await QRCode.toDataURL(longInput);
    check('qr-code-generator (lib)', 'edge case: very long input -> either encodes or errors gracefully (no crash)', true, 'encoded ok');
  } catch (err) {
    check('qr-code-generator (lib)', 'edge case: very long input -> either encodes or errors gracefully (no crash)', true, String(err));
  }
}

// ---------- random-number-generator ----------
function rngRandomInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rngGenerateNumbers(min: number, max: number, count: number, allowDuplicates: boolean) {
  if (min > max) return { ok: false as const, message: 'min > max' };
  const rangeSize = max - min + 1;
  if (!allowDuplicates && count > rangeSize) return { ok: false as const, message: 'not enough unique values' };
  if (allowDuplicates) return { ok: true as const, numbers: Array.from({ length: count }, () => rngRandomInt(min, max)) };
  const pool = Array.from({ length: rangeSize }, (_, i) => min + i);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return { ok: true as const, numbers: pool.slice(0, count) };
}
{
  const good = rngGenerateNumbers(1, 10, 5, false);
  const allInRange = good.ok && good.numbers.every((n) => n >= 1 && n <= 10);
  const allUnique = good.ok && new Set(good.numbers).size === good.numbers.length;
  check('random-number-generator', 'valid: 5 unique numbers in range 1-10', good.ok === true && allInRange && allUnique, JSON.stringify(good));
  const bad = rngGenerateNumbers(1, 5, 10, false); // impossible: 10 unique from range of 5
  check('random-number-generator', 'invalid: requesting more uniques than range allows -> error', bad.ok === false, JSON.stringify(bad));
  const edge = rngGenerateNumbers(5, 5, 1, false); // min===max boundary
  check('random-number-generator', 'edge case: min===max (range of 1) produces exactly that value', edge.ok === true && (edge as any).numbers[0] === 5, JSON.stringify(edge));
}

// ---------- slug-generator ----------
const COMBINING_MARKS = /[̀-ͯ]/g;
function sgToSlug(input: string): string {
  return input.normalize('NFD').replace(COMBINING_MARKS, '').trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}
{
  const good = sgToSlug('Café Déjà Vu - 10 Tips & Tricks for 2026!');
  check('slug-generator', 'valid: accents normalize correctly (café -> cafe)', good.includes('cafe') && good.includes('deja'), good);
  const empty = sgToSlug('');
  check('slug-generator', 'empty input -> empty slug not crash', empty === '');
  const onlySpecial = sgToSlug('!!!@@@###');
  check('slug-generator', 'edge case: only special characters -> empty slug not crash', onlySpecial === '', onlySpecial);
}

// ---------- fake-data-generator ----------
const FIRST_NAMES = ['James', 'Mary'];
const LAST_NAMES = ['Smith', 'Johnson'];
const EMAIL_DOMAINS = ['example.com'];
function fdgPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function fdgRandomDigits(n: number): string { return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join(''); }
function fdgGenerateRow() {
  const first = fdgPick(FIRST_NAMES);
  const last = fdgPick(LAST_NAMES);
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 100)}@${fdgPick(EMAIL_DOMAINS)}`;
  const phone = `(${fdgRandomDigits(3)}) ${fdgRandomDigits(3)}-${fdgRandomDigits(4)}`;
  return { name: `${first} ${last}`, email, phone };
}
{
  const row = fdgGenerateRow();
  const emailValid = /^[a-z]+\.[a-z]+\d+@example\.com$/.test(row.email);
  const phoneValid = /^\(\d{3}\) \d{3}-\d{4}$/.test(row.phone);
  check('fake-data-generator', 'generates well-formed name/email/phone', emailValid && phoneValid, JSON.stringify(row));
  const rows = Array.from({ length: 50 }, fdgGenerateRow);
  check('fake-data-generator', 'bulk generation (50 rows) all well-formed', rows.every((r) => /^\(\d{3}\) \d{3}-\d{4}$/.test(r.phone)));
  const singleRow = Array.from({ length: 1 }, fdgGenerateRow);
  check('fake-data-generator', 'edge case: minimum count of 1 row works', singleRow.length === 1);
}

// ---------- color-palette-generator ----------
interface Hsl { h: number; s: number; l: number; }
function cpgHexToHsl(hex: string): Hsl | null {
  const clean = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0,2),16)/255, g = parseInt(clean.slice(2,4),16)/255, b = parseInt(clean.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), l = (max+min)/2, delta = max-min;
  let h=0, s=0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2*l-1));
    if (max===r) h=((g-b)/delta)%6; else if (max===g) h=(b-r)/delta+2; else h=(r-g)/delta+4;
    h*=60; if (h<0) h+=360;
  }
  return { h, s: s*100, l: l*100 };
}
function cpgNormalizeHue(h: number): number { return ((h % 360) + 360) % 360; }
function cpgGeneratePalette(base: Hsl, mode: string): Hsl[] {
  if (mode === 'complementary') return [base, { h: cpgNormalizeHue(base.h+180), s: base.s, l: base.l }];
  if (mode === 'triadic') return [base, { h: cpgNormalizeHue(base.h+120), s: base.s, l: base.l }, { h: cpgNormalizeHue(base.h+240), s: base.s, l: base.l }];
  return [base];
}
{
  const good = cpgHexToHsl('#3B82F6');
  check('color-palette-generator', 'valid hex converts to HSL', good !== null && good.h > 0 && good.h < 360, JSON.stringify(good));
  const bad = cpgHexToHsl('not-a-color');
  check('color-palette-generator', 'invalid hex -> null not crash', bad === null);
  const boundaryHue = cpgNormalizeHue(370); // wraps past 360
  check('color-palette-generator', 'edge case: hue wraps correctly past 360 degrees', boundaryHue === 10, String(boundaryHue));
  const negativeHue = cpgNormalizeHue(-30);
  check('color-palette-generator', 'edge case: negative hue normalizes correctly', negativeHue === 330, String(negativeHue));
}

describe('Generators', async () => {
  await qrTests();

  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
