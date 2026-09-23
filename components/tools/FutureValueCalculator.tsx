'use client';

import { useMemo, useState } from 'react';
import {
  COMPOUNDING_FREQUENCY_LABELS,
  COMPOUNDING_PERIODS_PER_YEAR,
  CompoundingFrequency,
  compoundBalance,
  futureValueOfContributions,
} from '@/lib/tools/finance-utils';

const FREQUENCIES: CompoundingFrequency[] = ['daily', 'monthly', 'quarterly', 'semiannually', 'annually'];

function calculateFutureValue(
  principalStr: string,
  contributionStr: string,
  rateStr: string,
  yearsStr: string,
  frequency: CompoundingFrequency
) {
  const principal = Number(principalStr);
  const contribution = Number(contributionStr);
  const rate = Number(rateStr);
  const years = Number(yearsStr);

  if (!principalStr || Number.isNaN(principal) || principal < 0) {
    return { ok: false as const, message: 'Enter a starting principal of zero or greater.' };
  }
  if (contributionStr === '' || Number.isNaN(contribution) || contribution < 0) {
    return { ok: false as const, message: 'Enter a periodic contribution of zero or greater.' };
  }
  if (rateStr === '' || Number.isNaN(rate) || rate < 0) {
    return { ok: false as const, message: 'Enter an annual interest rate of zero or greater.' };
  }
  if (!yearsStr || Number.isNaN(years) || years <= 0) {
    return { ok: false as const, message: 'Enter a time period (in years) greater than zero.' };
  }

  const lumpSumFv = compoundBalance(principal, rate, frequency, years);
  const contributionsFv = futureValueOfContributions(contribution, rate, frequency, years);
  const futureValue = lumpSumFv + contributionsFv;
  const totalContributed = principal + contribution * COMPOUNDING_PERIODS_PER_YEAR[frequency] * years;
  const totalInterest = futureValue - totalContributed;

  return { ok: true as const, futureValue, totalContributed, totalInterest };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function FutureValueCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [contribution, setContribution] = useState('100');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('monthly');

  const result = useMemo(
    () => calculateFutureValue(principal, contribution, rate, years, frequency),
    [principal, contribution, rate, years, frequency]
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
          Contribution per period ($):
        </label>
        <input
          type="number"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
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
                `Total contributed: $${formatMoney(result.totalContributed)}`,
                `Interest earned: $${formatMoney(result.totalInterest)}`,
                '',
                'Contributions are added at the end of each period (ordinary annuity).',
                'Formula: FV = P × (1+r/n)^(n×t) + C × (((1+r/n)^(n×t) − 1) / (r/n))',
              ].join('\n')
            : '// Enter principal, contribution, rate, and time period above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
