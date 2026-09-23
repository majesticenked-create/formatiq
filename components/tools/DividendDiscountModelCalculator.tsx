'use client';

import { useMemo, useState } from 'react';

function calculateDdm(currentDividendStr: string, growthRateStr: string, requiredReturnStr: string) {
  const currentDividend = Number(currentDividendStr);
  const growthRate = Number(growthRateStr);
  const requiredReturn = Number(requiredReturnStr);

  if (!currentDividendStr || Number.isNaN(currentDividend) || currentDividend <= 0) {
    return { ok: false as const, message: 'Enter a current annual dividend (D0) greater than zero.' };
  }
  if (growthRateStr === '' || Number.isNaN(growthRate)) {
    return { ok: false as const, message: 'Enter an expected dividend growth rate.' };
  }
  if (requiredReturnStr === '' || Number.isNaN(requiredReturn)) {
    return { ok: false as const, message: 'Enter a required rate of return.' };
  }
  if (requiredReturn <= growthRate) {
    return {
      ok: false as const,
      message: 'Required rate of return must be greater than the growth rate - the Gordon Growth Model is undefined (and would produce an infinite or negative value) otherwise.',
    };
  }

  const nextDividend = currentDividend * (1 + growthRate / 100);
  const intrinsicValue = nextDividend / (requiredReturn / 100 - growthRate / 100);

  return { ok: true as const, nextDividend, intrinsicValue };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function DividendDiscountModelCalculator() {
  const [currentDividend, setCurrentDividend] = useState('2.00');
  const [growthRate, setGrowthRate] = useState('5');
  const [requiredReturn, setRequiredReturn] = useState('10');

  const result = useMemo(
    () => calculateDdm(currentDividend, growthRate, requiredReturn),
    [currentDividend, growthRate, requiredReturn]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Current annual dividend, D0 ($):
        </label>
        <input
          type="number"
          value={currentDividend}
          onChange={(e) => setCurrentDividend(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Expected dividend growth rate (%):
        </label>
        <input
          type="number"
          value={growthRate}
          onChange={(e) => setGrowthRate(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Required rate of return (%):
        </label>
        <input
          type="number"
          value={requiredReturn}
          onChange={(e) => setRequiredReturn(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Dividend Discount Model (Gordon Growth)</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Next year's dividend (D1): $${formatMoney(result.nextDividend)}`,
                `Intrinsic value per share (P0): $${formatMoney(result.intrinsicValue)}`,
                '',
                'Formula: D1 = D0 × (1 + g)',
                '         P0 = D1 ÷ (r − g)',
              ].join('\n')
            : '// Enter current dividend, growth rate, and required return above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
