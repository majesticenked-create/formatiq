'use client';

import { useState } from 'react';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// US ZIP codes are assigned within 00501-99950; generating within that range and
// zero-padding to 5 digits keeps the format valid, though - like any randomly
// generated code - it isn't guaranteed to be an actually assigned, deliverable ZIP.
function generateZipCodes(count: number, plusFour: boolean): string[] {
  return Array.from({ length: count }, () => {
    const base = String(randomInt(501, 99950)).padStart(5, '0');
    return plusFour ? `${base}-${String(randomInt(0, 9999)).padStart(4, '0')}` : base;
  });
}

export default function RandomZipCodeGenerator() {
  const [count, setCount] = useState(10);
  const [plusFour, setPlusFour] = useState(false);
  const [zips, setZips] = useState<string[]>(() => generateZipCodes(10, false));

  function generate() {
    const clamped = Math.min(50, Math.max(1, count));
    setCount(clamped);
    setZips(generateZipCodes(clamped, plusFour));
  }

  function copyAll() {
    navigator.clipboard.writeText(zips.join('\n'));
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
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="mono"
          style={{ width: 64, padding: '4px 8px' }}
        />
        <button
          className={`icon-btn${plusFour ? ' is-active' : ''}`}
          onClick={() => setPlusFour((v) => !v)}
        >
          ZIP+4
        </button>
        <button className="icon-btn" onClick={generate}>
          Generate
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>{zips.length} generated</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copyAll}>
              Copy all
            </button>
          </div>
        </div>
        <div className="output mono">{zips.join('\n')}</div>
        <div className="status-line status-neutral">
          Randomly generated, properly formatted codes - useful as test data, not verified as assigned or deliverable ZIP codes.
        </div>
      </div>
    </div>
  );
}
