'use client';

import { useMemo, useState } from 'react';

function calculateEva(nopatStr: string, investedCapitalStr: string, waccStr: string) {
  const nopat = Number(nopatStr);
  const investedCapital = Number(investedCapitalStr);
  const wacc = Number(waccStr);

  if (!nopatStr || Number.isNaN(nopat)) return { ok: false as const, message: 'Enter NOPAT (net operating profit after tax).' };
  if (!investedCapitalStr || Number.isNaN(investedCapital) || investedCapital < 0)
    return { ok: false as const, message: 'Enter invested capital of zero or greater.' };
  if (!waccStr || Number.isNaN(wacc) || wacc < 0) return { ok: false as const, message: 'Enter a WACC of zero or greater.' };

  const capitalCharge = investedCapital * (wacc / 100);
  const eva = nopat - capitalCharge;
  return { ok: true as const, capitalCharge, eva };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function EconomicValueAddedCalculator() {
  const [nopat, setNopat] = useState('500000');
  const [investedCapital, setInvestedCapital] = useState('4000000');
  const [wacc, setWacc] = useState('10');

  const result = useMemo(() => calculateEva(nopat, investedCapital, wacc), [nopat, investedCapital, wacc]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          NOPAT ($):
        </label>
        <input type="number" value={nopat} onChange={(e) => setNopat(e.target.value)} className="mono" style={inputStyle} />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Invested capital ($):
        </label>
        <input
          type="number"
          value={investedCapital}
          onChange={(e) => setInvestedCapital(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          WACC (%):
        </label>
        <input type="number" value={wacc} onChange={(e) => setWacc(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Economic Value Added (EVA)</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Capital charge: $${formatMoney(result.capitalCharge)}`,
                `EVA: $${formatMoney(result.eva)}`,
                '',
                'Formula: EVA = NOPAT − (Invested Capital × WACC)',
              ].join('\n')
            : '// Enter NOPAT, invested capital, and WACC above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
