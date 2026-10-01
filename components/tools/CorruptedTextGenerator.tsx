'use client';

import { useMemo, useState } from 'react';
import { generateCorruptedText, MAX_INPUT_LENGTH, type Intensity } from '@/lib/tools/corrupted-text';

const INTENSITIES: { value: Intensity; label: string }[] = [
  { value: 'low', label: 'Low (1-2 marks/char)' },
  { value: 'medium', label: 'Medium (2-4 marks/char)' },
  { value: 'high', label: 'High (4-7 marks/char)' },
];

export default function CorruptedTextGenerator() {
  const [input, setInput] = useState('Corrupted text');
  const [intensity, setIntensity] = useState<Intensity>('medium');
  const [seed, setSeed] = useState(0);

  const truncated = input.slice(0, MAX_INPUT_LENGTH);
  const wasTruncated = input.length > MAX_INPUT_LENGTH;

  const output = useMemo(() => {
    // Simple deterministic-per-render rng seeded by `seed` so "Reroll" gives a fresh
    // result without needing Math.random directly in this component.
    let s = seed + 1;
    const rng = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return (s % 10000) / 10000;
    };
    return generateCorruptedText(truncated, intensity, rng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truncated, intensity, seed]);

  function copy() {
    navigator.clipboard.writeText(output);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Original text (max {MAX_INPUT_LENGTH} characters)</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
          maxLength={MAX_INPUT_LENGTH}
          spellCheck={false}
        />
        {wasTruncated && (
          <div className="status-line status-neutral">
            Input longer than {MAX_INPUT_LENGTH} characters is truncated to keep output from
            becoming an unreadable, page-breaking wall of text.
          </div>
        )}
      </div>

      <div className="control-row">
        {INTENSITIES.map((i) => (
          <button
            key={i.value}
            className={`icon-btn ${intensity === i.value ? 'is-active' : ''}`}
            onClick={() => setIntensity(i.value)}
          >
            {i.label}
          </button>
        ))}
        <button className="icon-btn" onClick={() => setSeed((s) => s + 1)}>
          Reroll
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16, marginTop: 16 }}>
        <div className="panel-bar">
          <span>Original</span>
        </div>
        <div className="mono" style={{ padding: 12 }}>
          {truncated || '(empty)'}
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Corrupted output</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copy} disabled={!output}>
              Copy
            </button>
          </div>
        </div>
        <div className="output mono" style={{ minHeight: 'auto', padding: '10px 12px', wordBreak: 'break-word' }}>
          {output || '- enter text above'}
        </div>
        <div className="status-line status-neutral">
          Built with Unicode combining diacritical marks layered above, below, and through each
          character. Intensity is hard-capped in code, not just limited by the UI, so output can
          never exceed a bounded number of marks per character regardless of input.
        </div>
      </div>
    </div>
  );
}
