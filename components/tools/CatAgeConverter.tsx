'use client';

import { useMemo, useState } from 'react';

// Widely-cited veterinary approximation (e.g. AAHA/AVMA-style guidance): a cat's
// first year is roughly 15 "human years", the second year adds about 9 more
// (24 total by age 2), and each year after that adds roughly 4. This is an
// average across breeds, not a precise medical calculation - see the FAQ.
function catToHumanYears(catYears: number): number {
  if (catYears <= 0) return 0;
  if (catYears <= 1) return 15 * catYears;
  if (catYears <= 2) return 15 + 9 * (catYears - 1);
  return 24 + 4 * (catYears - 2);
}

export default function CatAgeConverter() {
  const [input, setInput] = useState('3');

  const result = useMemo(() => {
    const trimmed = input.trim();
    const n = Number(trimmed);
    if (trimmed === '' || Number.isNaN(n) || n < 0) {
      return { ok: false as const, message: 'Enter your cat\'s age in years (0 or greater).' };
    }
    return { ok: true as const, n, human: catToHumanYears(n) };
  }, [input]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Cat&apos;s age (years):
        </label>
        <input
          type="number"
          className="mono"
          style={{ width: 120, padding: '8px 10px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          step="0.5"
          min="0"
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Equivalent human age</span>
        </div>
        <div className="output mono" style={{ fontSize: 24 }}>
          {result.ok ? `≈ ${Math.round(result.human)} human years` : `// ${result.message}`}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok
            ? `✓ Based on the common veterinary approximation, not a precise medical calculation`
            : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
