'use client';

import { useMemo, useState } from 'react';

function calculateInventoryTurnover(cogsStr: string, beginInventoryStr: string, endInventoryStr: string) {
  const cogs = Number(cogsStr);
  const beginInventory = Number(beginInventoryStr);
  const endInventory = Number(endInventoryStr);

  if (!cogsStr || Number.isNaN(cogs) || cogs < 0) {
    return { ok: false as const, message: 'Enter cost of goods sold (COGS) of zero or greater.' };
  }
  if (!beginInventoryStr || Number.isNaN(beginInventory) || beginInventory < 0) {
    return { ok: false as const, message: 'Enter a beginning inventory value of zero or greater.' };
  }
  if (!endInventoryStr || Number.isNaN(endInventory) || endInventory < 0) {
    return { ok: false as const, message: 'Enter an ending inventory value of zero or greater.' };
  }

  const averageInventory = (beginInventory + endInventory) / 2;
  if (averageInventory === 0) {
    return { ok: false as const, message: 'Average inventory cannot be zero - enter a nonzero beginning or ending inventory.' };
  }

  const turnover = cogs / averageInventory;
  const daysInventory = 365 / turnover;

  return { ok: true as const, averageInventory, turnover, daysInventory };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function InventoryTurnoverCalculator() {
  const [cogs, setCogs] = useState('500000');
  const [beginInventory, setBeginInventory] = useState('80000');
  const [endInventory, setEndInventory] = useState('120000');

  const result = useMemo(
    () => calculateInventoryTurnover(cogs, beginInventory, endInventory),
    [cogs, beginInventory, endInventory]
  );

  const formatMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Cost of goods sold ($):
        </label>
        <input type="number" value={cogs} onChange={(e) => setCogs(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Beginning inventory ($):
        </label>
        <input
          type="number"
          value={beginInventory}
          onChange={(e) => setBeginInventory(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Ending inventory ($):
        </label>
        <input
          type="number"
          value={endInventory}
          onChange={(e) => setEndInventory(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Inventory Turnover</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Average inventory: $${formatMoney(result.averageInventory)}`,
                `Inventory turnover: ${result.turnover.toFixed(2)}x`,
                `Days inventory outstanding: ${result.daysInventory.toFixed(1)} days`,
                '',
                'Formula: turnover = COGS ÷ ((beginning + ending inventory) / 2)',
                'Days inventory = 365 ÷ turnover',
              ].join('\n')
            : '// Enter COGS, beginning inventory, and ending inventory above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
