'use client';

import { useMemo, useState } from 'react';

function calculateInterestCoverageRatio(ebitStr: string, interestExpenseStr: string) {
  const ebit = Number(ebitStr);
  const interestExpense = Number(interestExpenseStr);

  if (!ebitStr || Number.isNaN(ebit)) {
    return { ok: false as const, message: 'Enter an EBIT (or loss) amount.' };
  }
  if (!interestExpenseStr || Number.isNaN(interestExpense) || interestExpense === 0) {
    return { ok: false as const, message: 'Enter an interest expense greater than zero (it cannot be zero).' };
  }

  const ratio = ebit / interestExpense;
  return { ok: true as const, ratio };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function InterestCoverageRatioCalculator() {
  const [ebit, setEbit] = useState('500000');
  const [interestExpense, setInterestExpense] = useState('100000');

  const result = useMemo(() => calculateInterestCoverageRatio(ebit, interestExpense), [ebit, interestExpense]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          EBIT ($):
        </label>
        <input type="number" value={ebit} onChange={(e) => setEbit(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Interest expense ($):
        </label>
        <input
          type="number"
          value={interestExpense}
          onChange={(e) => setInterestExpense(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Interest Coverage Ratio</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Interest coverage ratio: ${result.ratio.toFixed(2)}x`,
                '',
                'Formula: interest coverage ratio = EBIT ÷ interest expense',
              ].join('\n')
            : '// Enter EBIT and a non-zero interest expense above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
