'use client';

import { useMemo, useState } from 'react';

function calculateBreakEven(fixedCostsStr: string, pricePerUnitStr: string, variableCostPerUnitStr: string) {
  const fixedCosts = Number(fixedCostsStr);
  const pricePerUnit = Number(pricePerUnitStr);
  const variableCostPerUnit = Number(variableCostPerUnitStr);

  if (!fixedCostsStr || Number.isNaN(fixedCosts) || fixedCosts < 0) {
    return { ok: false as const, message: 'Enter total fixed costs of zero or greater.' };
  }
  if (!pricePerUnitStr || Number.isNaN(pricePerUnit) || pricePerUnit <= 0) {
    return { ok: false as const, message: 'Enter a selling price per unit greater than zero.' };
  }
  if (!variableCostPerUnitStr || Number.isNaN(variableCostPerUnit) || variableCostPerUnit < 0) {
    return { ok: false as const, message: 'Enter a variable cost per unit of zero or greater.' };
  }

  const contributionMargin = pricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) {
    return {
      ok: false as const,
      message: 'Selling price must be greater than variable cost per unit - otherwise every unit sold loses money and break-even is impossible.',
    };
  }

  const breakEvenUnits = fixedCosts / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;
  const contributionMarginRatio = contributionMargin / pricePerUnit;

  return { ok: true as const, contributionMargin, contributionMarginRatio, breakEvenUnits, breakEvenRevenue };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState('10000');
  const [pricePerUnit, setPricePerUnit] = useState('50');
  const [variableCostPerUnit, setVariableCostPerUnit] = useState('30');

  const result = useMemo(
    () => calculateBreakEven(fixedCosts, pricePerUnit, variableCostPerUnit),
    [fixedCosts, pricePerUnit, variableCostPerUnit]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatUnits = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div>
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

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Selling price per unit ($):
        </label>
        <input
          type="number"
          value={pricePerUnit}
          onChange={(e) => setPricePerUnit(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Variable cost per unit ($):
        </label>
        <input
          type="number"
          value={variableCostPerUnit}
          onChange={(e) => setVariableCostPerUnit(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Break-Even Point</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Contribution margin: $${formatMoney(result.contributionMargin)} per unit`,
                `Contribution margin ratio: ${(result.contributionMarginRatio * 100).toFixed(2)}%`,
                '',
                `Break-even units: ${formatUnits(result.breakEvenUnits)} units`,
                `Break-even revenue: $${formatMoney(result.breakEvenRevenue)}`,
              ].join('\n')
            : '// Enter fixed costs, price, and variable cost above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
