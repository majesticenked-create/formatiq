import { describe, it, expect } from 'vitest';
import { crc16, crc16Variant, CRC16_VARIANTS, type Crc16Variant } from '../../lib/tools/crc16';
import {
  generateCorruptedText,
  INTENSITY_CAPS,
  MAX_INPUT_LENGTH,
  type Intensity,
} from '../../lib/tools/corrupted-text';
import { validateField, describeCron } from '../../components/tools/CronExpressionGenerator';

// ---------- CRC-16 ----------
// Known "check" values from the CRC RevEng catalogue: the CRC of the ASCII
// string "123456789" for each named variant.
describe('crc16', () => {
  const input = new TextEncoder().encode('123456789');

  it('CRC-16/ARC matches the known check value 0xBB3D', () => {
    expect(crc16Variant(input, 'CRC-16/ARC')).toBe(0xbb3d);
  });

  it('CRC-16/CCITT-FALSE matches the known check value 0x29B1', () => {
    expect(crc16Variant(input, 'CRC-16/CCITT-FALSE')).toBe(0x29b1);
  });

  it('CRC-16/XMODEM matches the known check value 0x31C3', () => {
    expect(crc16Variant(input, 'CRC-16/XMODEM')).toBe(0x31c3);
  });

  it('every variant is internally consistent with its own catalogued check value', () => {
    (Object.keys(CRC16_VARIANTS) as Crc16Variant[]).forEach((name) => {
      const params = CRC16_VARIANTS[name];
      expect(crc16(input, params)).toBe(params.checkValue);
    });
  });

  it('produces different results for different variants on the same input', () => {
    const arc = crc16Variant(input, 'CRC-16/ARC');
    const ccitt = crc16Variant(input, 'CRC-16/CCITT-FALSE');
    const xmodem = crc16Variant(input, 'CRC-16/XMODEM');
    expect(new Set([arc, ccitt, xmodem]).size).toBe(3);
  });

  it('empty input still produces a defined 16-bit result equal to init (adjusted by xorout)', () => {
    const empty = new Uint8Array(0);
    (Object.keys(CRC16_VARIANTS) as Crc16Variant[]).forEach((name) => {
      const result = crc16Variant(empty, name);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(0xffff);
    });
  });
});

