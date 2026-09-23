'use client';

import { useMemo, useState } from 'react';

function calculateNopat(ebitStr: string, taxRateStr: string) {
  const ebit = Number(ebitStr);
  const taxRate = Number(taxRateStr);

  if (!ebitStr || Number.isNaN(ebit)) {
    return { ok: false as const, message: 'Enter an EBIT (or loss) amount.' };
  }
  if (!taxRateStr || Number.isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
    return { ok: false as const, message: 'Enter a tax rate between 0 and 100.' };
  }

  const nopat = ebit * (1 - taxRate / 100);
  return { ok: true as const, nopat };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function NopatCalculator() {
  const [ebit, setEbit] = useState('500000');
  const [taxRate, setTaxRate] = useState('25');

  const result = useMemo(() => calculateNopat(ebit, taxRate), [ebit, taxRate]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          EBIT ($):
        </label>
        <input type="number" value={ebit} onChange={(e) => setEbit(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Tax rate (%):
        </label>
        <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>NOPAT</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `NOPAT: $${formatMoney(result.nopat)}`,
                '',
                'Formula: NOPAT = EBIT × (1 − tax rate)',
              ].join('\n')
            : '// Enter EBIT and a tax rate between 0 and 100 above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
