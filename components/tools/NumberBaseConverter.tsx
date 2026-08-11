'use client';

import { useMemo, useState } from 'react';

type Base = 2 | 8 | 10 | 16;

const BASE_LABELS: Record<Base, string> = {
  2: 'Binary',
  8: 'Octal',
  10: 'Decimal',
  16: 'Hexadecimal',
};

const BASE_CHARSETS: Record<Base, string> = {
  2: '01',
  8: '01234567',
  10: '0123456789',
  16: '0123456789abcdefABCDEF',
};

function isValidForBase(value: string, base: Base): boolean {
  const chars = BASE_CHARSETS[base];
  return value.length > 0 && Array.from(value).every((c) => chars.includes(c));
}

function convert(input: string, fromBase: Base) {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false as const, message: 'Enter a number to convert.' };
  }
  if (!isValidForBase(trimmed, fromBase)) {
    return {
      ok: false as const,
      message: `"${trimmed}" contains characters not valid in ${BASE_LABELS[fromBase]} (base ${fromBase}).`,
    };
  }

  const decimal = parseInt(trimmed, fromBase);
  if (!Number.isFinite(decimal)) {
    return { ok: false as const, message: 'Number is too large to convert accurately.' };
  }

  return {
    ok: true as const,
    binary: decimal.toString(2),
    octal: decimal.toString(8),
    decimal: decimal.toString(10),
    hex: decimal.toString(16).toUpperCase(),
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
      <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px', wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  );
}

export default function NumberBaseConverter() {
  const [inputBase, setInputBase] = useState<Base>(10);
  const [input, setInput] = useState('255');

  const result = useMemo(() => convert(input, inputBase), [input, inputBase]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Input base:
        </label>
        {([2, 8, 10, 16] as Base[]).map((b) => (
          <button
            key={b}
            className="icon-btn"
            style={{
              borderColor: inputBase === b ? 'var(--accent-dim)' : undefined,
              color: inputBase === b ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => setInputBase(b)}
          >
            {BASE_LABELS[b]}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{BASE_LABELS[inputBase]} input</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Converted below' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div>
          <OutputRow label="Binary (base 2)" value={result.binary} />
          <OutputRow label="Octal (base 8)" value={result.octal} />
          <OutputRow label="Decimal (base 10)" value={result.decimal} />
          <OutputRow label="Hexadecimal (base 16)" value={result.hex} />
        </div>
      )}
    </div>
  );
}
