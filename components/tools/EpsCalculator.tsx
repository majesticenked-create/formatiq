'use client';

import { useMemo, useState } from 'react';

function calculateEps(netIncomeStr: string, preferredDividendsStr: string, sharesStr: string) {
  const netIncome = Number(netIncomeStr);
  const preferredDividends = preferredDividendsStr === '' ? 0 : Number(preferredDividendsStr);
  const shares = Number(sharesStr);

  if (netIncomeStr === '' || Number.isNaN(netIncome)) {
    return { ok: false as const, message: 'Enter a net income (or net loss as a negative number).' };
  }
  if (Number.isNaN(preferredDividends) || preferredDividends < 0) {
    return { ok: false as const, message: 'Enter preferred dividends of zero or greater (or leave it blank).' };
  }
  if (!sharesStr || Number.isNaN(shares) || shares <= 0) {
    return { ok: false as const, message: 'Enter a weighted average share count greater than zero.' };
  }

  const eps = (netIncome - preferredDividends) / shares;
  return { ok: true as const, eps, availableIncome: netIncome - preferredDividends };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function EpsCalculator() {
  const [netIncome, setNetIncome] = useState('500000');
  const [preferredDividends, setPreferredDividends] = useState('50000');
  const [shares, setShares] = useState('100000');

  const result = useMemo(() => calculateEps(netIncome, preferredDividends, shares), [netIncome, preferredDividends, shares]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Net income (or loss, $):
        </label>
        <input type="number" value={netIncome} onChange={(e) => setNetIncome(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Preferred dividends ($):
        </label>
        <input
          type="number"
          value={preferredDividends}
          onChange={(e) => setPreferredDividends(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Weighted average shares outstanding:
        </label>
        <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Earnings Per Share</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Income available to common shareholders: $${formatMoney(result.availableIncome)}`,
                `EPS: $${formatMoney(result.eps)}`,
                '',
                'Formula: EPS = (Net Income − Preferred Dividends) / Weighted Average Shares',
              ].join('\n')
            : '// Enter net income, preferred dividends, and share count above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
