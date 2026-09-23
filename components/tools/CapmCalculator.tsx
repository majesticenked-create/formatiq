'use client';

import { useMemo, useState } from 'react';

function calculateCapm(riskFreeRateStr: string, betaStr: string, marketReturnStr: string) {
  const riskFreeRate = Number(riskFreeRateStr);
  const beta = Number(betaStr);
  const marketReturn = Number(marketReturnStr);

  if (!riskFreeRateStr || Number.isNaN(riskFreeRate)) {
    return { ok: false as const, message: 'Enter a risk-free rate (%).' };
  }
  if (!betaStr || Number.isNaN(beta)) {
    return { ok: false as const, message: 'Enter the asset\'s beta.' };
  }
  if (!marketReturnStr || Number.isNaN(marketReturn)) {
    return { ok: false as const, message: 'Enter the expected market return (%).' };
  }

  const marketRiskPremium = marketReturn - riskFreeRate;
  const expectedReturn = riskFreeRate + beta * marketRiskPremium;

  return { ok: true as const, marketRiskPremium, expectedReturn };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function CapmCalculator() {
  const [riskFreeRate, setRiskFreeRate] = useState('4');
  const [beta, setBeta] = useState('1.2');
  const [marketReturn, setMarketReturn] = useState('10');

  const result = useMemo(() => calculateCapm(riskFreeRate, beta, marketReturn), [riskFreeRate, beta, marketReturn]);

  const formatPercent = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Risk-free rate (%):
        </label>
        <input
          type="number"
          value={riskFreeRate}
          onChange={(e) => setRiskFreeRate(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Beta (β):
        </label>
        <input type="number" value={beta} onChange={(e) => setBeta(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Expected market return (%):
        </label>
        <input
          type="number"
          value={marketReturn}
          onChange={(e) => setMarketReturn(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Expected Return (CAPM)</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Market risk premium: ${formatPercent(result.marketRiskPremium)}%`,
                `Expected return: ${formatPercent(result.expectedReturn)}%`,
                '',
                'Formula: E(R) = Rf + β × (Rm − Rf)',
              ].join('\n')
            : '// Enter risk-free rate, beta, and market return above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
