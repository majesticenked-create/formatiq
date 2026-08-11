'use client';

import { useMemo, useState } from 'react';

function parseIp(input: string): number | null {
  const trimmed = input.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) return null;
  if (parts.some((p) => !/^\d{1,3}$/.test(p))) return null;
  const values = parts.map(Number);
  if (values.some((v) => v < 0 || v > 255)) return null;
  return ((values[0] << 24) | (values[1] << 16) | (values[2] << 8) | values[3]) >>> 0;
}

function intToDotted(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function intToBinary(n: number): string {
  const bits = n.toString(2).padStart(32, '0');
  return [bits.slice(0, 8), bits.slice(8, 16), bits.slice(16, 24), bits.slice(24, 32)].join('.');
}

function intToHex(n: number): string {
  return '0x' + n.toString(16).padStart(8, '0').toUpperCase();
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

export default function IpAddressFormatter() {
  const [input, setInput] = useState('192.168.1.1');

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, message: 'Enter an IPv4 address.' };
    const parsed = parseIp(input);
    if (parsed === null) {
      return { ok: false as const, message: `"${input.trim()}" is not a valid IPv4 address (e.g. 192.168.1.1).` };
    }
    return {
      ok: true as const,
      dotted: intToDotted(parsed),
      decimal: String(parsed),
      hex: intToHex(parsed),
      binary: intToBinary(parsed),
    };
  }, [input]);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>IPv4 address</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="e.g. 192.168.1.1"
          style={{ minHeight: 44 }}
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid IPv4 address' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div>
          <OutputRow label="Dotted decimal" value={result.dotted} />
          <OutputRow label="Decimal (32-bit integer)" value={result.decimal} />
          <OutputRow label="Hexadecimal" value={result.hex} />
          <OutputRow label="Binary" value={result.binary} />
        </div>
      )}
    </div>
  );
}
