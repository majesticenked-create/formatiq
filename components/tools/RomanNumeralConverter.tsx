'use client';

import { useMemo, useState } from 'react';

type Mode = 'numToRoman' | 'romanToNum';

const VALUE_SYMBOLS: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

const STRICT_ROMAN_PATTERN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

const SYMBOL_VALUES: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

function numberToRoman(n: number): string {
  let remaining = n;
  let result = '';
  for (const [value, symbol] of VALUE_SYMBOLS) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

function romanToNumber(roman: string): number {
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = SYMBOL_VALUES[roman[i]];
    const next = SYMBOL_VALUES[roman[i + 1]];
    if (next && current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
}

function tryNumToRoman(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false as const, message: 'Enter a number to convert.' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false as const, message: 'Enter a whole number.' };
  }
  const n = Number(trimmed);
  if (n < 1 || n > 3999) {
    return { ok: false as const, message: 'Number must be between 1 and 3999 (the range standard Roman numerals can represent).' };
  }
  return { ok: true as const, output: numberToRoman(n) };
}

function tryRomanToNum(input: string) {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) {
    return { ok: false as const, message: 'Enter a Roman numeral to convert.' };
  }
  if (!/^[IVXLCDM]+$/.test(trimmed)) {
    return { ok: false as const, message: 'Only the letters I, V, X, L, C, D, M are valid Roman numeral characters.' };
  }
  if (!STRICT_ROMAN_PATTERN.test(trimmed)) {
    return {
      ok: false as const,
      message: `"${trimmed}" is not a well-formed Roman numeral - check for invalid repetition (like "IIII" or "VV") or ordering.`,
    };
  }
  return { ok: true as const, output: String(romanToNumber(trimmed)) };
}

export default function RomanNumeralConverter() {
  const [mode, setMode] = useState<Mode>('numToRoman');
  const [input, setInput] = useState('1994');

  const result = useMemo(() => (mode === 'numToRoman' ? tryNumToRoman(input) : tryRomanToNum(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'numToRoman' ? '1994' : 'MCMXCIV');
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'numToRoman' ? 'romanToNum' : 'numToRoman');
    }
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'numToRoman' ? 'var(--accent-dim)' : undefined,
            color: mode === 'numToRoman' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('numToRoman')}
        >
          Number → Roman
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'romanToNum' ? 'var(--accent-dim)' : undefined,
            color: mode === 'romanToNum' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('romanToNum')}
        >
          Roman → Number
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'numToRoman' ? 'Number (1-3999)' : 'Roman numeral'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'numToRoman' ? 'Roman numeral' : 'Number'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>
    </div>
  );
}
