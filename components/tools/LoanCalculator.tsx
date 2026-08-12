'use client';

import { useMemo, useState } from 'react';

type TermUnit = 'years' | 'months';

function calculateLoan(amount: number, annualRatePercent: number, termMonths: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false as const, message: 'Enter a loan amount greater than zero.' };
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return { ok: false as const, message: 'Enter a valid annual interest rate (0 or greater).' };
  }
  if (!Number.isFinite(termMonths) || termMonths <= 0) {
    return { ok: false as const, message: 'Enter a loan term greater than zero.' };
  }

  const monthlyRate = annualRatePercent / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = amount / termMonths;
  } else {
    monthlyPayment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - amount;

  return { ok: true as const, monthlyPayment, totalPaid, totalInterest };
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState('20000');
  const [rate, setRate] = useState('6.5');
  const [term, setTerm] = useState('5');
  const [termUnit, setTermUnit] = useState<TermUnit>('years');

  const result = useMemo(() => {
    const amountNum = Number(amount);
    const rateNum = Number(rate);
    const termNum = Number(term);
    const termMonths = termUnit === 'years' ? termNum * 12 : termNum;
    return calculateLoan(amountNum, rateNum, termMonths);
  }, [amount, rate, term, termUnit]);

  const inputStyle = {
    width: 120,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    padding: '6px 8px',
  };

  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div
        className="status-line"
        style={{
          border: '1px solid var(--accent-dim)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 16,
        }}
      >
        ⚠ This is an estimate for informational purposes only, not financial advice. It calculates a standard
        fixed-rate amortization and does not account for fees, taxes, insurance, or a lender&apos;s specific terms
        - your actual loan offer may differ.
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Loan amount:
        </label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Annual rate (%):
        </label>
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Term:
        </label>
        <input type="number" value={term} onChange={(e) => setTerm(e.target.value)} className="mono" style={inputStyle} />
        <button
          className={`icon-btn${termUnit === 'years' ? ' is-active' : ''}`}
          onClick={() => setTermUnit('years')}
        >
          Years
        </button>
        <button
          className={`icon-btn${termUnit === 'months' ? ' is-active' : ''}`}
          onClick={() => setTermUnit('months')}
        >
          Months
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Estimated payments</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Monthly payment: $${formatCurrency(result.monthlyPayment)}`,
                `Total interest:  $${formatCurrency(result.totalInterest)}`,
                `Total paid:      $${formatCurrency(result.totalPaid)}`,
              ].join('\n')
            : '// Enter valid loan details above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
