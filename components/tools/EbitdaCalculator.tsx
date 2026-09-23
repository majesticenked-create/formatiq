'use client';

import { useMemo, useState } from 'react';

function calculateEbitda(
  netIncomeStr: string,
  interestStr: string,
  taxesStr: string,
  depreciationStr: string,
  amortizationStr: string
) {
  const netIncome = Number(netIncomeStr);
  const interest = Number(interestStr);
  const taxes = Number(taxesStr);
  const depreciation = Number(depreciationStr);
  const amortization = Number(amortizationStr);

  if (!netIncomeStr || Number.isNaN(netIncome)) return { ok: false as const, message: 'Enter a net income (or loss) amount.' };
  if (!interestStr || Number.isNaN(interest) || interest < 0) return { ok: false as const, message: 'Enter interest expense of zero or greater.' };
  if (!taxesStr || Number.isNaN(taxes) || taxes < 0) return { ok: false as const, message: 'Enter taxes of zero or greater.' };
  if (!depreciationStr || Number.isNaN(depreciation) || depreciation < 0)
    return { ok: false as const, message: 'Enter depreciation of zero or greater.' };
  if (!amortizationStr || Number.isNaN(amortization) || amortization < 0)
    return { ok: false as const, message: 'Enter amortization of zero or greater.' };

  const ebitda = netIncome + interest + taxes + depreciation + amortization;
  return { ok: true as const, ebitda };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function EbitdaCalculator() {
  const [netIncome, setNetIncome] = useState('100000');
  const [interest, setInterest] = useState('20000');
  const [taxes, setTaxes] = useState('30000');
  const [depreciation, setDepreciation] = useState('10000');
  const [amortization, setAmortization] = useState('5000');

  const result = useMemo(
    () => calculateEbitda(netIncome, interest, taxes, depreciation, amortization),
    [netIncome, interest, taxes, depreciation, amortization]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
          Interest expense ($):
        </label>
        <input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} className="mono" style={inputStyle} />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Taxes ($):
        </label>
        <input type="number" value={taxes} onChange={(e) => setTaxes(e.target.value)} className="mono" style={inputStyle} />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Depreciation ($):
        </label>
        <input type="number" value={depreciation} onChange={(e) => setDepreciation(e.target.value)} className="mono" style={inputStyle} />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Amortization ($):
        </label>
        <input type="number" value={amortization} onChange={(e) => setAmortization(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>EBITDA</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `EBITDA: $${formatMoney(result.ebitda)}`,
                '',
                'Formula: EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization',
              ].join('\n')
            : '// Enter net income, interest, taxes, depreciation, and amortization above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
