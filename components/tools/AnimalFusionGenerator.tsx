'use client';

import { useMemo, useState } from 'react';
import { mulberry32, randomSeed, pickRandom } from '@/lib/tools/seeded-random';

// Original curated fictional-concept data - purely for playful text generation,
// not a claim about real biology or genetics.
const ANIMALS = [
  'Fox', 'Owl', 'Otter', 'Panther', 'Falcon', 'Wolf', 'Turtle', 'Hare',
  'Octopus', 'Bear', 'Crane', 'Lynx', 'Dolphin', 'Raven', 'Stag', 'Gecko',
];

const TRAITS = [
  'can glide short distances between trees',
  'has bioluminescent markings that glow faintly at dusk',
  'is unusually good at solving puzzles',
  'hums a low, resonant tone when content',
  'changes color slightly with its mood',
  'has an uncanny memory for faces',
  'moves in short, sudden bursts of speed',
  'prefers to nest near running water',
  'has a thick, weatherproof coat',
  'communicates through a series of clicks and chirps',
];

const PREFIXES = ['', '', 'Silver', 'Shadow', 'Star', 'Ember'];

function buildFusionName(a: string, b: string, prefix: string): string {
  const aPart = a.slice(0, Math.ceil(a.length * 0.55));
  const bPart = b.slice(Math.floor(b.length * 0.4));
  const name = `${aPart}${bPart}`.replace(/(.)\1{2,}/g, '$1$1');
  return prefix ? `${prefix}${name}` : name;
}

interface Fusion {
  name: string;
  animalA: string;
  animalB: string;
  trait: string;
}

function generateFusion(rng: () => number): Fusion {
  const animalA = pickRandom(rng, ANIMALS);
  let animalB = pickRandom(rng, ANIMALS);
  while (animalB === animalA) animalB = pickRandom(rng, ANIMALS);
  const prefix = pickRandom(rng, PREFIXES);
  const trait = pickRandom(rng, TRAITS);
  return { name: buildFusionName(animalA, animalB, prefix), animalA, animalB, trait };
}

export default function AnimalFusionGenerator() {
  const [count, setCount] = useState(5);
  const [seed, setSeed] = useState(() => randomSeed());

  const fusions = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => generateFusion(rng));
  }, [seed, count]);

  function copyAll() {
    const text = fusions
      .map((f) => `${f.name} (${f.animalA} + ${f.animalB}) - ${f.trait}`)
      .join('\n');
    navigator.clipboard.writeText(text);
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
          max={20}
          value={count}
          onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
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
          <span>{fusions.length} fictional fusions</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fusions.map((f, i) => (
            <div key={i} className="mono" style={{ fontSize: 13 }}>
              <strong>{f.name}</strong> ({f.animalA} + {f.animalB})
              <div style={{ color: 'var(--text-secondary)' }}>{f.trait}</div>
            </div>
          ))}
        </div>
        <div className="status-line status-neutral">
          Fictional concept names and traits only - text-based, not an image generator, and not a claim
          about real animal biology or breeding.
        </div>
      </div>
    </div>
  );
}
