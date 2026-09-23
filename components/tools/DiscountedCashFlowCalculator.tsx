'use client';

import { useMemo, useState } from 'react';

function calculateDcf(cashFlows: number[], discountRateStr: string, initialInvestmentStr: string) {
  const discountRate = Number(discountRateStr);
  const initialInvestment = initialInvestmentStr === '' ? 0 : Number(initialInvestmentStr);

  if (discountRateStr === '' || Number.isNaN(discountRate) || discountRate <= -100) {
    return { ok: false as const, message: 'Enter a discount rate greater than -100%.' };
  }
  if (Number.isNaN(initialInvestment) || initialInvestment < 0) {
    return { ok: false as const, message: 'Enter an initial investment of zero or greater (or leave it blank).' };
  }
  if (cashFlows.length === 0) {
    return { ok: false as const, message: 'Add at least one future cash flow.' };
  }

  const r = discountRate / 100;
  const discounted = cashFlows.map((cf, i) => cf / Math.pow(1 + r, i + 1));
  const presentValue = discounted.reduce((sum, dcf) => sum + dcf, 0);
  const netPresentValue = presentValue - initialInvestment;

  return { ok: true as const, discounted, presentValue, netPresentValue, initialInvestment };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function DiscountedCashFlowCalculator() {
  const [discountRate, setDiscountRate] = useState('10');
  const [initialInvestment, setInitialInvestment] = useState('');
  const [cashFlowRows, setCashFlowRows] = useState<string[]>(['1000', '1000', '1000']);

  const cashFlowNumbers = useMemo(
    () => cashFlowRows.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
    [cashFlowRows]
  );

  const result = useMemo(
    () => calculateDcf(cashFlowNumbers, discountRate, initialInvestment),
    [cashFlowNumbers, discountRate, initialInvestment]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const updateRow = (index: number, value: string) => {
    setCashFlowRows((rows) => rows.map((r, i) => (i === index ? value : r)));
  };

  const addRow = () => setCashFlowRows((rows) => [...rows, '']);
  const removeRow = (index: number) => setCashFlowRows((rows) => rows.filter((_, i) => i !== index));

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Discount rate (%):
        </label>
        <input
          type="number"
          value={discountRate}
          onChange={(e) => setDiscountRate(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Initial investment ($, optional):
        </label>
        <input
          type="number"
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
          Future cash flows (one per year):
        </div>
        {cashFlowRows.map((value, i) => (
          <div className="control-row" key={i}>
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', width: 60 }}>
              Year {i + 1}:
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => updateRow(i, e.target.value)}
              className="mono"
              style={inputStyle}
            />
            <button className="icon-btn" onClick={() => removeRow(i)} disabled={cashFlowRows.length <= 1}>
              Remove
            </button>
          </div>
        ))}
        <button className="icon-btn" onClick={addRow}>
          + Add row
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Discounted Cash Flow</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                ...result.discounted.map((dcf, i) => `Year ${i + 1} present value: $${formatMoney(dcf)}`),
                '',
                `Total present value (PV): $${formatMoney(result.presentValue)}`,
                ...(result.initialInvestment > 0
                  ? [`Net present value (NPV): $${formatMoney(result.netPresentValue)}`]
                  : []),
                '',
                'Formula: PV = Σ CFₜ ÷ (1 + r)ᵗ',
              ].join('\n')
            : '// Enter a discount rate and at least one future cash flow above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
