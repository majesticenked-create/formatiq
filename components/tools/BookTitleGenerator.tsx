'use client';

import { useMemo, useState } from 'react';
import { mulberry32, randomSeed, pickRandom } from '@/lib/tools/seeded-random';

type Genre = 'fantasy' | 'mystery' | 'romance' | 'sci-fi' | 'horror' | 'nonfiction';

// Original curated genre word banks and templates.
const WORD_BANKS: Record<Genre, { nouns: string[]; adjectives: string[]; places: string[] }> = {
  fantasy: {
    nouns: ['Crown', 'Throne', 'Blade', 'Ember', 'Oath', 'Kingdom', 'Serpent', 'Flame'],
    adjectives: ['Forgotten', 'Broken', 'Last', 'Hidden', 'Silent', 'Iron', 'Ashen'],
    places: ['Thornwood', 'the Shattered Isles', 'Everfall', 'the Grey Citadel', 'Duskmere'],
  },
  mystery: {
    nouns: ['Cipher', 'Letter', 'Witness', 'Alibi', 'Ledger', 'Confession', 'Verdict'],
    adjectives: ['Silent', 'Missing', 'Final', 'Unsolved', 'Quiet', 'Vanishing'],
    places: ['Cedar Hollow', 'the Old Quarter', 'Blackwell Manor', 'Harrow Street'],
  },
  romance: {
    nouns: ['Promise', 'Letter', 'Summer', 'Heart', 'Wedding', 'Vow', 'Reunion'],
    adjectives: ['Sweet', 'Unexpected', 'Second', 'Quiet', 'Golden', 'Lingering'],
    places: ['the Coast', 'Willow Creek', 'Provence', 'the Old Bookshop'],
  },
  'sci-fi': {
    nouns: ['Signal', 'Colony', 'Protocol', 'Horizon', 'Fracture', 'Ascension', 'Drift'],
    adjectives: ['Last', 'Silent', 'Distant', 'Fractured', 'Synthetic', 'Dormant'],
    places: ['Kepler Station', 'the Outer Belt', 'New Meridian', 'the Dead Sector'],
  },
  horror: {
    nouns: ['Whisper', 'Hollow', 'Ritual', 'Descent', 'Marrow', 'Vigil', 'Rot'],
    adjectives: ['Silent', 'Unseen', 'Crawling', 'Buried', 'Waking', 'Rotten'],
    places: ['Blackmoor', 'the Old Asylum', 'Hollow Creek', 'the Sunken House'],
  },
  nonfiction: {
    nouns: ['Guide', 'History', 'Method', 'Principles', 'Case', 'Blueprint', 'Framework'],
    adjectives: ['Essential', 'Practical', 'Complete', 'Hidden', 'Modern', 'Untold'],
    places: [],
  },
};

const TEMPLATES = [
  (adj: string, noun: string) => `The ${adj} ${noun}`,
  (adj: string, noun: string, place: string) => (place ? `${noun} of ${place}` : `The ${adj} ${noun}`),
  (adj: string, noun: string) => `${adj} ${noun}s`,
  (adj: string, noun: string, place: string, kw?: string) =>
    kw ? `The ${adj} ${kw}: A ${noun}'s Tale` : `The ${adj} ${noun}`,
];

function generateTitle(rng: () => number, genre: Genre, keyword: string): string {
  const bank = WORD_BANKS[genre];
  const adj = pickRandom(rng, bank.adjectives);
  const noun = pickRandom(rng, bank.nouns);
  const place = bank.places.length ? pickRandom(rng, bank.places) : '';
  const template = pickRandom(rng, TEMPLATES);
  return template(adj, noun, place, keyword || undefined);
}

export default function BookTitleGenerator() {
  const [genre, setGenre] = useState<Genre>('fantasy');
  const [keyword, setKeyword] = useState('');
  const [count, setCount] = useState(8);
  const [seed, setSeed] = useState(() => randomSeed());

  const titles = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => generateTitle(rng, genre, keyword.trim()));
  }, [seed, genre, keyword, count]);

  function copyAll() {
    navigator.clipboard.writeText(titles.join('\n'));
  }

  return (
    <div>
      <div className="control-row">
        {(Object.keys(WORD_BANKS) as Genre[]).map((g) => (
          <button key={g} className={`icon-btn${genre === g ? ' is-active' : ''}`} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      <div className="control-row">
        <input
          type="text"
          className="mono"
          placeholder="Optional keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: '4px 8px', flex: 1 }}
        />
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
          <span>{titles.length} generated titles</span>
        </div>
        <div className="output mono">{titles.join('\n')}</div>
        <div className="status-line status-neutral">
          Generated titles may resemble existing published works - always search before using a title
          commercially. No uniqueness or trademark-safety is claimed or checked.
        </div>
      </div>
    </div>
  );
}
