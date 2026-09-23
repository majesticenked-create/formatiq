'use client';

import { useMemo, useState } from 'react';

function calculateDepreciation(costStr: string, salvageStr: string, lifeStr: string) {
  const cost = Number(costStr);
  const salvage = Number(salvageStr);
  const life = Number(lifeStr);

  if (!costStr || Number.isNaN(cost) || cost <= 0) {
    return { ok: false as const, message: 'Enter an asset cost greater than zero.' };
  }
  if (salvageStr === '' || Number.isNaN(salvage) || salvage < 0) {
    return { ok: false as const, message: 'Enter a salvage value of zero or greater.' };
  }
  if (salvage >= cost) {
    return { ok: false as const, message: 'Salvage value must be less than the asset cost - otherwise there\'s nothing left to depreciate.' };
  }
  if (!lifeStr || Number.isNaN(life) || life <= 0) {
    return { ok: false as const, message: 'Enter a useful life (in years) greater than zero.' };
  }

  const depreciableBase = cost - salvage;
  const annualDepreciation = depreciableBase / life;

  const schedule: { year: number; bookValue: number }[] = [];
  for (let year = 1; year <= Math.ceil(life); year += 1) {
    const bookValue = Math.max(cost - annualDepreciation * Math.min(year, life), salvage);
    schedule.push({ year, bookValue });
  }

  return { ok: true as const, depreciableBase, annualDepreciation, schedule };
}

const inputStyle = {
  width: 140,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function DepreciationCalculator() {
  const [cost, setCost] = useState('10000');
  const [salvage, setSalvage] = useState('2000');
  const [life, setLife] = useState('4');

  const result = useMemo(() => calculateDepreciation(cost, salvage, life), [cost, salvage, life]);

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Asset cost ($):
        </label>
        <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Salvage value ($):
        </label>
        <input type="number" value={salvage} onChange={(e) => setSalvage(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Useful life (years):
        </label>
        <input type="number" value={life} onChange={(e) => setLife(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Straight-Line Depreciation</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Depreciable base: $${formatMoney(result.depreciableBase)}`,
                `Annual depreciation: $${formatMoney(result.annualDepreciation)} / year`,
                '',
                'Book value by year:',
                ...result.schedule.map((s) => `  Year ${s.year}: $${formatMoney(s.bookValue)}`),
                '',
                'Formula: annual depreciation = (Cost − Salvage) ÷ Useful life',
              ].join('\n')
            : '// Enter asset cost, salvage value, and useful life above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
