'use client';

import { useMemo, useState } from 'react';

function calculateDol(salesStr: string, variableCostsStr: string, fixedCostsStr: string) {
  const sales = Number(salesStr);
  const variableCosts = Number(variableCostsStr);
  const fixedCosts = Number(fixedCostsStr);

  if (!salesStr || Number.isNaN(sales) || sales <= 0) {
    return { ok: false as const, message: 'Enter total sales greater than zero.' };
  }
  if (!variableCostsStr || Number.isNaN(variableCosts) || variableCosts < 0) {
    return { ok: false as const, message: 'Enter total variable costs of zero or greater.' };
  }
  if (!fixedCostsStr || Number.isNaN(fixedCosts) || fixedCosts < 0) {
    return { ok: false as const, message: 'Enter total fixed costs of zero or greater.' };
  }

  const contributionMargin = sales - variableCosts;
  const operatingIncome = contributionMargin - fixedCosts;

  if (operatingIncome <= 0) {
    return {
      ok: false as const,
      message: 'Operating income must be greater than zero - DOL is undefined when a business is operating at a loss or exactly at break-even.',
    };
  }

  const dol = contributionMargin / operatingIncome;

  return { ok: true as const, contributionMargin, operatingIncome, dol };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function DegreeOfOperatingLeverageCalculator() {
  const [sales, setSales] = useState('100000');
  const [variableCosts, setVariableCosts] = useState('60000');
  const [fixedCosts, setFixedCosts] = useState('20000');

  const result = useMemo(
    () => calculateDol(sales, variableCosts, fixedCosts),
    [sales, variableCosts, fixedCosts]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Total sales ($):
        </label>
        <input type="number" value={sales} onChange={(e) => setSales(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Total variable costs ($):
        </label>
        <input
          type="number"
          value={variableCosts}
          onChange={(e) => setVariableCosts(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Total fixed costs ($):
        </label>
        <input
          type="number"
          value={fixedCosts}
          onChange={(e) => setFixedCosts(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Degree of Operating Leverage</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Contribution margin: $${formatMoney(result.contributionMargin)}`,
                `Operating income: $${formatMoney(result.operatingIncome)}`,
                '',
                `DOL: ${result.dol.toFixed(2)}`,
                '',
                'Formula: DOL = (Sales − Variable costs) ÷ (Sales − Variable costs − Fixed costs)',
              ].join('\n')
            : '// Enter sales, variable costs, and fixed costs above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
