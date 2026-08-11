'use client';

import { useMemo, useState } from 'react';

const SAMPLE = '42, 7, 19, 3, 88, 15, 3, 61';

function parseNumbers(input: string): { ok: true; numbers: number[] } | { ok: false; message: string } {
  if (!input.trim()) {
    return { ok: false, message: 'Enter a list of numbers, one per line or comma-separated.' };
  }

  // Auto-detect the separator: commas if any are present, otherwise newlines.
  const rawTokens = input.includes(',') ? input.split(',') : input.split('\n');
  const tokens = rawTokens.map((t) => t.trim()).filter((t) => t.length > 0);

  if (tokens.length === 0) {
    return { ok: false, message: 'Enter a list of numbers, one per line or comma-separated.' };
  }

  const numbers: number[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    const n = Number(token);
    if (Number.isNaN(n)) invalid.push(token);
    else numbers.push(n);
  }

  if (invalid.length > 0) {
    return { ok: false, message: `Not a valid number: "${invalid[0]}"${invalid.length > 1 ? ` (+${invalid.length - 1} more)` : ''}.` };
  }

  return { ok: true, numbers };
}

function computeStats(numbers: number[]) {
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return {
    sum,
    average: sum / numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
}

type SortDirection = 'asc' | 'desc';

export default function NumberSorter() {
  const [input, setInput] = useState(SAMPLE);
  const [direction, setDirection] = useState<SortDirection>('asc');

  const parsed = useMemo(() => parseNumbers(input), [input]);

  const sorted = useMemo(() => {
    if (!parsed.ok) return null;
    const copy = [...parsed.numbers];
    copy.sort((a, b) => (direction === 'asc' ? a - b : b - a));
    return copy;
  }, [parsed, direction]);

  const stats = useMemo(() => (parsed.ok ? computeStats(parsed.numbers) : null), [parsed]);

  function copyOutput() {
    if (sorted) navigator.clipboard.writeText(sorted.join('\n'));
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
        <button
          className={`icon-btn${direction === 'asc' ? ' is-active' : ''}`}
          onClick={() => setDirection('asc')}
        >
          Ascending
        </button>
        <button
          className={`icon-btn${direction === 'desc' ? ' is-active' : ''}`}
          onClick={() => setDirection('desc')}
        >
          Descending
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Input (one per line or comma-separated)</span>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          <div className={`status-line ${parsed.ok ? 'status-valid' : 'status-invalid'}`}>
            {parsed.ok ? `✓ ${parsed.numbers.length} number(s)` : `✗ ${parsed.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Sorted result</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!sorted}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{sorted ? sorted.join('\n') : '// Enter valid numbers to see the sorted result'}</div>
        </div>
      </div>

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12,
            marginTop: 16,
          }}
        >
          {[
            ['Sum', Number(stats.sum.toFixed(4))],
            ['Average', Number(stats.average.toFixed(4))],
            ['Min', stats.min],
            ['Max', stats.max],
          ].map(([label, value]) => (
            <div key={label as string} className="panel" style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginTop: 4 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
