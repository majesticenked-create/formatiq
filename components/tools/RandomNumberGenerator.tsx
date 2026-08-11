'use client';

import { useState } from 'react';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNumbers(min: number, max: number, count: number, allowDuplicates: boolean): { ok: true; numbers: number[] } | { ok: false; message: string } {
  if (min > max) {
    return { ok: false, message: 'Min must be less than or equal to max.' };
  }

  const rangeSize = max - min + 1;
  if (!allowDuplicates && count > rangeSize) {
    return { ok: false, message: `Cannot generate ${count} unique numbers - the range only contains ${rangeSize} possible values.` };
  }

  if (allowDuplicates) {
    return { ok: true, numbers: Array.from({ length: count }, () => randomInt(min, max)) };
  }

  const pool = Array.from({ length: rangeSize }, (_, i) => min + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { ok: true, numbers: pool.slice(0, count) };
}

export default function RandomNumberGenerator() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [result, setResult] = useState<{ ok: true; numbers: number[] } | { ok: false; message: string }>(() =>
    generateNumbers(1, 100, 10, true)
  );

  function generate() {
    setResult(generateNumbers(min, max, count, allowDuplicates));
  }

  function copyAll() {
    if (result.ok) navigator.clipboard.writeText(result.numbers.join('\n'));
  }

  const inputStyle = {
    width: 90,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    padding: '6px 8px',
  };

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Min:
        </label>
        <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value) || 0)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Max:
        </label>
        <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value) || 0)} className="mono" style={inputStyle} />
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
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: allowDuplicates ? 'var(--accent-dim)' : undefined,
            color: allowDuplicates ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setAllowDuplicates((v) => !v)}
        >
          {allowDuplicates ? 'Duplicates allowed' : 'Duplicates blocked'}
        </button>
        <button className="btn btn-primary" onClick={generate}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAll} disabled={!result.ok}>
          Copy all
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Generated numbers</span>
        </div>
        <div className="output mono">{result.ok ? result.numbers.join('\n') : ''}</div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `${result.numbers.length} generated` : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
