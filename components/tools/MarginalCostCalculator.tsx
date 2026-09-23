'use client';

import { useMemo, useState } from 'react';

function calculateMarginalCost(deltaTotalCostStr: string, deltaQuantityStr: string) {
  const deltaTotalCost = Number(deltaTotalCostStr);
  const deltaQuantity = Number(deltaQuantityStr);

  if (!deltaTotalCostStr || Number.isNaN(deltaTotalCost)) {
    return { ok: false as const, message: 'Enter a change in total cost.' };
  }
  if (!deltaQuantityStr || Number.isNaN(deltaQuantity) || deltaQuantity === 0) {
    return { ok: false as const, message: 'Enter a change in quantity that is not zero.' };
  }

  const marginalCost = deltaTotalCost / deltaQuantity;
  return { ok: true as const, marginalCost };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function MarginalCostCalculator() {
  const [deltaTotalCost, setDeltaTotalCost] = useState('2500');
  const [deltaQuantity, setDeltaQuantity] = useState('500');

  const result = useMemo(() => calculateMarginalCost(deltaTotalCost, deltaQuantity), [deltaTotalCost, deltaQuantity]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Change in total cost ($):
        </label>
        <input
          type="number"
          value={deltaTotalCost}
          onChange={(e) => setDeltaTotalCost(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Change in quantity (units):
        </label>
        <input
          type="number"
          value={deltaQuantity}
          onChange={(e) => setDeltaQuantity(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Marginal Cost</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Marginal cost: $${formatMoney(result.marginalCost)} per unit`,
                '',
                'Formula: marginal cost = Δ total cost ÷ Δ quantity',
              ].join('\n')
            : '// Enter a change in total cost and a nonzero change in quantity above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
