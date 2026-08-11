'use client';

import { useState } from 'react';

type Separator = 'colon' | 'hyphen';

function randomByte(): number {
  return Math.floor(Math.random() * 256);
}

function generateMac(separator: Separator, locallyAdministered: boolean): string {
  let firstByte = randomByte();
  // Bit 1 (0x02) of the first octet is the U/L bit: 0 = universally
  // administered (vendor-assigned), 1 = locally administered.
  firstByte = locallyAdministered ? firstByte | 0x02 : firstByte & ~0x02;
  // Bit 0 (0x01) is the I/G bit (individual vs group/multicast) — cleared
  // so generated addresses always represent a single device, not a group.
  firstByte &= ~0x01;

  const bytes = [firstByte, ...Array.from({ length: 5 }, randomByte)];
  const sep = separator === 'colon' ? ':' : '-';
  return bytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(sep);
}

export default function MacAddressGenerator() {
  const [count, setCount] = useState(5);
  const [separator, setSeparator] = useState<Separator>('colon');
  const [locallyAdministered, setLocallyAdministered] = useState(false);
  const [addresses, setAddresses] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => generateMac('colon', false))
  );
  const [copied, setCopied] = useState(false);

  function regenerate(n = count, sep = separator, local = locallyAdministered) {
    setAddresses(Array.from({ length: n }, () => generateMac(sep, local)));
  }

  function copyAll() {
    navigator.clipboard.writeText(addresses.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
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
          onChange={(e) => {
            const n = Math.min(50, Math.max(1, Number(e.target.value) || 1));
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
        <button
          className={`icon-btn ${separator === 'colon' ? 'is-active' : ''}`}
          onClick={() => {
            setSeparator('colon');
            regenerate(count, 'colon', locallyAdministered);
          }}
        >
          Colon (AA:BB:CC)
        </button>
        <button
          className={`icon-btn ${separator === 'hyphen' ? 'is-active' : ''}`}
          onClick={() => {
            setSeparator('hyphen');
            regenerate(count, 'hyphen', locallyAdministered);
          }}
        >
          Hyphen (AA-BB-CC)
        </button>
        <button
          className={`icon-btn ${locallyAdministered ? 'is-active' : ''}`}
          onClick={() => {
            const next = !locallyAdministered;
            setLocallyAdministered(next);
            regenerate(count, separator, next);
          }}
        >
          {locallyAdministered ? 'Locally administered' : 'Universally administered'}
        </button>
        <button className="btn btn-primary" onClick={() => regenerate()}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAll}>
          {copied ? 'Copied!' : 'Copy all'}
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Generated MAC addresses</span>
        </div>
        <div className="output mono">{addresses.join('\n')}</div>
        <div className="status-line status-neutral">{addresses.length} generated</div>
      </div>
    </div>
  );
}