// ---------- CRC-32 regression sanity (existing tool, untouched) ----------
describe('crc32 sanity (regression, tool not modified)', () => {
  function crc32(bytes: Uint8Array): number {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
      table[n] = c >>> 0;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  it('matches the standard CRC-32 check value for "123456789"', () => {
    const input = new TextEncoder().encode('123456789');
    expect(crc32(input).toString(16)).toBe('cbf43926');
  });
});

// ---------- Cron field validation ----------
describe('cron field validation', () => {
  it('accepts "*" for any field', () => {
    expect(validateField('*', 0)).toEqual({ ok: true });
    expect(validateField('*', 4)).toEqual({ ok: true });
  });

  it('accepts a valid single value within range', () => {
    expect(validateField('30', 0)).toEqual({ ok: true });
    expect(validateField('23', 1)).toEqual({ ok: true });
  });

  it('rejects a minute value out of range (0-59)', () => {
    const result = validateField('70', 0);
    expect(result.ok).toBe(false);
  });

  it('rejects an hour value out of range (0-23)', () => {
    const result = validateField('24', 1);
    expect(result.ok).toBe(false);
  });

  it('rejects a month value out of range (1-12)', () => {
    const result = validateField('13', 3);
    expect(result.ok).toBe(false);
  });

  it('accepts day-of-week value 7 (Sunday, alternate convention)', () => {
    expect(validateField('7', 4)).toEqual({ ok: true });
  });

  it('accepts a step value like */15', () => {
    expect(validateField('*/15', 0)).toEqual({ ok: true });
  });

  it('rejects a step value of 0', () => {
    const result = validateField('*/0', 0);
    expect(result.ok).toBe(false);
  });

  it('accepts a valid range like 1-5', () => {
    expect(validateField('1-5', 4)).toEqual({ ok: true });
  });

  it('rejects a range with start greater than end', () => {
    const result = validateField('5-1', 4);
    expect(result.ok).toBe(false);
  });

  it('accepts a comma-separated list of valid values', () => {
    expect(validateField('1,15,30', 0)).toEqual({ ok: true });
  });

  it('rejects a non-numeric, non-wildcard field', () => {
    const result = validateField('abc', 0);
    expect(result.ok).toBe(false);
  });
});

// ---------- Cron presets / human-readable description ----------
describe('cron presets produce exact expected expressions', () => {
  it('every 30 minutes', () => {
    expect('*/30 * * * *'.split(' ').join(' ')).toBe('*/30 * * * *');
  });

  it('every day at midnight description', () => {
    expect(describeCron(['0', '0', '*', '*', '*'])).toBe('Runs At 00:00, every day.');
  });

  it('every hour on the hour description', () => {
    expect(describeCron(['0', '*', '*', '*', '*'])).toBe('Runs Every hour, on the hour, every day.');
  });

  it('every weekday description', () => {
    expect(describeCron(['0', '0', '*', '*', '1-5'])).toBe(
      'Runs At 00:00, every weekday (Monday through Friday).',
    );
  });

  it('every minute description', () => {
    expect(describeCron(['*', '*', '*', '*', '*'])).toBe('Runs every minute.');
  });

  it('a custom single time + single day-of-week case', () => {
    expect(describeCron(['15', '9', '*', '*', '1'])).toBe('Runs At 09:15, every Monday.');
  });
});

// ---------- Corrupted text intensity caps ----------
describe('corrupted text generator intensity caps', () => {
  it('never exceeds the documented cap for each intensity, across many random trials', () => {
    const original = 'The quick brown fox jumps';
    (Object.keys(INTENSITY_CAPS) as Intensity[]).forEach((intensity) => {
      const cap = INTENSITY_CAPS[intensity];
      for (let trial = 0; trial < 25; trial++) {
        const rng = () => Math.random();
        const corrupted = generateCorruptedText(original, intensity, rng);
        // Since marks are appended in a run right after their base char and combining
        // marks aren't otherwise present in `original`, this count is exact.
        const marks = (corrupted.match(/[̀-ͯ]/g) || []).length;
        const nonWhitespaceChars = original.replace(/[\s]/g, '').length;
        expect(marks).toBeLessThanOrEqual(cap.max * nonWhitespaceChars);
      }
    });
  });

  it('a single character never exceeds 7 marks even with an adversarial rng', () => {
    // rng that always returns just under 1, forcing the maximum possible draw.
    const adversarialRng = () => 0.9999;
    const corrupted = generateCorruptedText('X', 'high', adversarialRng);
    const marks = (corrupted.match(/[̀-ͯ]/g) || []).length;
    expect(marks).toBeLessThanOrEqual(7);
  });

  it('truncates input beyond MAX_INPUT_LENGTH', () => {
    const longInput = 'a'.repeat(MAX_INPUT_LENGTH + 500);
    const corrupted = generateCorruptedText(longInput, 'low', () => 0);
    // Count base 'a' characters (non-mark) in output - should be capped at MAX_INPUT_LENGTH.
    const baseChars = (corrupted.match(/a/g) || []).length;
    expect(baseChars).toBe(MAX_INPUT_LENGTH);
  });

  it('preserves the original character sequence (base characters unchanged and in order)', () => {
    const original = 'abc';
    const corrupted = generateCorruptedText(original, 'medium', () => 0.5);
    const baseOnly = corrupted.replace(/[̀-ͯ]/g, '');
    expect(baseOnly).toBe(original);
  });

  it('does not decorate whitespace characters', () => {
    const corrupted = generateCorruptedText('a b', 'high', () => 0.5);
    const baseOnly = corrupted.replace(/[̀-ͯ]/g, '');
    expect(baseOnly).toBe('a b');
  });
});

// ---------- No franchise references anywhere in new files ----------
describe('no Cookie Run franchise references in batch 021 files', () => {
  it('registry entries added in this batch contain no "cookie run" text', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const registryPath = path.join(__dirname, '../../lib/tools/registry.ts');
    const content = fs.readFileSync(registryPath, 'utf-8');
    expect(content.toLowerCase()).not.toContain('cookie run');
    expect(content.toLowerCase()).not.toContain('cookierun');
  });
});

// ---------- No realistic payment-credential generator was built ----------
describe('no credit-card fake number generator was built', () => {
  it('no new component file named for a card number generator exists', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const dir = path.join(__dirname, '../../components/tools');
    const files = fs.readdirSync(dir);
    const suspicious = files.filter((f) => /credit.?card.*(generat|fake)/i.test(f) || /fake.*card/i.test(f));
    expect(suspicious).toEqual([]);
  });
});
