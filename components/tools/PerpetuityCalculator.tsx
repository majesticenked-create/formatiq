'use client';

import { useMemo, useState } from 'react';

type Mode = 'standard' | 'growing';

function calculatePerpetuity(mode: Mode, cashFlowStr: string, rateStr: string, growthStr: string) {
  const cashFlow = Number(cashFlowStr);
  const rate = Number(rateStr);

  if (!cashFlowStr || Number.isNaN(cashFlow) || cashFlow <= 0) {
    return { ok: false as const, message: 'Enter a periodic cash flow greater than zero.' };
  }
  if (rateStr === '' || Number.isNaN(rate) || rate <= 0) {
    return { ok: false as const, message: 'Enter a discount rate greater than zero.' };
  }

  if (mode === 'standard') {
    const pv = cashFlow / (rate / 100);
    return { ok: true as const, presentValue: pv };
  }

  const growth = Number(growthStr);
  if (growthStr === '' || Number.isNaN(growth)) {
    return { ok: false as const, message: 'Enter an expected growth rate.' };
  }
  if (rate <= growth) {
    return {
      ok: false as const,
      message:
        'Discount rate must be greater than the growth rate - the growing perpetuity formula is undefined (and would produce an infinite or negative value) otherwise.',
    };
  }

  const pv = cashFlow / (rate / 100 - growth / 100);
  return { ok: true as const, presentValue: pv };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function PerpetuityCalculator() {
  const [mode, setMode] = useState<Mode>('standard');
  const [cashFlow, setCashFlow] = useState('1000');
  const [rate, setRate] = useState('5');
  const [growth, setGrowth] = useState('3');

  const result = useMemo(() => calculatePerpetuity(mode, cashFlow, rate, growth), [mode, cashFlow, rate, growth]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Mode:
        </label>
        <button
          type="button"
          className={`icon-btn${mode === 'standard' ? ' is-active' : ''}`}
          onClick={() => setMode('standard')}
        >
          Standard perpetuity
        </button>
        <button
          type="button"
          className={`icon-btn${mode === 'growing' ? ' is-active' : ''}`}
          onClick={() => setMode('growing')}
        >
          Growing perpetuity
        </button>
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {mode === 'standard' ? 'Periodic cash flow, C ($):' : 'Next period cash flow, C1 ($):'}
        </label>
        <input type="number" value={cashFlow} onChange={(e) => setCashFlow(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Discount rate, r (%):
        </label>
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mono" style={inputStyle} />
        {mode === 'growing' && (
          <>
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Growth rate, g (%):
            </label>
            <input type="number" value={growth} onChange={(e) => setGrowth(e.target.value)} className="mono" style={inputStyle} />
          </>
        )}
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>{mode === 'standard' ? 'Standard Perpetuity' : 'Growing Perpetuity'}</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Present value: $${formatMoney(result.presentValue)}`,
                '',
                mode === 'standard' ? 'Formula: PV = C ÷ r' : 'Formula: PV = C1 ÷ (r − g)',
              ].join('\n')
            : mode === 'standard'
              ? '// Enter a cash flow and discount rate above'
              : '// Enter a next-period cash flow, discount rate, and growth rate above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
