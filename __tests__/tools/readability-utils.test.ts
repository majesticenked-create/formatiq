import { describe, it, expect } from 'vitest';
import { countSyllables, fleschKincaidGradeLevel } from '@/lib/tools/readability-utils';

describe('readability-utils', () => {
  describe('countSyllables', () => {
    it('counts a simple single-syllable word', () => {
      expect(countSyllables('cat')).toBe(1);
    });

    it('handles common silent trailing "e" words', () => {
      expect(countSyllables('like')).toBe(1);
      expect(countSyllables('name')).toBe(1);
      expect(countSyllables('lake')).toBe(1);
    });

    it('does not strip the final syllable from a consonant + "le" ending', () => {
      expect(countSyllables('table')).toBeGreaterThanOrEqual(2);
      expect(countSyllables('little')).toBeGreaterThanOrEqual(2);
    });

    it('returns at least 1 for any non-empty word, even with no detected vowel groups', () => {
      expect(countSyllables('rhythm')).toBeGreaterThanOrEqual(1);
    });

    it('returns 0 for a string with no letters', () => {
      expect(countSyllables('123')).toBe(0);
    });
  });

  describe('fleschKincaidGradeLevel', () => {
    it('handles empty text without dividing by zero or producing NaN', () => {
      const result = fleschKincaidGradeLevel('');
      expect(result.ok).toBe(false);
    });

    it('handles whitespace-only text the same way as empty text', () => {
      const result = fleschKincaidGradeLevel('   \n\t  ');
      expect(result.ok).toBe(false);
    });

    it('computes a finite grade level for a short technical/hyphenated fixture', () => {
      const result = fleschKincaidGradeLevel('State-of-the-art multi-threaded I/O.');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Number.isFinite(result.gradeLevel)).toBe(true);
        expect(result.wordCount).toBeGreaterThan(0);
        expect(result.sentenceCount).toBeGreaterThanOrEqual(1);
      }
    });

    it('computes a finite grade level for text full of common silent-e words', () => {
      const result = fleschKincaidGradeLevel('The cat came home late. She ate a cake and went to the lake.');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Number.isFinite(result.gradeLevel)).toBe(true);
        expect(result.sentenceCount).toBe(2);
      }
    });

    it('handles punctuation-heavy text without crashing or dividing by zero', () => {
      const result = fleschKincaidGradeLevel('Wait... what?! No way!! This is (really) crazy -- right?');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Number.isFinite(result.gradeLevel)).toBe(true);
        expect(result.wordCount).toBeGreaterThan(0);
      }
    });

    it('treats text with no terminal punctuation as one sentence, not zero', () => {
      const result = fleschKincaidGradeLevel('just some words with no ending punctuation');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.sentenceCount).toBe(1);
        expect(Number.isFinite(result.gradeLevel)).toBe(true);
      }
    });
  });
});
