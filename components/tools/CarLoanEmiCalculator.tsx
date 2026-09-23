'use client';

import { useMemo, useState } from 'react';
import { calculateEmi } from '@/lib/tools/loan-utils';

function calculateCarLoanEmi(
  vehiclePriceStr: string,
  downPaymentStr: string,
  tradeInStr: string,
  annualRateStr: string,
  termMonthsStr: string
) {
  const vehiclePrice = Number(vehiclePriceStr);
  const downPayment = Number(downPaymentStr);
  const tradeIn = Number(tradeInStr);
  const annualRate = Number(annualRateStr);
  const termMonths = Number(termMonthsStr);

  if (!vehiclePriceStr || Number.isNaN(vehiclePrice) || vehiclePrice <= 0) {
    return { ok: false as const, message: 'Enter a vehicle price greater than zero.' };
  }
  if (downPaymentStr === '' || Number.isNaN(downPayment) || downPayment < 0) {
    return { ok: false as const, message: 'Enter a down payment of zero or greater.' };
  }
  if (tradeInStr === '' || Number.isNaN(tradeIn) || tradeIn < 0) {
    return { ok: false as const, message: 'Enter a trade-in value of zero or greater.' };
  }
  if (!annualRateStr || Number.isNaN(annualRate) || annualRate < 0) {
    return { ok: false as const, message: 'Enter a valid annual interest rate (0 or greater).' };
  }
  if (!termMonthsStr || Number.isNaN(termMonths) || termMonths <= 0 || !Number.isInteger(termMonths)) {
    return { ok: false as const, message: 'Enter a loan term in whole months, greater than zero.' };
  }

  const financedAmount = vehiclePrice - downPayment - tradeIn;
  if (financedAmount <= 0) {
    return {
      ok: false as const,
      message: 'Down payment plus trade-in covers the full vehicle price - there is nothing left to finance.',
    };
  }

  const { monthlyPayment, totalPayment, totalInterest } = calculateEmi(financedAmount, annualRate, termMonths);

  return { ok: true as const, financedAmount, monthlyPayment, totalPayment, totalInterest };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function CarLoanEmiCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState('30000');
  const [downPayment, setDownPayment] = useState('3000');
  const [tradeIn, setTradeIn] = useState('2000');
  const [annualRate, setAnnualRate] = useState('6.5');
  const [termMonths, setTermMonths] = useState('60');

  const result = useMemo(
    () => calculateCarLoanEmi(vehiclePrice, downPayment, tradeIn, annualRate, termMonths),
    [vehiclePrice, downPayment, tradeIn, annualRate, termMonths]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
        ⚠ This is an estimate for informational purposes only, not financial advice. It does not account for sales
        tax, fees, or a lender&apos;s specific terms - your actual auto loan offer may differ.
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Vehicle price ($):
        </label>
        <input type="number" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Down payment ($):
        </label>
        <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Trade-in value ($):
        </label>
        <input type="number" value={tradeIn} onChange={(e) => setTradeIn(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Annual rate (%):
        </label>
        <input type="number" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Term (months):
        </label>
        <input type="number" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Car Loan EMI</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Financed amount: $${formatMoney(result.financedAmount)}`,
                `Monthly payment: $${formatMoney(result.monthlyPayment)}`,
                `Total interest:  $${formatMoney(result.totalInterest)}`,
                `Total paid:      $${formatMoney(result.totalPayment)}`,
                '',
                'Financed amount = vehicle price − down payment − trade-in value.',
                'Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)',
              ].join('\n')
            : '// Enter vehicle price, down payment, trade-in, rate, and term above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
