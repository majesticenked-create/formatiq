/**
 * Plain-TS readability helpers for the Flesch-Kincaid Grade Level tool. No external
 * dependencies - syllable counting uses a vowel-group heuristic with a couple of common
 * exceptions (silent trailing 'e'), which is an estimate rather than a dictionary lookup.
 */

/**
 * Estimates the number of syllables in a single word using vowel-group counting: each
 * contiguous run of vowels (a, e, i, o, u, y) counts as one syllable. A silent trailing 'e'
 * (e.g. "like", "name") is subtracted when it would otherwise be counted as its own syllable,
 * except when the word ends in "le" preceded by a consonant (e.g. "table", "little"), where
 * that final syllable is real. Every non-empty word counts as at least one syllable.
 */
export function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;

  const vowelGroups = cleaned.match(/[aeiouy]+/g);
  let syllables = vowelGroups ? vowelGroups.length : 0;

  // "le" preceded by a consonant (e.g. "table", "little") is a real syllabic ending, so it's
  // exempt from the silent-e trim below; "le" preceded by a vowel (e.g. "ale") is not exempt.
  const endsInConsonantLe = cleaned.endsWith('le') && cleaned.length > 2 && !/[aeiouy]/.test(cleaned[cleaned.length - 3]);
  const endsInSilentE = cleaned.endsWith('e') && !endsInConsonantLe;

  if (endsInSilentE && syllables > 1) {
    syllables -= 1;
  }

  return Math.max(1, syllables);
}

export interface FleschKincaidResult {
  ok: true;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  gradeLevel: number;
}

export interface FleschKincaidError {
  ok: false;
  message: string;
}

/**
 * Computes the Flesch-Kincaid Grade Level for a block of text:
 * 0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59.
 * Handles empty text (and text with no words) without dividing by zero, and treats a body
 * of text with no terminal punctuation as a single sentence rather than zero sentences.
 * The result is an estimate - syllable counting is heuristic, not dictionary-exact.
 */
export function fleschKincaidGradeLevel(text: string): FleschKincaidResult | FleschKincaidError {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, message: 'Enter some text to analyze.' };
  }

  const words = trimmed.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  if (words.length === 0) {
    return { ok: false, message: 'Enter text that contains at least one word.' };
  }

  const rawSentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(1, rawSentences.length);

  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const wordCount = words.length;

  const gradeLevel = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;

  return { ok: true, wordCount, sentenceCount, syllableCount, gradeLevel };
}
