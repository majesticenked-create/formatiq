'use client';

import { useMemo, useState } from 'react';

const SAMPLE = '978-0-306-40615-7';

function clean(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

function validateIsbn10(digits: string): { valid: boolean; failingPosition?: number } {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = digits[i];
    const value = char === 'X' ? 10 : Number(char);
    if (Number.isNaN(value)) return { valid: false, failingPosition: i };
    sum += value * (10 - i);
  }
  return { valid: sum % 11 === 0 };
}

function validateIsbn13(digits: string): { valid: boolean; failingPosition?: number } {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const value = Number(digits[i]);
    if (Number.isNaN(value)) return { valid: false, failingPosition: i };
    sum += value * (i % 2 === 0 ? 1 : 3);
  }
  return { valid: sum % 10 === 0 };
}

function isbn10CheckDigit(first9: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(first9[i]) * (10 - i);
  const remainder = (11 - (sum % 11)) % 11;
  return remainder === 10 ? 'X' : String(remainder);
}

function isbn13CheckDigit(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

function isbn10to13(isbn10: string): string {
  const core = '978' + isbn10.slice(0, 9);
  return core + isbn13CheckDigit(core);
}

function isbn13to10(isbn13: string): string | null {
  if (!isbn13.startsWith('978')) return null;
  const core = isbn13.slice(3, 12);
  return core + isbn10CheckDigit(core);
}

function formatWithHyphens(digits: string): string {
  return digits.match(/.{1,4}/g)?.join('-') ?? digits;
}

function analyze(input: string) {
  const digits = clean(input);
  if (!digits) return { ok: false as const, message: 'Enter an ISBN-10 or ISBN-13.' };

  if (digits.length === 10) {
    if (!/^\d{9}[\dX]$/.test(digits)) {
      return { ok: false as const, message: 'ISBN-10 must be 9 digits followed by a digit or "X".' };
    }
    const result = validateIsbn10(digits);
    if (!result.valid) {
      return {
        ok: false as const,
        message:
          result.failingPosition !== undefined
            ? `Invalid character at position ${result.failingPosition + 1}.`
            : `Checksum failed — the check digit ("${digits[9]}") doesn’t match the computed value for the first 9 digits.`,
      };
    }
    return {
      ok: true as const,
      format: 'ISBN-10' as const,
      formatted: digits,
      converted: isbn10to13(digits),
      convertedLabel: 'ISBN-13 equivalent',
    };
  }

  if (digits.length === 13) {
    if (!/^\d{13}$/.test(digits)) {
      return { ok: false as const, message: 'ISBN-13 must be exactly 13 digits.' };
    }
    const result = validateIsbn13(digits);
    if (!result.valid) {
      return {
        ok: false as const,
        message: `Checksum failed — the check digit ("${digits[12]}") doesn’t match the computed value for the first 12 digits.`,
      };
    }
    const isbn10 = isbn13to10(digits);
    return {
      ok: true as const,
      format: 'ISBN-13' as const,
      formatted: digits,
      converted: isbn10,
      convertedLabel: isbn10 ? 'ISBN-10 equivalent' : 'No ISBN-10 equivalent (prefix isn’t 978)',
    };
  }

  return { ok: false as const, message: `ISBNs are 10 or 13 characters long — got ${digits.length}.` };
}

export default function IsbnValidatorGenerator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => analyze(input), [input]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>ISBN</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Enter an ISBN-10 or ISBN-13, hyphens optional..."
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ Valid ${result.format}` : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>Details</span>
          </div>
          <div className="output mono">
            {[
              `Format:              ${result.format}`,
              `Formatted:           ${formatWithHyphens(result.formatted)}`,
              `${result.convertedLabel}:`,
              `  ${result.converted ? formatWithHyphens(result.converted) : '(not applicable)'}`,
            ].join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
