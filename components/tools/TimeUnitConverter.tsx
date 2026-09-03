'use client';

import { useMemo, useState } from 'react';

const UNIT_TO_SECONDS: Record<string, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  weeks: 604800,
};

const UNITS = ['seconds', 'minutes', 'hours', 'days', 'weeks'];

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

export default function TimeUnitConverter() {
  const [value, setValue] = useState('72');
  const [fromUnit, setFromUnit] = useState('hours');
  const [toUnit, setToUnit] = useState('days');

  const result = useMemo(() => {
    const n = Number(value);
    if (value.trim() === '' || Number.isNaN(n)) {
      return { ok: false as const, message: 'Enter a number to convert.' };
    }
    const seconds = n * UNIT_TO_SECONDS[fromUnit];
    const converted = seconds / UNIT_TO_SECONDS[toUnit];
    return { ok: true as const, converted };
  }, [value, fromUnit, toUnit]);

  return (
    <div>
      <div className="control-row">
        <input
          type="number"
          className="mono"
          style={{ width: 120, padding: '8px 10px' }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <select className="mono" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} style={{ padding: '8px 10px' }}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <span style={{ color: 'var(--text-secondary)' }}>→</span>
        <select className="mono" value={toUnit} onChange={(e) => setToUnit(e.target.value)} style={{ padding: '8px 10px' }}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <button
          className="icon-btn"
          onClick={() => {
            setFromUnit(toUnit);
            setToUnit(fromUnit);
          }}
        >
          Swap
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Result</span>
        </div>
        <div className="output mono" style={{ fontSize: 20 }}>
          {result.ok ? `${formatResult(result.converted)} ${toUnit}` : `// ${result.message}`}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ ${value} ${fromUnit} = ${formatResult(result.converted)} ${toUnit}` : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
