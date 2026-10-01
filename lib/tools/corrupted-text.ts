/**
 * "Corrupted"/Zalgo-style text generation via Unicode combining diacritical
 * marks (U+0300-U+036F). Intensity is hard-capped in code (not just UI copy)
 * so output can never balloon into a page-breaking, multi-thousand-character
 * string, and input length is capped separately for the same reason.
 */

export type Intensity = 'low' | 'medium' | 'high';

// Hard caps on marks added per character, per intensity level. These are
// enforced in generateCorruptedText below regardless of what a caller passes.
export const INTENSITY_CAPS: Record<Intensity, { min: number; max: number }> = {
  low: { min: 1, max: 2 },
  medium: { min: 2, max: 4 },
  high: { min: 4, max: 7 },
};

// Absolute ceiling on marks per character no matter what - a second, independent
// guard so a bug in INTENSITY_CAPS above could never itself remove the cap.
const ABSOLUTE_MAX_MARKS_PER_CHAR = 7;

// Combining marks above, below, and "through" a base character (U+0300-U+036F range).
const MARKS_ABOVE = [
  '̀', '́', '̂', '̃', '̄', '̆', '̇', '̈',
  '̊', '̋', '̌', '̐', '̒', '̓', '̔', '̽',
];
const MARKS_BELOW = [
  '̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟',
  '̠', '̤', '̥', '̦', '̩', '̪', '̫', '̬',
];
const MARKS_THROUGH = ['̴', '̵', '̶', '̷', '̸'];

const ALL_MARKS = [...MARKS_ABOVE, ...MARKS_BELOW, ...MARKS_THROUGH];

/** Absolute cap on input length - keeps output bounded even at max intensity. */
export const MAX_INPUT_LENGTH = 300;

/**
 * Corrupts `input` by layering combining marks onto each character. `intensity`
 * controls how many marks are added per character, clamped to INTENSITY_CAPS
 * and, as a second independent guard, to ABSOLUTE_MAX_MARKS_PER_CHAR. `rng`
 * defaults to Math.random but can be injected for deterministic tests.
 */
export function generateCorruptedText(
  input: string,
  intensity: Intensity,
  rng: () => number = Math.random,
): string {
  const truncated = input.slice(0, MAX_INPUT_LENGTH);
  const cap = INTENSITY_CAPS[intensity];
  const min = Math.max(0, Math.min(cap.min, ABSOLUTE_MAX_MARKS_PER_CHAR));
  const max = Math.max(min, Math.min(cap.max, ABSOLUTE_MAX_MARKS_PER_CHAR));

  let out = '';
  for (const ch of truncated) {
    out += ch;
    if (ch === ' ' || ch === '\n') continue; // don't decorate whitespace
    const count = min + Math.floor(rng() * (max - min + 1));
    for (let i = 0; i < count; i++) {
      out += ALL_MARKS[Math.floor(rng() * ALL_MARKS.length)];
    }
  }
  return out;
}
