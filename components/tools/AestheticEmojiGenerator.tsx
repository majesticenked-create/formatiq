'use client';

import { useMemo, useState } from 'react';
import { mulberry32, randomSeed, pickUnique } from '@/lib/tools/seeded-random';

// Original curated theme pools - not scraped from any competitor list.
const THEMES: Record<string, string[]> = {
  soft: ['🩶', '🤍', '🫧', '☁️', '🕊️', '🧸', '🎀', '🥛'],
  nature: ['🌿', '🍃', '🌸', '🌼', '🍄', '🌾', '🪴', '🦋'],
  celestial: ['✨', '🌙', '⭐', '🌟', '☄️', '🪐', '🌌', '🔮'],
  hearts: ['💗', '💕', '💖', '🩷', '❤️‍🔥', '💘', '💞', '🫶'],
  sparkles: ['✨', '💫', '⚡', '🎇', '🎆', '🌠', '💎', '🔆'],
  coquette: ['🎀', '🍒', '💋', '🩰', '👛', '🪩', '🧁', '🍰'],
};

const SEPARATORS = ['', ' ', '  '];

function generateCombos(theme: string, count: number, symbolsPerCombo: number, seed: number): string[] {
  const rng = mulberry32(seed);
  const pool = THEMES[theme] ?? THEMES.soft;
  const combos: string[] = [];
  for (let i = 0; i < count; i++) {
    const chosen = pickUnique(rng, pool, Math.min(symbolsPerCombo, pool.length));
    const sep = SEPARATORS[Math.floor(rng() * SEPARATORS.length)];
    combos.push(chosen.join(sep));
  }
  return combos;
}

export default function AestheticEmojiGenerator() {
  const [theme, setTheme] = useState<keyof typeof THEMES>('soft');
  const [symbolsPerCombo, setSymbolsPerCombo] = useState(3);
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(() => randomSeed());

  const combos = useMemo(
    () => generateCombos(theme, count, symbolsPerCombo, seed),
    [theme, count, symbolsPerCombo, seed]
  );

  function copyAll() {
    navigator.clipboard.writeText(combos.join('\n'));
  }

  return (
    <div>
      <div className="control-row">
        {Object.keys(THEMES).map((t) => (
          <button
            key={t}
            className={`icon-btn${theme === t ? ' is-active' : ''}`}
            onClick={() => setTheme(t as keyof typeof THEMES)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Symbols each:
        </label>
        <input
          type="number"
          min={1}
          max={6}
          value={symbolsPerCombo}
          onChange={(e) => setSymbolsPerCombo(Math.min(6, Math.max(1, Number(e.target.value) || 1)))}
          className="mono"
          style={{ width: 56, padding: '4px 8px' }}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Count:
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
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
          <span>{combos.length} generated</span>
        </div>
        <div className="output mono" style={{ fontSize: 18 }}>
          {combos.join('\n')}
        </div>
        <div className="status-line status-neutral">
          Curated original symbol pools, combined for you - no external theme database involved.
        </div>
      </div>
    </div>
  );
}
