'use client';

import { useMemo, useState } from 'react';

const ONES = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const SCALES = ['', 'thousand', 'million', 'billion'];

function threeDigitsToWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} hundred`);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      parts.push(ONES[remainder]);
    } else {
      const tens = Math.floor(remainder / 10);
      const ones = remainder % 10;
      parts.push(ones > 0 ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens]);
    }
  }

  return parts.join(' ');
}

function integerToWords(n: number): string {
  if (n === 0) return 'zero';

  const groups: number[] = [];
  let remaining = n;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const words = threeDigitsToWords(groups[i]);
    parts.push(SCALES[i] ? `${words} ${SCALES[i]}` : words);
  }

  return parts.join(' ');
}

function decimalDigitsToWords(digits: string): string {
  return digits
    .split('')
    .map((d) => (d === '0' ? 'zero' : ONES[Number(d)]))
    .join(' ');
}

function numberToWords(input: string): { ok: true; words: string } | { ok: false; message: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: 'Enter a number to convert.' };
  }
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { ok: false, message: 'Enter a valid number, e.g. 1234 or 12.5.' };
  }

  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart, decimalPart] = unsigned.split('.');

  const intValue = Number(intPart);
  if (intValue >= 1_000_000_000_000) {
    return { ok: false, message: 'Number is too large - this tool supports up to hundreds of billions.' };
  }

  let words = integerToWords(intValue);
  if (decimalPart) {
    words += ` point ${decimalDigitsToWords(decimalPart)}`;
  }
  if (negative) {
    words = `negative ${words}`;
  }

  return { ok: true, words };
}

export default function NumberToWordsConverter() {
  const [input, setInput] = useState('1234');

  const result = useMemo(() => numberToWords(input), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.words);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput('1234.5')}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Number</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Enter a number, e.g. 1234 or 12.5"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Converted below' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>In words</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
            {result.words}
          </div>
        </div>
      )}
    </div>
  );
}
