/**
 * Cursive/stylized Unicode text conversion using real Unicode Mathematical
 * Alphanumeric Symbols (the U+1D400 block) plus the older Letterlike Symbols
 * block where the Math Alphanumeric block has genuine gaps.
 *
 * IMPORTANT: these tables are explicit per-letter lookups, not a
 * charCode-plus-offset formula. The Mathematical Script variant in
 * particular has real, well-documented gaps - eight uppercase letters
 * (B, E, F, H, I, L, M, R) and three lowercase letters (e, g, o) were never
 * assigned codepoints in the contiguous Math Alphanumeric range because
 * equivalent characters already existed in the older Letterlike Symbols
 * block, so Unicode reused those instead of duplicating them. A formulaic
 * offset would silently produce wrong (or unassigned) codepoints for those
 * eleven letters. The Mathematical Italic variant has one such gap too:
 * italic lowercase "h" has no Math Alphanumeric codepoint (it's reserved,
 * since it would collide in meaning with the Planck constant symbol) and
 * instead reuses U+210E (PLANCK CONSTANT) directly.
 *
 * Any character with no real mapping in a given variant (digits,
 * punctuation, whitespace, non-Latin letters) passes through completely
 * unchanged - no codepoints are invented for unmapped characters.
 */

export type CursiveVariant = 'bold' | 'italic' | 'script';

// Mathematical Bold (U+1D400-1D433): fully contiguous, no gaps.
const BOLD_UPPER: Record<string, string> = {
  A: '\u{1D400}', B: '\u{1D401}', C: '\u{1D402}', D: '\u{1D403}', E: '\u{1D404}',
  F: '\u{1D405}', G: '\u{1D406}', H: '\u{1D407}', I: '\u{1D408}', J: '\u{1D409}',
  K: '\u{1D40A}', L: '\u{1D40B}', M: '\u{1D40C}', N: '\u{1D40D}', O: '\u{1D40E}',
  P: '\u{1D40F}', Q: '\u{1D410}', R: '\u{1D411}', S: '\u{1D412}', T: '\u{1D413}',
  U: '\u{1D414}', V: '\u{1D415}', W: '\u{1D416}', X: '\u{1D417}', Y: '\u{1D418}', Z: '\u{1D419}',
};
const BOLD_LOWER: Record<string, string> = {
  a: '\u{1D41A}', b: '\u{1D41B}', c: '\u{1D41C}', d: '\u{1D41D}', e: '\u{1D41E}',
  f: '\u{1D41F}', g: '\u{1D420}', h: '\u{1D421}', i: '\u{1D422}', j: '\u{1D423}',
  k: '\u{1D424}', l: '\u{1D425}', m: '\u{1D426}', n: '\u{1D427}', o: '\u{1D428}',
  p: '\u{1D429}', q: '\u{1D42A}', r: '\u{1D42B}', s: '\u{1D42C}', t: '\u{1D42D}',
  u: '\u{1D42E}', v: '\u{1D42F}', w: '\u{1D430}', x: '\u{1D431}', y: '\u{1D432}', z: '\u{1D433}',
};

// Mathematical Italic (U+1D434-1D467): contiguous for uppercase; lowercase
// has exactly one gap at "h", which uses U+210E (PLANCK CONSTANT) instead.
const ITALIC_UPPER: Record<string, string> = {
  A: '\u{1D434}', B: '\u{1D435}', C: '\u{1D436}', D: '\u{1D437}', E: '\u{1D438}',
  F: '\u{1D439}', G: '\u{1D43A}', H: '\u{1D43B}', I: '\u{1D43C}', J: '\u{1D43D}',
  K: '\u{1D43E}', L: '\u{1D43F}', M: '\u{1D440}', N: '\u{1D441}', O: '\u{1D442}',
  P: '\u{1D443}', Q: '\u{1D444}', R: '\u{1D445}', S: '\u{1D446}', T: '\u{1D447}',
  U: '\u{1D448}', V: '\u{1D449}', W: '\u{1D44A}', X: '\u{1D44B}', Y: '\u{1D44C}', Z: '\u{1D44D}',
};
const ITALIC_LOWER: Record<string, string> = {
  a: '\u{1D44E}', b: '\u{1D44F}', c: '\u{1D450}', d: '\u{1D451}', e: '\u{1D452}',
  f: '\u{1D453}', g: '\u{1D454}', h: '\u{210E}' /* PLANCK CONSTANT, gap substitute */, i: '\u{1D456}',
  j: '\u{1D457}', k: '\u{1D458}', l: '\u{1D459}', m: '\u{1D45A}', n: '\u{1D45B}',
  o: '\u{1D45C}', p: '\u{1D45D}', q: '\u{1D45E}', r: '\u{1D45F}', s: '\u{1D460}',
  t: '\u{1D461}', u: '\u{1D462}', v: '\u{1D463}', w: '\u{1D464}', x: '\u{1D465}', y: '\u{1D466}', z: '\u{1D467}',
};

