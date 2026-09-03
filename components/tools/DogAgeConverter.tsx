'use client';

import { useMemo, useState } from 'react';

// Widely-cited veterinary approximation (e.g. AVMA-style guidance): a dog's first
// year is roughly 15 "human years", the second year adds about 9 more (24 total
// by age 2), and each year after that adds roughly 5. Real aging rate varies
// significantly by breed and size (small breeds age slower after year 2, large
// breeds faster) - this is a single-rate average, not breed-specific. See the FAQ.
function dogToHumanYears(dogYears: number): number {
  if (dogYears <= 0) return 0;
  if (dogYears <= 1) return 15 * dogYears;
  if (dogYears <= 2) return 15 + 9 * (dogYears - 1);
  return 24 + 5 * (dogYears - 2);
}

export default function DogAgeConverter() {
  const [input, setInput] = useState('3');

  const result = useMemo(() => {
    const trimmed = input.trim();
    const n = Number(trimmed);
    if (trimmed === '' || Number.isNaN(n) || n < 0) {
      return { ok: false as const, message: 'Enter your dog\'s age in years (0 or greater).' };
    }
    return { ok: true as const, n, human: dogToHumanYears(n) };
  }, [input]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Dog&apos;s age (years):
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
            ? `✓ Based on a common veterinary approximation - real aging rate varies significantly by breed and size`
            : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
