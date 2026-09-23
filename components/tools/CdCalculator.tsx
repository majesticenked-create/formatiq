'use client';

import { useMemo, useState } from 'react';
import {
  COMPOUNDING_FREQUENCY_LABELS,
  CompoundingFrequency,
  compoundBalance,
} from '@/lib/tools/finance-utils';

const FREQUENCIES: CompoundingFrequency[] = ['daily', 'monthly', 'quarterly', 'semiannually', 'annually'];

function calculateCd(depositStr: string, aprStr: string, termYearsStr: string, frequency: CompoundingFrequency) {
  const deposit = Number(depositStr);
  const apr = Number(aprStr);
  const termYears = Number(termYearsStr);

  if (!depositStr || Number.isNaN(deposit) || deposit <= 0) {
    return { ok: false as const, message: 'Enter an initial deposit greater than zero.' };
  }
  if (aprStr === '' || Number.isNaN(apr) || apr < 0) {
    return { ok: false as const, message: 'Enter an APR of zero or greater.' };
  }
  if (!termYearsStr || Number.isNaN(termYears) || termYears <= 0) {
    return { ok: false as const, message: 'Enter a term (in years) greater than zero.' };
  }

  const endingBalance = compoundBalance(deposit, apr, frequency, termYears);
  const interestEarned = endingBalance - deposit;

  return { ok: true as const, endingBalance, interestEarned };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function CdCalculator() {
  const [deposit, setDeposit] = useState('10000');
  const [apr, setApr] = useState('5');
  const [termYears, setTermYears] = useState('1');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('monthly');

  const result = useMemo(
    () => calculateCd(deposit, apr, termYears, frequency),
    [deposit, apr, termYears, frequency]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div
        className="status-line"
        style={{
          background: 'var(--status-invalid-bg, rgba(255,0,0,0.06))',
          border: '1px solid var(--accent-dim)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 12,
        }}
      >
        ⚠ Enter the nominal annual rate (APR) the CD compounds at - not an already-annualized APY. If your CD&rsquo;s
        rate is quoted as APY instead, select &ldquo;Annually&rdquo; as the compounding frequency below, since an
        APY compounds only once per year by definition.
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Initial deposit ($):
        </label>
        <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Nominal interest rate (APR %):
        </label>
        <input type="number" value={apr} onChange={(e) => setApr(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Term (years):
        </label>
        <input
          type="number"
          value={termYears}
          onChange={(e) => setTermYears(e.target.value)}
          className="mono"
          style={inputStyle}
        />
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
          <span>CD Balance at Maturity</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Ending balance: $${formatMoney(result.endingBalance)}`,
                `Interest earned: $${formatMoney(result.interestEarned)}`,
                '',
                'Formula: balance = deposit × (1 + APR/n)^(n × years)',
              ].join('\n')
            : '// Enter deposit, APR, and term above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
