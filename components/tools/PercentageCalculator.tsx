'use client';

import { useMemo, useState } from 'react';

type Mode = 'percentOf' | 'whatPercent' | 'percentChange';

function computePercentOf(x: string, y: string) {
  const xNum = Number(x);
  const yNum = Number(y);
  if (x === '' || y === '' || Number.isNaN(xNum) || Number.isNaN(yNum)) {
    return { ok: false as const, message: 'Enter both numbers.' };
  }
  return { ok: true as const, result: (xNum / 100) * yNum, formula: `(${xNum} / 100) × ${yNum}` };
}

function computeWhatPercent(x: string, y: string) {
  const xNum = Number(x);
  const yNum = Number(y);
  if (x === '' || y === '' || Number.isNaN(xNum) || Number.isNaN(yNum)) {
    return { ok: false as const, message: 'Enter both numbers.' };
  }
  if (yNum === 0) {
    return { ok: false as const, message: 'Cannot divide by zero - Y must not be 0.' };
  }
  return { ok: true as const, result: (xNum / yNum) * 100, formula: `(${xNum} / ${yNum}) × 100` };
}

function computePercentChange(x: string, y: string) {
  const xNum = Number(x);
  const yNum = Number(y);
  if (x === '' || y === '' || Number.isNaN(xNum) || Number.isNaN(yNum)) {
    return { ok: false as const, message: 'Enter both numbers.' };
  }
  if (xNum === 0) {
    return { ok: false as const, message: 'Cannot calculate change from zero - X must not be 0.' };
  }
  return { ok: true as const, result: ((yNum - xNum) / Math.abs(xNum)) * 100, formula: `((${yNum} - ${xNum}) / |${xNum}|) × 100` };
}

const MODE_CONFIG: Record<
  Mode,
  { label: string; xLabel: string; yLabel: string; compute: (x: string, y: string) => ReturnType<typeof computePercentOf>; suffix: string }
> = {
  percentOf: { label: 'X% of Y', xLabel: 'X (percent)', yLabel: 'Y (number)', compute: computePercentOf, suffix: '' },
  whatPercent: {
    label: 'X is what % of Y',
    xLabel: 'X (part)',
    yLabel: 'Y (whole)',
    compute: computeWhatPercent,
    suffix: '%',
  },
  percentChange: {
    label: '% change from X to Y',
    xLabel: 'X (original)',
    yLabel: 'Y (new)',
    compute: computePercentChange,
    suffix: '%',
  },
};

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('percentOf');
  const [x, setX] = useState('20');
  const [y, setY] = useState('150');

  const config = MODE_CONFIG[mode];
  const result = useMemo(() => config.compute(x, y), [config, x, y]);

  function switchMode(next: Mode) {
    setMode(next);
  }

  return (
    <div>
      <div className="control-row">
        {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => (
          <button
            key={m}
            className="icon-btn"
            style={{
              borderColor: mode === m ? 'var(--accent-dim)' : undefined,
              color: mode === m ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => switchMode(m)}
          >
            {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {config.xLabel}:
        </label>
        <input
          type="number"
          value={x}
          onChange={(e) => setX(e.target.value)}
          className="mono"
          style={{
            width: 120,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {config.yLabel}:
        </label>
        <input
          type="number"
          value={y}
          onChange={(e) => setY(e.target.value)}
          className="mono"
          style={{
            width: 120,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Result</span>
        </div>
        <div className="output mono">
          {result.ok
            ? `Formula: ${result.formula}\n\nResult: ${result.result.toLocaleString(undefined, { maximumFractionDigits: 4 })}${config.suffix}`
            : '// Enter values above to see the result'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
