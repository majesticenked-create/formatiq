'use client';

import { useMemo, useState } from 'react';
import { mulberry32, randomSeed, pickUnique } from '@/lib/tools/seeded-random';

type Category = 'strength' | 'flaw' | 'quirk' | 'motivation' | 'fear' | 'social';

// Original curated fiction-writing trait lists. Deliberately avoids real
// clinical/diagnostic terminology - everything here is a plain, everyday
// character trait suitable for creative writing, not a mental-health label.
const TRAITS: Record<Category, string[]> = {
  strength: [
    'resourceful', 'fiercely loyal', 'quick-witted', 'unshakably calm under pressure',
    'a natural leader', 'physically tireless', 'deeply observant', 'endlessly patient',
  ],
  flaw: [
    'overconfident', 'stubborn to a fault', 'impulsive', 'quick to hold a grudge',
    'chronically late', 'reckless with money', 'too trusting of strangers', 'prone to exaggeration',
  ],
  quirk: [
    'talks to inanimate objects', 'collects odd trinkets', 'hums without noticing',
    'always counts steps', 'names every vehicle they own', 'can\'t resist a dare',
    'reorganizes other people\'s shelves', 'refuses to eat food that touches',
  ],
  motivation: [
    'proving their family wrong', 'protecting a younger sibling', 'chasing a lost legacy',
    'earning a mentor\'s approval', 'escaping a small hometown', 'righting an old wrong',
    'building something that outlasts them', 'finally belonging somewhere',
  ],
  fear: [
    'being forgotten', 'losing control', 'failing publicly', 'abandonment',
    'becoming like a parent', 'the ocean at night', 'closed spaces', 'disappointing a mentor',
  ],
  social: [
    'the loud one in every room', 'quietly observes before speaking', 'makes friends instantly',
    'awkward with compliments', 'the group\'s peacemaker', 'terrible at small talk',
    'fiercely protective of close friends', 'avoids conflict at all costs',
  ],
};

const LABELS: Record<Category, string> = {
  strength: 'Strength',
  flaw: 'Flaw',
  quirk: 'Quirk',
  motivation: 'Motivation',
  fear: 'Fear',
  social: 'Social trait',
};

interface TraitSet {
  category: Category;
  trait: string;
}

function generateSet(rng: () => number, categories: Category[]): TraitSet[] {
  return categories.map((category) => ({
    category,
    trait: pickUnique(rng, TRAITS[category], 1)[0],
  }));
}

export default function CharacterTraitGenerator() {
  const [selected, setSelected] = useState<Category[]>(['strength', 'flaw', 'quirk', 'motivation']);
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(() => randomSeed());

  function toggleCategory(cat: Category) {
    setSelected((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  const characters = useMemo(() => {
    const rng = mulberry32(seed);
    const cats = selected.length ? selected : (Object.keys(TRAITS) as Category[]);
    return Array.from({ length: count }, () => generateSet(rng, cats));
  }, [seed, selected, count]);

  function copyAll() {
    const text = characters
      .map((sets, i) => `Character ${i + 1}\n${sets.map((s) => `  ${LABELS[s.category]}: ${s.trait}`).join('\n')}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <div className="control-row">
        {(Object.keys(TRAITS) as Category[]).map((cat) => (
          <button
            key={cat}
            className={`icon-btn${selected.includes(cat) ? ' is-active' : ''}`}
            onClick={() => toggleCategory(cat)}
          >
            {LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Characters:
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
          <span>{characters.length} character trait sets</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {characters.map((sets, i) => (
            <div key={i} className="mono" style={{ fontSize: 13 }}>
              <strong>Character {i + 1}</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {sets.map((s, j) => (
                  <li key={j}>
                    {LABELS[s.category]}: {s.trait}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="status-line status-neutral">
          Fiction-writing prompts only - traits are everyday character descriptions, never real
          clinical or diagnostic terminology.
        </div>
      </div>
    </div>
  );
}
