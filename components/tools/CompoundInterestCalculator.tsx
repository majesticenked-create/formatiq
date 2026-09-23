'use client';

import { useMemo, useState } from 'react';
import {
  COMPOUNDING_FREQUENCY_LABELS,
  CompoundingFrequency,
  compoundBalance,
} from '@/lib/tools/finance-utils';

const FREQUENCIES: CompoundingFrequency[] = ['daily', 'monthly', 'quarterly', 'semiannually', 'annually'];

function calculateCompoundInterest(
  principalStr: string,
  rateStr: string,
  yearsStr: string,
  frequency: CompoundingFrequency
) {
  const principal = Number(principalStr);
  const rate = Number(rateStr);
  const years = Number(yearsStr);

  if (!principalStr || Number.isNaN(principal) || principal <= 0) {
    return { ok: false as const, message: 'Enter a starting principal greater than zero.' };
  }
  if (rateStr === '' || Number.isNaN(rate) || rate < 0) {
    return { ok: false as const, message: 'Enter an annual interest rate of zero or greater.' };
  }
  if (!yearsStr || Number.isNaN(years) || years <= 0) {
    return { ok: false as const, message: 'Enter a time period (in years) greater than zero.' };
  }

  const futureValue = compoundBalance(principal, rate, frequency, years);
  const interestEarned = futureValue - principal;

  return { ok: true as const, futureValue, interestEarned };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('1');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('monthly');

  const result = useMemo(
    () => calculateCompoundInterest(principal, rate, years, frequency),
    [principal, rate, years, frequency]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
          Annual interest rate (%):
        </label>
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mono" style={inputStyle} />
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
          <span>Future Value</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Future value: $${formatMoney(result.futureValue)}`,
                `Interest earned: $${formatMoney(result.interestEarned)}`,
                '',
                'Formula: A = P × (1 + r/n)^(n × t)',
              ].join('\n')
            : '// Enter principal, rate, and time period above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
