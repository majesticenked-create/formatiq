'use client';

import { useMemo, useState } from 'react';
import {
  COMPOUNDING_FREQUENCY_LABELS,
  CompoundingFrequency,
  solveForRate,
} from '@/lib/tools/finance-utils';

const FREQUENCIES: CompoundingFrequency[] = ['daily', 'monthly', 'quarterly', 'semiannually', 'annually'];

function calculateRequiredRate(
  principalStr: string,
  futureValueStr: string,
  yearsStr: string,
  frequency: CompoundingFrequency
) {
  const principal = Number(principalStr);
  const futureValue = Number(futureValueStr);
  const years = Number(yearsStr);

  if (!principalStr || Number.isNaN(principal) || principal <= 0) {
    return { ok: false as const, message: 'Enter a starting principal greater than zero.' };
  }
  if (!futureValueStr || Number.isNaN(futureValue) || futureValue <= 0) {
    return { ok: false as const, message: 'Enter a target future value greater than zero.' };
  }
  if (futureValue < principal) {
    return { ok: false as const, message: 'Future value must be greater than or equal to the starting principal - a rate can\'t explain a decline in this model.' };
  }
  if (!yearsStr || Number.isNaN(years) || years <= 0) {
    return { ok: false as const, message: 'Enter a time period (in years) greater than zero.' };
  }

  const rate = solveForRate(principal, futureValue, years, frequency);

  return { ok: true as const, rate };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function CompoundInterestRateCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [futureValue, setFutureValue] = useState('10511.62');
  const [years, setYears] = useState('1');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('monthly');

  const result = useMemo(
    () => calculateRequiredRate(principal, futureValue, years, frequency),
    [principal, futureValue, years, frequency]
  );

  const formatPercent = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Starting principal ($):
        </label>
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Target future value ($):
        </label>
        <input
          type="number"
          value={futureValue}
          onChange={(e) => setFutureValue(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Time period (years):
        </label>
        <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        {FREQUENCIES.map((f) => (
          <button
            key={f}
            className={`icon-btn${frequency === f ? ' is-active' : ''}`}
            onClick={() => setFrequency(f)}
          >
            {COMPOUNDING_FREQUENCY_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Required Interest Rate</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Required annual rate: ${formatPercent(result.rate)}%`,
                '',
                'Formula: r = n × ((A/P)^(1/(n × t)) − 1)',
              ].join('\n')
            : '// Enter principal, target future value, and time period above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
