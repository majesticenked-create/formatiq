'use client';

import { useMemo, useState } from 'react';

function calculateMarketCap(priceStr: string, sharesStr: string) {
  const price = Number(priceStr);
  const shares = Number(sharesStr);

  if (!priceStr || Number.isNaN(price) || price <= 0) {
    return { ok: false as const, message: 'Enter a share price greater than zero.' };
  }
  if (!sharesStr || Number.isNaN(shares) || shares <= 0) {
    return { ok: false as const, message: 'Enter shares outstanding greater than zero.' };
  }

  const marketCap = price * shares;
  return { ok: true as const, marketCap };
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function MarketCapitalizationCalculator() {
  const [price, setPrice] = useState('50');
  const [shares, setShares] = useState('10000000');

  const result = useMemo(() => calculateMarketCap(price, shares), [price, shares]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Share price ($):
        </label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Shares outstanding:
        </label>
        <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Market Capitalization</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Market cap: $${formatMoney(result.marketCap)}`,
                `(${formatCompact(result.marketCap)})`,
                '',
                'Formula: market cap = share price × shares outstanding',
              ].join('\n')
            : '// Enter a share price and shares outstanding above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
