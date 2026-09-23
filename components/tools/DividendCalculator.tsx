'use client';

import { useMemo, useState } from 'react';

function calculateDividend(sharesStr: string, dividendPerShareStr: string, sharePriceStr: string) {
  const shares = Number(sharesStr);
  const dividendPerShare = Number(dividendPerShareStr);
  const sharePrice = sharePriceStr === '' ? null : Number(sharePriceStr);

  if (!sharesStr || Number.isNaN(shares) || shares <= 0) {
    return { ok: false as const, message: 'Enter a number of shares greater than zero.' };
  }
  if (!dividendPerShareStr || Number.isNaN(dividendPerShare) || dividendPerShare < 0) {
    return { ok: false as const, message: 'Enter an annual dividend per share of zero or greater.' };
  }
  if (sharePrice !== null && (Number.isNaN(sharePrice) || sharePrice <= 0)) {
    return { ok: false as const, message: 'Share price must be greater than zero, or left blank.' };
  }

  const annualDividendIncome = shares * dividendPerShare;
  const yieldPercent = sharePrice !== null ? (dividendPerShare / sharePrice) * 100 : null;

  return { ok: true as const, annualDividendIncome, yieldPercent };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function DividendCalculator() {
  const [shares, setShares] = useState('100');
  const [dividendPerShare, setDividendPerShare] = useState('2.50');
  const [sharePrice, setSharePrice] = useState('50');

  const result = useMemo(
    () => calculateDividend(shares, dividendPerShare, sharePrice),
    [shares, dividendPerShare, sharePrice]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Number of shares:
        </label>
        <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Annual dividend per share ($):
        </label>
        <input
          type="number"
          value={dividendPerShare}
          onChange={(e) => setDividendPerShare(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Share price ($, optional - for yield):
        </label>
        <input
          type="number"
          value={sharePrice}
          onChange={(e) => setSharePrice(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Dividend Income</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Annual dividend income: $${formatMoney(result.annualDividendIncome)}`,
                ...(result.yieldPercent !== null ? [`Dividend yield: ${result.yieldPercent.toFixed(2)}%`] : []),
                '',
                'Formula: income = shares × annual dividend per share',
                ...(result.yieldPercent !== null ? ['        yield = annual dividend per share ÷ share price'] : []),
              ].join('\n')
            : '// Enter shares and annual dividend per share above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
