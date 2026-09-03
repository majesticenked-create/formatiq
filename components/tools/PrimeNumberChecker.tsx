'use client';

import { useMemo, useState } from 'react';

function isPrime(n: number): { prime: boolean; factor?: number } {
  if (n < 2) return { prime: false };
  if (n === 2) return { prime: true };
  if (n % 2 === 0) return { prime: false, factor: 2 };
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return { prime: false, factor: i };
  }
  return { prime: true };
}

export default function PrimeNumberChecker() {
  const [input, setInput] = useState('97');

  const result = useMemo(() => {
    const trimmed = input.trim();
    const n = Number(trimmed);
    if (trimmed === '' || !Number.isInteger(n)) {
      return { ok: false as const, message: 'Enter a whole number.' };
    }
    if (n > Number.MAX_SAFE_INTEGER) {
      return { ok: false as const, message: 'Number is too large to check reliably.' };
    }
    return { ok: true as const, n, ...isPrime(n) };
  }, [input]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Number:
        </label>
        <input
          type="number"
          className="mono"
          style={{ width: 200, padding: '8px 10px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Result</span>
        </div>
        {result.ok ? (
          <>
            <div className="output mono" style={{ fontSize: 24 }}>
              {result.n} is {result.prime ? 'prime' : 'not prime'}
            </div>
            <div className={`status-line ${result.prime ? 'status-valid' : 'status-invalid'}`}>
              {result.prime
                ? `✓ ${result.n} has no divisors other than 1 and itself.`
                : result.factor
                ? `✗ ${result.n} is divisible by ${result.factor}.`
                : `✗ ${result.n} is not a prime number.`}
            </div>
          </>
        ) : (
          <div className="status-line status-invalid">✗ {result.message}</div>
        )}
      </div>
    </div>
  );
}
