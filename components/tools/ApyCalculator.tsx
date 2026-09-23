'use client';

import { useMemo, useState } from 'react';
import {
  COMPOUNDING_FREQUENCY_LABELS as FREQUENCY_LABELS,
  COMPOUNDING_PERIODS_PER_YEAR as FREQUENCY_N,
  CompoundingFrequency as Frequency,
  nominalRateToApy,
} from '@/lib/tools/finance-utils';

function calculateApy(ratePercent: number, frequency: Frequency) {
  if (!Number.isFinite(ratePercent) || ratePercent < 0) {
    return { ok: false as const, message: 'Enter a nominal interest rate of zero or greater.' };
  }
  if (ratePercent > 1000) {
    return { ok: false as const, message: 'That rate looks unrealistic - enter a value of 1000% or less.' };
  }

  const n = FREQUENCY_N[frequency];
  const r = ratePercent / 100;
  const apy = nominalRateToApy(ratePercent, frequency);

  return { ok: true as const, apy, n, r };
}

export default function ApyCalculator() {
  const [rate, setRate] = useState('5');
  const [frequency, setFrequency] = useState<Frequency>('monthly');

  const result = useMemo(() => calculateApy(Number(rate), frequency), [rate, frequency]);

  const inputStyle = {
    width: 140,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    padding: '6px 8px',
  };

  const formatNumber = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Nominal interest rate (APR %):
        </label>
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => (
          <button
            key={f}
            className={`icon-btn${frequency === f ? ' is-active' : ''}`}
            onClick={() => setFrequency(f)}
          >
            {FREQUENCY_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>APY</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `APY: ${formatNumber(result.apy)}%`,
                '',
                `Formula: APY = (1 + r/n)^n - 1`,
                `       = (1 + ${(result.r).toFixed(4)}/${result.n})^${result.n} - 1`,
                `       = ${formatNumber(result.apy)}%`,
              ].join('\n')
            : '// Enter a valid interest rate above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
