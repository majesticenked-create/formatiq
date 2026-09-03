'use client';

import { useMemo, useState } from 'react';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function parseNumbers(input: string): number[] | null {
  const parts = input.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length < 2) return null;

  const nums: number[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n <= 0) return null;
    nums.push(n);
  }
  return nums;
}

export default function GcdCalculator() {
  const [input, setInput] = useState('48, 60, 18');

  const result = useMemo(() => {
    const nums = parseNumbers(input);
    if (!nums) {
      return { ok: false as const, message: 'Enter 2 or more positive whole numbers, separated by commas.' };
    }
    const result = nums.reduce((acc, n) => gcd(acc, n));
    return { ok: true as const, nums, result };
  }, [input]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Numbers:
        </label>
        <input
          className="mono"
          style={{ flex: 1, padding: '8px 10px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="48, 60, 18"
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Greatest common divisor</span>
        </div>
        <div className="output mono" style={{ fontSize: 24 }}>
          {result.ok ? result.result.toLocaleString('en-US') : `// ${result.message}`}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ GCD(${result.nums.join(', ')}) = ${result.result.toLocaleString('en-US')}` : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
