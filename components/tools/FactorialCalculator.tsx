'use client';

import { useMemo, useState } from 'react';

function factorial(n: number): bigint {
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) {
    result *= i;
  }
  return result;
}

const MAX_N = 5000;

export default function FactorialCalculator() {
  const [input, setInput] = useState('10');

  const result = useMemo(() => {
    const trimmed = input.trim();
    const n = Number(trimmed);
    if (trimmed === '' || !Number.isInteger(n) || n < 0) {
      return { ok: false as const, message: 'Enter a whole number 0 or greater.' };
    }
    if (n > MAX_N) {
      return { ok: false as const, message: `Numbers above ${MAX_N} produce a result too large to display usefully.` };
    }
    return { ok: true as const, n, value: factorial(n) };
  }, [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.value.toString());
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          n:
        </label>
        <input
          type="number"
          className="mono"
          style={{ width: 120, padding: '8px 10px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>{result.ok ? `${result.n}!` : 'Result'}</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
              Copy
            </button>
          </div>
        </div>
        <div className="output mono" style={{ wordBreak: 'break-all' }}>
          {result.ok ? result.value.toLocaleString('en-US') : `// ${result.message}`}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ Exact value, computed with arbitrary-precision arithmetic` : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
