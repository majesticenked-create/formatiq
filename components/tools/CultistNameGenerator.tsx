'use client';

import { useMemo, useState } from 'react';
import { mulberry32, randomSeed } from '@/lib/tools/seeded-random';
import { generateCultistNameWithTitle, generateCultistOrderName } from '@/lib/tools/cultist-names';

type Mode = 'person' | 'order';

export default function CultistNameGenerator() {
  const [mode, setMode] = useState<Mode>('person');
  const [count, setCount] = useState(5);
  const [seed, setSeed] = useState(() => randomSeed());

  const results = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () =>
      mode === 'person' ? (() => { const r = generateCultistNameWithTitle(rng); return `${r.name}, ${r.title}`; })() : generateCultistOrderName(rng),
    );
  }, [seed, count, mode]);

  function copyAll() {
    navigator.clipboard.writeText(results.join('\n'));
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'person' ? ' is-active' : ''}`} onClick={() => setMode('person')}>
          Individual name
        </button>
        <button className={`icon-btn${mode === 'order' ? ' is-active' : ''}`} onClick={() => setMode('order')}>
          Fictional order name
        </button>
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Count:
        </label>
        <input
          type="number"
          min={1}
          max={30}
          value={count}
          onChange={(e) => setCount(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
          className="mono"
          style={{ width: 56, padding: '4px 8px' }}
        />
        <button className="icon-btn" onClick={() => setSeed(randomSeed())}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAll}>
          Copy all
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>{results.length} generated</span>
        </div>
        <ul className="mono" style={{ padding: '12px 28px', margin: 0 }}>
          {results.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        <div className="status-line status-neutral">
          A creative-writing name generator for dark-fantasy fiction. Every name, title, and order is built from
          entirely original invented word fragments - nothing here is drawn from any real religion, real
          organization, or existing franchise, and there is no ritual or recruitment content, only name strings
          for use in stories, tabletop games, or worldbuilding.
        </div>
      </div>
    </div>
  );
}
