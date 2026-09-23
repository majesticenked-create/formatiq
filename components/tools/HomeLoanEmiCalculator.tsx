'use client';

import { useMemo, useState } from 'react';
import { calculateEmi } from '@/lib/tools/loan-utils';

function calculateHomeLoanEmi(propertyPriceStr: string, downPaymentStr: string, annualRateStr: string, termYearsStr: string) {
  const propertyPrice = Number(propertyPriceStr);
  const downPayment = Number(downPaymentStr);
  const annualRate = Number(annualRateStr);
  const termYears = Number(termYearsStr);

  if (!propertyPriceStr || Number.isNaN(propertyPrice) || propertyPrice <= 0) {
    return { ok: false as const, message: 'Enter a property price greater than zero.' };
  }
  if (downPaymentStr === '' || Number.isNaN(downPayment) || downPayment < 0) {
    return { ok: false as const, message: 'Enter a down payment of zero or greater.' };
  }
  if (!annualRateStr || Number.isNaN(annualRate) || annualRate < 0) {
    return { ok: false as const, message: 'Enter a valid annual interest rate (0 or greater).' };
  }
  if (!termYearsStr || Number.isNaN(termYears) || termYears <= 0) {
    return { ok: false as const, message: 'Enter a loan term in years, greater than zero.' };
  }

  const financedAmount = propertyPrice - downPayment;
  if (financedAmount <= 0) {
    return {
      ok: false as const,
      message: 'Down payment covers the full property price - there is nothing left to finance.',
    };
  }

  const loanToValue = (financedAmount / propertyPrice) * 100;
  const termMonths = Math.round(termYears * 12);
  const { monthlyPayment, totalPayment, totalInterest } = calculateEmi(financedAmount, annualRate, termMonths);

  return { ok: true as const, financedAmount, loanToValue, monthlyPayment, totalPayment, totalInterest };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function HomeLoanEmiCalculator() {
  const [propertyPrice, setPropertyPrice] = useState('350000');
  const [downPayment, setDownPayment] = useState('70000');
  const [annualRate, setAnnualRate] = useState('6.5');
  const [termYears, setTermYears] = useState('30');

  const result = useMemo(
    () => calculateHomeLoanEmi(propertyPrice, downPayment, annualRate, termYears),
    [propertyPrice, downPayment, annualRate, termYears]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div
        className="status-line"
        style={{ border: '1px solid var(--accent-dim)', borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}
      >
        ⚠ This is an estimate for informational purposes only, not financial advice. It does not account for
        property tax, homeowners insurance, PMI, or closing costs - your actual mortgage offer may differ.
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Property price ($):
        </label>
        <input
          type="number"
          value={propertyPrice}
          onChange={(e) => setPropertyPrice(e.target.value)}
          className="mono"
          style={inputStyle}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Down payment ($):
        </label>
        <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Annual rate (%):
        </label>
        <input type="number" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Term (years):
        </label>
        <input type="number" value={termYears} onChange={(e) => setTermYears(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Home Loan EMI</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Financed amount:     $${formatMoney(result.financedAmount)}`,
                `Loan-to-value (LTV): ${result.loanToValue.toFixed(2)}%`,
                `Monthly payment:     $${formatMoney(result.monthlyPayment)}`,
                `Total interest:      $${formatMoney(result.totalInterest)}`,
                `Total paid:          $${formatMoney(result.totalPayment)}`,
                '',
                'Financed amount = property price − down payment.',
                'Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)',
              ].join('\n')
            : '// Enter property price, down payment, rate, and term above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
