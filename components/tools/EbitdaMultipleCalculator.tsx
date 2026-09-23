'use client';

import { useMemo, useState } from 'react';

function calculateEbitdaMultiple(enterpriseValueStr: string, ebitdaStr: string) {
  const enterpriseValue = Number(enterpriseValueStr);
  const ebitda = Number(ebitdaStr);

  if (!enterpriseValueStr || Number.isNaN(enterpriseValue)) {
    return { ok: false as const, message: 'Enter an enterprise value.' };
  }
  if (!ebitdaStr || Number.isNaN(ebitda)) {
    return { ok: false as const, message: 'Enter an EBITDA amount.' };
  }
  if (ebitda === 0) {
    return { ok: false as const, message: 'EBITDA cannot be zero - the multiple would be undefined.' };
  }

  const multiple = enterpriseValue / ebitda;
  return { ok: true as const, multiple };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function EbitdaMultipleCalculator() {
  const [enterpriseValue, setEnterpriseValue] = useState('10000000');
  const [ebitda, setEbitda] = useState('2000000');

  const result = useMemo(() => calculateEbitdaMultiple(enterpriseValue, ebitda), [enterpriseValue, ebitda]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Enterprise value ($):
        </label>
        <input
          type="number"
          value={enterpriseValue}
          onChange={(e) => setEnterpriseValue(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          EBITDA ($):
        </label>
        <input type="number" value={ebitda} onChange={(e) => setEbitda(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>EV / EBITDA Multiple</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [`EV/EBITDA multiple: ${result.multiple.toFixed(2)}x`, '', 'Formula: Multiple = Enterprise Value / EBITDA'].join('\n')
            : '// Enter an enterprise value and a non-zero EBITDA above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
