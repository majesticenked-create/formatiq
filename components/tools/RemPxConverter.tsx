'use client';

import { useMemo, useState } from 'react';

function tryConvert(value: string, baseFontSize: string) {
  const num = Number(value);
  const base = Number(baseFontSize);

  if (value.trim() === '' || Number.isNaN(num)) {
    return { ok: false as const, message: 'Enter a value to convert.' };
  }
  if (baseFontSize.trim() === '' || Number.isNaN(base) || base <= 0) {
    return { ok: false as const, message: 'Enter a base font size greater than 0.' };
  }

  return {
    ok: true as const,
    px: num,
    rem: num / base,
    em: num / base,
  };
}

interface OutputRowProps {
  label: string;
  value: string;
}

function OutputRow({ label, value }: OutputRowProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="panel" style={{ marginBottom: 8 }}>
      <div className="panel-bar">
        <span>{label}</span>
        <div className="panel-actions">
          <button className="icon-btn" onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
        {value}
      </div>
    </div>
  );
}

type Unit = 'px' | 'rem' | 'em';

export default function RemPxConverter() {
  const [unit, setUnit] = useState<Unit>('px');
  const [value, setValue] = useState('16');
  const [baseFontSize, setBaseFontSize] = useState('16');

  // Whatever unit is selected, convert the typed value to a px amount first,
  // then derive rem/em from that shared px value.
  const pxValue = useMemo(() => {
    const num = Number(value);
    const base = Number(baseFontSize);
    if (Number.isNaN(num) || Number.isNaN(base)) return NaN;
    return unit === 'px' ? num : num * base;
  }, [unit, value, baseFontSize]);

  const result = useMemo(() => tryConvert(String(pxValue), baseFontSize), [pxValue, baseFontSize]);

  return (
    <div>
      <div className="control-row">
        <button
          className={`icon-btn${unit === 'px' ? ' is-active' : ''}`}
          onClick={() => setUnit('px')}
        >
          PX
        </button>
        <button
          className={`icon-btn${unit === 'rem' ? ' is-active' : ''}`}
          onClick={() => setUnit('rem')}
        >
          REM
        </button>
        <button
          className={`icon-btn${unit === 'em' ? ' is-active' : ''}`}
          onClick={() => setUnit('em')}
        >
          EM
        </button>
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Value ({unit}):
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mono"
          style={{
            width: 120,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Base font size (px):
        </label>
        <input
          type="number"
          value={baseFontSize}
          onChange={(e) => setBaseFontSize(e.target.value)}
          className="mono"
          style={{
            width: 100,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
      </div>

      <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`} style={{ marginBottom: 16 }}>
        {result.ok ? '✓ Converted' : `✗ ${result.message}`}
      </div>

      {result.ok && (
        <div>
          <OutputRow label="PX" value={`${result.px}px`} />
          <OutputRow label="REM" value={`${Number(result.rem.toFixed(4))}rem`} />
          <OutputRow label="EM" value={`${Number(result.em.toFixed(4))}em`} />
        </div>
      )}
    </div>
  );
}
