'use client';

import { useMemo, useState } from 'react';

function calculateWacc(equityStr: string, debtStr: string, costOfEquityStr: string, costOfDebtStr: string, taxRateStr: string) {
  const equity = Number(equityStr);
  const debt = Number(debtStr);
  const costOfEquity = Number(costOfEquityStr);
  const costOfDebt = Number(costOfDebtStr);
  const taxRate = Number(taxRateStr);

  if (equityStr === '' || Number.isNaN(equity) || equity < 0) {
    return { ok: false as const, message: 'Enter a market value of equity of zero or greater.' };
  }
  if (debtStr === '' || Number.isNaN(debt) || debt < 0) {
    return { ok: false as const, message: 'Enter a market value of debt of zero or greater.' };
  }
  const totalCapital = equity + debt;
  if (totalCapital <= 0) {
    return { ok: false as const, message: 'Total capital (equity + debt) must be greater than zero.' };
  }
  if (costOfEquityStr === '' || Number.isNaN(costOfEquity)) {
    return { ok: false as const, message: 'Enter a cost of equity.' };
  }
  if (costOfDebtStr === '' || Number.isNaN(costOfDebt)) {
    return { ok: false as const, message: 'Enter a cost of debt.' };
  }
  if (taxRateStr === '' || Number.isNaN(taxRate) || taxRate < 0 || taxRate >= 100) {
    return { ok: false as const, message: 'Enter a tax rate between 0 and 100 (exclusive of 100).' };
  }

  const equityWeight = equity / totalCapital;
  const debtWeight = debt / totalCapital;
  const afterTaxCostOfDebt = costOfDebt * (1 - taxRate / 100);
  const wacc = equityWeight * costOfEquity + debtWeight * afterTaxCostOfDebt;

  return { ok: true as const, equityWeight, debtWeight, afterTaxCostOfDebt, wacc };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function WaccCalculator() {
  const [equity, setEquity] = useState('600000');
  const [debt, setDebt] = useState('400000');
  const [costOfEquity, setCostOfEquity] = useState('10');
  const [costOfDebt, setCostOfDebt] = useState('6');
  const [taxRate, setTaxRate] = useState('25');

  const result = useMemo(
    () => calculateWacc(equity, debt, costOfEquity, costOfDebt, taxRate),
    [equity, debt, costOfEquity, costOfDebt, taxRate]
  );

  const formatPct = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Market value of equity, E ($):
        </label>
        <input type="number" value={equity} onChange={(e) => setEquity(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Market value of debt, D ($):
        </label>
        <input type="number" value={debt} onChange={(e) => setDebt(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Cost of equity, Re (%):
        </label>
        <input type="number" value={costOfEquity} onChange={(e) => setCostOfEquity(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Cost of debt, Rd (%):
        </label>
        <input type="number" value={costOfDebt} onChange={(e) => setCostOfDebt(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Tax rate, T (%):
        </label>
        <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>WACC</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Equity weight (E/V):        ${formatPct(result.equityWeight * 100)}%`,
                `Debt weight (D/V):          ${formatPct(result.debtWeight * 100)}%`,
                `After-tax cost of debt:     ${formatPct(result.afterTaxCostOfDebt)}%`,
                `WACC:                       ${formatPct(result.wacc)}%`,
                '',
                'Formula: WACC = (E/V × Re) + (D/V × Rd × (1 − T))',
              ].join('\n')
            : '// Enter equity, debt, cost of equity, cost of debt, and tax rate above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
