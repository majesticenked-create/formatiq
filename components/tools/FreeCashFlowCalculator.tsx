'use client';

import { useMemo, useState } from 'react';

function calculateFcf(operatingCashFlowStr: string, capexStr: string) {
  const operatingCashFlow = Number(operatingCashFlowStr);
  const capex = Number(capexStr);

  if (!operatingCashFlowStr || Number.isNaN(operatingCashFlow)) {
    return { ok: false as const, message: 'Enter operating cash flow.' };
  }
  if (!capexStr || Number.isNaN(capex) || capex < 0) {
    return { ok: false as const, message: 'Enter capital expenditures of zero or greater.' };
  }

  const fcf = operatingCashFlow - capex;
  return { ok: true as const, fcf };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function FreeCashFlowCalculator() {
  const [operatingCashFlow, setOperatingCashFlow] = useState('500000');
  const [capex, setCapex] = useState('150000');

  const result = useMemo(() => calculateFcf(operatingCashFlow, capex), [operatingCashFlow, capex]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Operating cash flow ($):
        </label>
        <input
          type="number"
          value={operatingCashFlow}
          onChange={(e) => setOperatingCashFlow(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Capital expenditures ($):
        </label>
        <input type="number" value={capex} onChange={(e) => setCapex(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Free Cash Flow</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [`Free cash flow: $${formatMoney(result.fcf)}`, '', 'Formula: FCF = Operating Cash Flow − CapEx'].join('\n')
            : '// Enter operating cash flow and capital expenditures above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
