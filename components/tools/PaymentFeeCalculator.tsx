'use client';

import { useMemo, useState } from 'react';

function calculateFee(amountStr: string, feePercentStr: string, fixedFeeStr: string) {
  const amount = Number(amountStr);
  const feePercent = Number(feePercentStr);
  const fixedFee = Number(fixedFeeStr);

  if (!amountStr || Number.isNaN(amount) || amount < 0) {
    return { ok: false as const, message: 'Enter a transaction amount of zero or greater.' };
  }
  if (feePercentStr === '' || Number.isNaN(feePercent) || feePercent < 0) {
    return { ok: false as const, message: 'Enter a fee percentage of zero or greater.' };
  }
  if (fixedFeeStr === '' || Number.isNaN(fixedFee) || fixedFee < 0) {
    return { ok: false as const, message: 'Enter a fixed fee of zero or greater.' };
  }

  const fee = amount * (feePercent / 100) + fixedFee;
  const net = amount - fee;

  return { ok: true as const, fee, net };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function PaymentFeeCalculator() {
  const [amount, setAmount] = useState('100');
  const [feePercent, setFeePercent] = useState('1.5');
  const [fixedFee, setFixedFee] = useState('0.25');

  const result = useMemo(() => calculateFee(amount, feePercent, fixedFee), [amount, feePercent, fixedFee]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div
        className="status-line"
        style={{
          background: 'var(--status-invalid-bg, rgba(255,0,0,0.06))',
          border: '1px solid var(--accent-dim)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 12,
        }}
      >
        ⚠ The fee percentage and fixed fee below are example defaults you can edit, not a live or guaranteed rate
        from Cash App or any other payment provider - those rates change and vary by transaction type (e.g.
        instant transfer vs. standard, sending vs. receiving, business vs. personal). Enter the actual rate for
        your situation to get an accurate result.
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Transaction amount ($):
        </label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Fee percentage (%, example default):
        </label>
        <input
          type="number"
          value={feePercent}
          onChange={(e) => setFeePercent(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Fixed fee ($, example default):
        </label>
        <input
          type="number"
          value={fixedFee}
          onChange={(e) => setFixedFee(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Fee Breakdown</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Fee charged: $${formatMoney(result.fee)}`,
                `Amount received (net): $${formatMoney(result.net)}`,
                '',
                'Formula: fee = amount × percentage + fixed fee',
              ].join('\n')
            : '// Enter amount, fee percentage, and fixed fee above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
