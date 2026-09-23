'use client';

import { useMemo, useState } from 'react';

function calculateEnterpriseValue(
  marketCapStr: string,
  debtStr: string,
  cashStr: string,
  preferredStockStr: string,
  minorityInterestStr: string
) {
  const marketCap = Number(marketCapStr);
  const debt = Number(debtStr);
  const cash = Number(cashStr);
  const preferredStock = preferredStockStr === '' ? 0 : Number(preferredStockStr);
  const minorityInterest = minorityInterestStr === '' ? 0 : Number(minorityInterestStr);

  if (!marketCapStr || Number.isNaN(marketCap) || marketCap < 0) return { ok: false as const, message: 'Enter a market cap of zero or greater.' };
  if (!debtStr || Number.isNaN(debt) || debt < 0) return { ok: false as const, message: 'Enter total debt of zero or greater.' };
  if (!cashStr || Number.isNaN(cash) || cash < 0) return { ok: false as const, message: 'Enter cash and equivalents of zero or greater.' };
  if (Number.isNaN(preferredStock) || preferredStock < 0)
    return { ok: false as const, message: 'Enter preferred stock of zero or greater (or leave it blank).' };
  if (Number.isNaN(minorityInterest) || minorityInterest < 0)
    return { ok: false as const, message: 'Enter minority interest of zero or greater (or leave it blank).' };

  const enterpriseValue = marketCap + debt + preferredStock + minorityInterest - cash;
  return { ok: true as const, enterpriseValue };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function EnterpriseValueCalculator() {
  const [marketCap, setMarketCap] = useState('8000000');
  const [debt, setDebt] = useState('3000000');
  const [cash, setCash] = useState('1000000');
  const [preferredStock, setPreferredStock] = useState('');
  const [minorityInterest, setMinorityInterest] = useState('');

  const result = useMemo(
    () => calculateEnterpriseValue(marketCap, debt, cash, preferredStock, minorityInterest),
    [marketCap, debt, cash, preferredStock, minorityInterest]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Market capitalization ($):
        </label>
        <input type="number" value={marketCap} onChange={(e) => setMarketCap(e.target.value)} className="mono" style={inputStyle} />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Total debt ($):
        </label>
        <input type="number" value={debt} onChange={(e) => setDebt(e.target.value)} className="mono" style={inputStyle} />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Cash and equivalents ($):
        </label>
        <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} className="mono" style={inputStyle} />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Preferred stock ($, optional):
        </label>
        <input
          type="number"
          value={preferredStock}
          onChange={(e) => setPreferredStock(e.target.value)}
          className="mono"
          style={inputStyle}
          placeholder="0"
        />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Minority interest ($, optional):
        </label>
        <input
          type="number"
          value={minorityInterest}
          onChange={(e) => setMinorityInterest(e.target.value)}
          className="mono"
          style={inputStyle}
          placeholder="0"
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Enterprise Value</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Enterprise value: $${formatMoney(result.enterpriseValue)}`,
                '',
                'Formula: EV = Market Cap + Debt + Preferred Stock + Minority Interest − Cash',
              ].join('\n')
            : '// Enter market cap, debt, and cash above (preferred stock and minority interest are optional)'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
