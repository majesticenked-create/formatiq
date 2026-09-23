'use client';

import { useMemo, useState } from 'react';

/**
 * PPF (Public Provident Fund) maturity value, assuming annual contributions made at the
 * BEGINNING of each year (annuity-due) - the standard real-world PPF convention, since a PPF
 * deposit made early in the financial year earns interest for that entire year. This is the
 * ordinary-annuity future value formula multiplied by one extra period of growth:
 *   FV = C × (((1+r)^n − 1) ÷ r) × (1 + r)
 * This differs from the Future Value Calculator's periodic-contribution mode, which assumes
 * contributions land at the END of each period (ordinary annuity, no extra ×(1+r) factor).
 */
function calculatePpf(annualContributionStr: string, rateStr: string, yearsStr: string) {
  const annualContribution = Number(annualContributionStr);
  const rate = Number(rateStr);
  const years = Number(yearsStr);

  if (!annualContributionStr || Number.isNaN(annualContribution) || annualContribution <= 0) {
    return { ok: false as const, message: 'Enter an annual contribution greater than zero.' };
  }
  if (!rateStr || Number.isNaN(rate) || rate <= 0) {
    return { ok: false as const, message: 'Enter an interest rate greater than zero.' };
  }
  if (!yearsStr || Number.isNaN(years) || years <= 0 || !Number.isInteger(years)) {
    return { ok: false as const, message: 'Enter a tenure in whole years, greater than zero.' };
  }

  const r = rate / 100;
  const ordinaryFv = annualContribution * ((Math.pow(1 + r, years) - 1) / r);
  const maturityValue = ordinaryFv * (1 + r);
  const totalContributed = annualContribution * years;
  const totalInterest = maturityValue - totalContributed;

  return { ok: true as const, maturityValue, totalContributed, totalInterest };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function PpfCalculator() {
  const [annualContribution, setAnnualContribution] = useState('150000');
  const [rate, setRate] = useState('7.1');
  const [years, setYears] = useState('15');

  const result = useMemo(() => calculatePpf(annualContribution, rate, years), [annualContribution, rate, years]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div
        className="status-line"
        style={{ border: '1px solid var(--accent-dim)', borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}
      >
        ⚠ Assumes each year&apos;s contribution is deposited at the BEGINNING of the year (annuity-due), the
        standard real-world PPF convention. The 7.1% default is a labeled example, not a current or guaranteed
        rate - PPF rates are set quarterly by the government and change over time, so enter the actual rate that
        applies to you.
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Annual contribution ($):
        </label>
        <input
          type="number"
          value={annualContribution}
          onChange={(e) => setAnnualContribution(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Annual interest rate (%):
        </label>
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Tenure (years):
        </label>
        <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>PPF Maturity Value</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Total contributed: $${formatMoney(result.totalContributed)}`,
                `Total interest:    $${formatMoney(result.totalInterest)}`,
                `Maturity value:    $${formatMoney(result.maturityValue)}`,
                '',
                'Formula (beginning-of-year deposits): FV = C × (((1+r)^n − 1) ÷ r) × (1 + r)',
              ].join('\n')
            : '// Enter an annual contribution, interest rate, and tenure above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
