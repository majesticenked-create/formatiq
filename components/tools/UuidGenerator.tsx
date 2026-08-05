'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 5 }, () => uuidv4()));

  function regenerate(n = count) {
    setIds(Array.from({ length: n }, () => uuidv4()));
  }

  function copyAll() {
    const text = ids.map((id) => (uppercase ? id.toUpperCase() : id)).join('\n');
    navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Count:
        </label>
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => {
            const n = Math.min(100, Math.max(1, Number(e.target.value) || 1));
            setCount(n);
          }}
          className="mono"
          style={{
            width: 64,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <button className="icon-btn" onClick={() => setUppercase((u) => !u)}>
          {uppercase ? 'UPPERCASE' : 'lowercase'}
        </button>
        <button className="btn btn-primary" onClick={() => regenerate()}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAll}>
          Copy all
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Generated UUIDs (v4)</span>
        </div>
        <div className="output mono">
          {ids.map((id) => (uppercase ? id.toUpperCase() : id)).join('\n')}
        </div>
        <div className="status-line status-neutral">{ids.length} generated</div>
      </div>
    </div>
  );
}
