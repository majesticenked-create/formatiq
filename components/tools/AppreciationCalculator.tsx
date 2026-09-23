'use client';

import { useMemo, useState } from 'react';

function calculateAppreciation(initialValue: number, finalValue: number, years: number) {
  if (!Number.isFinite(initialValue) || initialValue <= 0) {
    return { ok: false as const, message: 'Enter an initial value greater than zero.' };
  }
  if (!Number.isFinite(finalValue) || finalValue < 0) {
    return { ok: false as const, message: 'Enter a final value of zero or greater.' };
  }

  const amount = finalValue - initialValue;
  const percent = (amount / initialValue) * 100;

  let annualizedRate: number | null = null;
  if (Number.isFinite(years) && years > 0) {
    annualizedRate = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
  }

  return { ok: true as const, amount, percent, annualizedRate };
}

export default function AppreciationCalculator() {
  const [initialValue, setInitialValue] = useState('100000');
  const [finalValue, setFinalValue] = useState('150000');
  const [years, setYears] = useState('5');

  const result = useMemo(() => {
    const initialNum = Number(initialValue);
    const finalNum = Number(finalValue);
    const yearsNum = years.trim() === '' ? 0 : Number(years);
    if (years.trim() !== '' && (!Number.isFinite(yearsNum) || yearsNum <= 0)) {
      return { ok: false as const, message: 'Time period must be greater than zero, or leave it blank.' };
    }
    return calculateAppreciation(initialNum, finalNum, yearsNum);
  }, [initialValue, finalValue, years]);

  const inputStyle = {
    width: 160,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    padding: '6px 8px',
  };

  const formatNumber = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Initial value:
        </label>
        <input
          type="number"
          value={initialValue}
          onChange={(e) => setInitialValue(e.target.value)}
          className="mono"
          style={inputStyle}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Final value:
        </label>
        <input
          type="number"
          value={finalValue}
          onChange={(e) => setFinalValue(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Time period (years, optional):
        </label>
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          className="mono"
          style={inputStyle}
          placeholder="e.g. 5"
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Appreciation</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Appreciation amount: ${result.amount >= 0 ? '+' : ''}${formatNumber(result.amount)}`,
                `Appreciation percent: ${result.percent >= 0 ? '+' : ''}${formatNumber(result.percent)}%`,
                result.annualizedRate !== null
                  ? `Annualized rate (CAGR): ${result.annualizedRate >= 0 ? '+' : ''}${formatNumber(result.annualizedRate)}% / year`
                  : '// Add a time period in years to see the annualized (CAGR) rate',
              ].join('\n')
            : '// Enter valid values above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
