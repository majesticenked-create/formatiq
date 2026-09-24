'use client';

import { useMemo, useState } from 'react';
import { mulberry32, randomSeed, pickRandom, randomInt } from '@/lib/tools/seeded-random';

// Original curated word lists - not scraped from any competitor list.
const ADJECTIVES = [
  'moonlit', 'velvet', 'quiet', 'gilded', 'hazy', 'soft', 'wandering', 'faded',
  'dreamy', 'silver', 'lonely', 'wild', 'gentle', 'stormy', 'pale', 'amber',
  'hollow', 'twilight', 'rustic', 'feral',
];
const NOUNS = [
  'petal', 'ember', 'willow', 'orbit', 'echo', 'lantern', 'fox', 'meadow',
  'harbor', 'comet', 'thistle', 'raven', 'cove', 'marrow', 'sparrow', 'ash',
  'quartz', 'dune', 'cinder', 'wren',
];
const SEPARATORS = ['', '_', '.', '-'];

function generateUsername(rng: () => number, includeNumber: boolean): string {
  const adj = pickRandom(rng, ADJECTIVES);
  const noun = pickRandom(rng, NOUNS);
  const sep = pickRandom(rng, SEPARATORS);
  const suffix = includeNumber ? String(randomInt(rng, 1, 999)) : '';
  return `${adj}${sep}${noun}${suffix}`;
}

export default function AestheticUsernameGenerator() {
  const [includeNumber, setIncludeNumber] = useState(true);
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(() => randomSeed());

  const usernames = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => generateUsername(rng, includeNumber));
  }, [seed, count, includeNumber]);

  function copyAll() {
    navigator.clipboard.writeText(usernames.join('\n'));
  }

  return (
    <div>
      <div className="control-row">
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
          style={{ width: 64, padding: '4px 8px' }}
        />
        <button
          className={`icon-btn${includeNumber ? ' is-active' : ''}`}
          onClick={() => setIncludeNumber((v) => !v)}
        >
          Add number
        </button>
        <button className="icon-btn" onClick={() => setSeed(randomSeed())}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAll}>
          Copy all
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>{usernames.length} suggestions</span>
        </div>
        <div className="output mono">{usernames.join('\n')}</div>
        <div className="status-line status-neutral">
          These are name suggestions only - availability on any platform is not checked or guaranteed.
        </div>
      </div>
    </div>
  );
}
