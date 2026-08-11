'use client';

import { useMemo, useState } from 'react';

const SAMPLE = 'The quick brown fox jumps over the lazy dog.';

interface FreqEntry {
  char: string;
  count: number;
}

function computeFrequency(input: string, lettersOnly: boolean) {
  const chars = lettersOnly ? input.toLowerCase().replace(/[^a-z]/g, '') : input;

  if (!chars) {
    return { ok: false as const, message: lettersOnly ? 'No letters found in this text.' : 'Enter some text to analyze.' };
  }

  const counts = new Map<string, number>();
  for (const char of chars) {
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }

  const entries: FreqEntry[] = Array.from(counts.entries())
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count);

  return {
    ok: true as const,
    entries,
    totalUnique: entries.length,
    mostCommon: entries[0],
    leastCommon: entries[entries.length - 1],
  };
}

function displayChar(char: string): string {
  if (char === ' ') return '(space)';
  if (char === '\n') return '(newline)';
  if (char === '\t') return '(tab)';
  return char;
}

export default function CharacterFrequencyCounter() {
  const [input, setInput] = useState(SAMPLE);
  const [lettersOnly, setLettersOnly] = useState(false);

  const result = useMemo(() => computeFrequency(input, lettersOnly), [input, lettersOnly]);

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
          className="icon-btn"
          style={{
            borderColor: lettersOnly ? 'var(--accent-dim)' : undefined,
            color: lettersOnly ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setLettersOnly((v) => !v)}
        >
          {lettersOnly ? 'Letters only' : 'All characters'}
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Input text</span>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok
            ? `✓ ${result.totalUnique} unique - most common: "${displayChar(result.mostCommon.char)}" (${result.mostCommon.count}×), least common: "${displayChar(result.leastCommon.char)}" (${result.leastCommon.count}×)`
            : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>Frequency table</span>
          </div>
          <div className="output mono">
            {result.entries.map((e) => `${displayChar(e.char).padEnd(10)} ${e.count}`).join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
