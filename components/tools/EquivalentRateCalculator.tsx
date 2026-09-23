'use client';

import { useMemo, useState } from 'react';
import { equivalentPeriodicRate } from '@/lib/tools/finance-utils';

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannually' | 'annually';

const PERIODS_PER_YEAR: Record<Period, number> = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  semiannually: 2,
  annually: 1,
};

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannually: 'Semi-annually',
  annually: 'Annually',
};

const PERIODS: Period[] = ['daily', 'weekly', 'monthly', 'quarterly', 'semiannually', 'annually'];

function calculateEquivalentRate(rateStr: string, fromPeriod: Period, toPeriod: Period) {
  const rate = Number(rateStr);
  if (rateStr === '' || Number.isNaN(rate)) {
    return { ok: false as const, message: 'Enter a periodic interest rate.' };
  }
  if (rate <= -100) {
    return { ok: false as const, message: 'Enter a rate greater than -100%.' };
  }

  const converted = equivalentPeriodicRate(rate, PERIODS_PER_YEAR[fromPeriod], PERIODS_PER_YEAR[toPeriod]);
  return { ok: true as const, converted };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function EquivalentRateCalculator() {
  const [rate, setRate] = useState('1');
  const [fromPeriod, setFromPeriod] = useState<Period>('monthly');
  const [toPeriod, setToPeriod] = useState<Period>('annually');

  const result = useMemo(() => calculateEquivalentRate(rate, fromPeriod, toPeriod), [rate, fromPeriod, toPeriod]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Rate (%):
        </label>
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          From period:
        </label>
        {PERIODS.map((p) => (
          <button key={p} className={`icon-btn${fromPeriod === p ? ' is-active' : ''}`} onClick={() => setFromPeriod(p)}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          To period:
        </label>
        {PERIODS.map((p) => (
          <button key={p} className={`icon-btn${toPeriod === p ? ' is-active' : ''}`} onClick={() => setToPeriod(p)}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Equivalent Rate</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `${rate}% ${PERIOD_LABELS[fromPeriod].toLowerCase()} ≈ ${result.converted.toFixed(4)}% ${PERIOD_LABELS[toPeriod].toLowerCase()}`,
                '',
                'Formula: i₂ = (1 + i₁)^(m₁/m₂) − 1',
              ].join('\n')
            : '// Enter a periodic rate above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
