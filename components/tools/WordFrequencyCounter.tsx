'use client';

import { useMemo, useState } from 'react';

const SAMPLE =
  'The quick brown fox jumps over the lazy dog. The dog barks, but the fox is already gone. It happens every time the fox visits.';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'has', 'have', 'he', 'her', 'his', 'i',
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their', 'this', 'to', 'was', 'we', 'were', 'will',
  'with', 'you', 'your', 'they', 'them', 'not', 'so', 'if', 'do', 'does', 'did', 'can', 'could', 'would', 'should',
  'my', 'me', 'our', 'us', 'am', 'been', 'being', 'had', 'having', 'what', 'which', 'who', 'whom', 'when', 'where',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only',
  'own', 'same', 'than', 'too', 'very', 'just', 'up', 'down', 'out', 'about', 'into', 'over', 'again',
]);

interface FreqEntry {
  word: string;
  count: number;
}

function computeFrequency(input: string, ignoreStopWords: boolean) {
  const words = input.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  const filtered = ignoreStopWords ? words.filter((w) => !STOP_WORDS.has(w)) : words;

  if (filtered.length === 0) {
    return { ok: false as const, message: ignoreStopWords ? 'No non-stop-words found in this text.' : 'Enter some text to analyze.' };
  }

  const counts = new Map<string, number>();
  for (const word of filtered) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const entries: FreqEntry[] = Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  return {
    ok: true as const,
    entries,
    totalWords: filtered.length,
    uniqueWords: entries.length,
    mostRepeated: entries[0],
  };
}

export default function WordFrequencyCounter() {
  const [input, setInput] = useState(SAMPLE);
  const [ignoreStopWords, setIgnoreStopWords] = useState(false);

  const result = useMemo(() => computeFrequency(input, ignoreStopWords), [input, ignoreStopWords]);

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
          className={`icon-btn ${ignoreStopWords ? 'is-active' : ''}`}
          onClick={() => setIgnoreStopWords((v) => !v)}
        >
          {ignoreStopWords ? 'Ignoring stop words' : 'Including stop words'}
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Input text</span>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok
            ? `✓ ${result.totalWords} words analyzed, ${result.uniqueWords} unique - most repeated: "${result.mostRepeated.word}" (${result.mostRepeated.count}×)`
            : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>Frequency table</span>
          </div>
          <div className="output mono">
            {result.entries.map((e) => `${e.word.padEnd(20)} ${e.count}`).join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
