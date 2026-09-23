'use client';

import { useMemo, useState } from 'react';

function ratioAssessment(ratio: number): string {
  if (ratio >= 1) return 'Strong - operating cash flow fully covers total debt within a year';
  if (ratio >= 0.4) return 'Healthy - a commonly cited comfortable range';
  if (ratio >= 0.2) return 'Moderate - worth watching alongside other liquidity metrics';
  return 'Weak - operating cash flow covers only a small share of total debt';
}

function calculateRatio(operatingCashFlowStr: string, totalDebtStr: string) {
  const operatingCashFlow = Number(operatingCashFlowStr);
  const totalDebt = Number(totalDebtStr);

  if (!operatingCashFlowStr || Number.isNaN(operatingCashFlow)) {
    return { ok: false as const, message: 'Enter operating cash flow.' };
  }
  if (!totalDebtStr || Number.isNaN(totalDebt) || totalDebt <= 0) {
    return { ok: false as const, message: 'Enter total debt greater than zero.' };
  }

  const ratio = operatingCashFlow / totalDebt;
  return { ok: true as const, ratio, assessment: ratioAssessment(ratio) };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function CashFlowToDebtRatioCalculator() {
  const [operatingCashFlow, setOperatingCashFlow] = useState('250000');
  const [totalDebt, setTotalDebt] = useState('500000');

  const result = useMemo(() => calculateRatio(operatingCashFlow, totalDebt), [operatingCashFlow, totalDebt]);

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
          Total debt ($):
        </label>
        <input
          type="number"
          value={totalDebt}
          onChange={(e) => setTotalDebt(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Cash Flow to Debt Ratio</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Ratio: ${result.ratio.toFixed(4)} (${(result.ratio * 100).toFixed(2)}%)`,
                '',
                result.assessment,
              ].join('\n')
            : '// Enter operating cash flow and total debt above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
