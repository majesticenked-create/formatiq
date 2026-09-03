'use client';

import { useMemo, useState } from 'react';

const SAMPLE_IP = '192.168.1.10';
const SAMPLE_HEX = 'C0A8010A';

type Mode = 'ipToHex' | 'hexToIp';

function ipToHex(input: string) {
  const trimmed = input.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) return { ok: false as const, message: 'Enter a valid IPv4 address, e.g. 192.168.1.10.' };

  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return { ok: false as const, message: `"${part}" isn't a valid octet.` };
    const n = Number(part);
    if (n > 255) return { ok: false as const, message: `"${part}" is out of range - each octet must be 0-255.` };
    octets.push(n);
  }

  return { ok: true as const, output: octets.map((o) => o.toString(16).padStart(2, '0')).join('').toUpperCase() };
}

function hexToIp(input: string) {
  const trimmed = input.trim().replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]{8}$/.test(trimmed)) {
    return { ok: false as const, message: 'Enter exactly 8 hex digits (4 bytes), e.g. C0A8010A.' };
  }

  const octets = [];
  for (let i = 0; i < 8; i += 2) {
    octets.push(parseInt(trimmed.slice(i, i + 2), 16));
  }
  return { ok: true as const, output: octets.join('.') };
}

export default function IpHexConverter() {
  const [mode, setMode] = useState<Mode>('ipToHex');
  const [input, setInput] = useState(SAMPLE_IP);

  const result = useMemo(() => (mode === 'ipToHex' ? ipToHex(input) : hexToIp(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'ipToHex' ? SAMPLE_IP : SAMPLE_HEX);
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'ipToHex' ? ' is-active' : ''}`} onClick={() => switchMode('ipToHex')}>
          IPv4 → Hex
        </button>
        <button className={`icon-btn${mode === 'hexToIp' ? ' is-active' : ''}`} onClick={() => switchMode('hexToIp')}>
          Hex → IPv4
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'ipToHex' ? 'IPv4 address' : 'Hex (8 digits)'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <input
            className="mono"
            style={{ width: '100%', padding: '10px 12px' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={mode === 'ipToHex' ? '192.168.1.10' : 'C0A8010A'}
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'ipToHex' ? 'Hex' : 'IPv4 address'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : `// ${result.message}`}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>
    </div>
  );
}
