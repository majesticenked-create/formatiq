'use client';

import { useMemo, useState } from 'react';

function calculateNetProfitMargin(netIncomeStr: string, revenueStr: string) {
  const netIncome = Number(netIncomeStr);
  const revenue = Number(revenueStr);

  if (!netIncomeStr || Number.isNaN(netIncome)) {
    return { ok: false as const, message: 'Enter a net income (or loss) amount.' };
  }
  if (!revenueStr || Number.isNaN(revenue) || revenue === 0) {
    return { ok: false as const, message: 'Enter a revenue amount that is not zero.' };
  }

  const margin = (netIncome / revenue) * 100;
  return { ok: true as const, margin };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function NetProfitMarginCalculator() {
  const [netIncome, setNetIncome] = useState('150000');
  const [revenue, setRevenue] = useState('1000000');

  const result = useMemo(() => calculateNetProfitMargin(netIncome, revenue), [netIncome, revenue]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Net income (or loss, $):
        </label>
        <input type="number" value={netIncome} onChange={(e) => setNetIncome(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Revenue ($):
        </label>
        <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Net Profit Margin</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Net profit margin: ${result.margin.toFixed(2)}%`,
                '',
                'Formula: net profit margin = (net income ÷ revenue) × 100',
              ].join('\n')
            : '// Enter net income and a nonzero revenue above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