// Mathematical Script (U+1D49C-1D4CF): eight uppercase gaps and three
// lowercase gaps, each substituted with its pre-existing Letterlike Symbols
// codepoint rather than an unassigned Math Alphanumeric slot.
const SCRIPT_UPPER: Record<string, string> = {
  A: '\u{1D49C}',
  B: '\u{212C}' /* SCRIPT CAPITAL B, gap substitute */,
  C: '\u{1D49E}',
  D: '\u{1D49F}',
  E: '\u{2130}' /* SCRIPT CAPITAL E, gap substitute */,
  F: '\u{2131}' /* SCRIPT CAPITAL F, gap substitute */,
  G: '\u{1D4A2}',
  H: '\u{210B}' /* SCRIPT CAPITAL H, gap substitute */,
  I: '\u{2110}' /* SCRIPT CAPITAL I, gap substitute */,
  J: '\u{1D4A5}',
  K: '\u{1D4A6}',
  L: '\u{2112}' /* SCRIPT CAPITAL L, gap substitute */,
  M: '\u{2133}' /* SCRIPT CAPITAL M, gap substitute */,
  N: '\u{1D4A9}',
  O: '\u{1D4AA}',
  P: '\u{1D4AB}',
  Q: '\u{1D4AC}',
  R: '\u{211B}' /* SCRIPT CAPITAL R, gap substitute */,
  S: '\u{1D4AE}',
  T: '\u{1D4AF}',
  U: '\u{1D4B0}',
  V: '\u{1D4B1}',
  W: '\u{1D4B2}',
  X: '\u{1D4B3}',
  Y: '\u{1D4B4}',
  Z: '\u{1D4B5}',
};
const SCRIPT_LOWER: Record<string, string> = {
  a: '\u{1D4B6}', b: '\u{1D4B7}', c: '\u{1D4B8}', d: '\u{1D4B9}',
  e: '\u{212F}' /* SCRIPT SMALL E, gap substitute */,
  f: '\u{1D4BB}',
  g: '\u{210A}' /* SCRIPT SMALL G, gap substitute */,
  h: '\u{1D4BD}', i: '\u{1D4BE}', j: '\u{1D4BF}', k: '\u{1D4C0}', l: '\u{1D4C1}',
  m: '\u{1D4C2}', n: '\u{1D4C3}',
  o: '\u{2134}' /* SCRIPT SMALL O, gap substitute */,
  p: '\u{1D4C5}', q: '\u{1D4C6}', r: '\u{1D4C7}', s: '\u{1D4C8}', t: '\u{1D4C9}',
  u: '\u{1D4CA}', v: '\u{1D4CB}', w: '\u{1D4CC}', x: '\u{1D4CD}', y: '\u{1D4CE}', z: '\u{1D4CF}',
};

const TABLES: Record<CursiveVariant, { upper: Record<string, string>; lower: Record<string, string> }> = {
  bold: { upper: BOLD_UPPER, lower: BOLD_LOWER },
  italic: { upper: ITALIC_UPPER, lower: ITALIC_LOWER },
  script: { upper: SCRIPT_UPPER, lower: SCRIPT_LOWER },
};

/**
 * Converts `input` to the given cursive/stylized variant using the explicit
 * per-letter lookup tables above. Any character with no mapping (digits,
 * punctuation, whitespace, non-Latin letters) is passed through unchanged.
 */
export function toCursiveText(input: string, variant: CursiveVariant): string {
  const { upper, lower } = TABLES[variant];
  let out = '';
  for (const ch of input) {
    out += upper[ch] ?? lower[ch] ?? ch;
  }
  return out;
}

export const CURSIVE_VARIANT_LABELS: Record<CursiveVariant, string> = {
  bold: 'Mathematical Bold',
  italic: 'Mathematical Italic',
  script: 'Mathematical Script (cursive)',
};
