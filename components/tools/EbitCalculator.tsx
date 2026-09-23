'use client';

import { useMemo, useState } from 'react';

type Mode = 'revenue' | 'netIncome';

function calculateEbitFromRevenue(revenueStr: string, cogsStr: string, opExStr: string) {
  const revenue = Number(revenueStr);
  const cogs = Number(cogsStr);
  const opEx = Number(opExStr);

  if (!revenueStr || Number.isNaN(revenue)) return { ok: false as const, message: 'Enter a revenue amount.' };
  if (!cogsStr || Number.isNaN(cogs) || cogs < 0) return { ok: false as const, message: 'Enter COGS of zero or greater.' };
  if (!opExStr || Number.isNaN(opEx) || opEx < 0) return { ok: false as const, message: 'Enter operating expenses of zero or greater.' };

  return { ok: true as const, ebit: revenue - cogs - opEx };
}

function calculateEbitFromNetIncome(netIncomeStr: string, interestStr: string, taxesStr: string) {
  const netIncome = Number(netIncomeStr);
  const interest = Number(interestStr);
  const taxes = Number(taxesStr);

  if (!netIncomeStr || Number.isNaN(netIncome)) return { ok: false as const, message: 'Enter a net income (or loss) amount.' };
  if (!interestStr || Number.isNaN(interest) || interest < 0) return { ok: false as const, message: 'Enter interest expense of zero or greater.' };
  if (!taxesStr || Number.isNaN(taxes) || taxes < 0) return { ok: false as const, message: 'Enter taxes of zero or greater.' };

  return { ok: true as const, ebit: netIncome + interest + taxes };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function EbitCalculator() {
  const [mode, setMode] = useState<Mode>('revenue');

  const [revenue, setRevenue] = useState('500000');
  const [cogs, setCogs] = useState('250000');
  const [opEx, setOpEx] = useState('100000');

  const [netIncome, setNetIncome] = useState('100000');
  const [interest, setInterest] = useState('20000');
  const [taxes, setTaxes] = useState('30000');

  const result = useMemo(
    () =>
      mode === 'revenue'
        ? calculateEbitFromRevenue(revenue, cogs, opEx)
        : calculateEbitFromNetIncome(netIncome, interest, taxes),
    [mode, revenue, cogs, opEx, netIncome, interest, taxes]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'revenue' ? ' is-active' : ''}`} onClick={() => setMode('revenue')}>
          Revenue − COGS − OpEx
        </button>
        <button className={`icon-btn${mode === 'netIncome' ? ' is-active' : ''}`} onClick={() => setMode('netIncome')}>
          Net Income + Interest + Taxes
        </button>
      </div>

      {mode === 'revenue' ? (
        <>
          <div className="control-row">
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Revenue ($):
            </label>
            <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="mono" style={inputStyle} />
          </div>
          <div className="control-row">
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Cost of goods sold ($):
            </label>
            <input type="number" value={cogs} onChange={(e) => setCogs(e.target.value)} className="mono" style={inputStyle} />
          </div>
          <div className="control-row">
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Operating expenses ($):
            </label>
            <input type="number" value={opEx} onChange={(e) => setOpEx(e.target.value)} className="mono" style={inputStyle} />
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

      <div className="panel">
        <div className="panel-bar">
          <span>EBIT</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `EBIT: $${formatMoney(result.ebit)}`,
                '',
                mode === 'revenue'
                  ? 'Formula: EBIT = Revenue − COGS − Operating Expenses'
                  : 'Formula: EBIT = Net Income + Interest + Taxes',
              ].join('\n')
            : '// Enter the values above for the selected mode'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
