'use client';

import { useMemo, useState } from 'react';
import { parseIpOctets } from '@/lib/tools/ip-utils';

export default function IpToOctalConverter() {
  const [input, setInput] = useState('192.168.1.1');

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, message: 'Enter an IPv4 address.' };
    const octets = parseIpOctets(input);
    if (!octets) {
      return { ok: false as const, message: `"${input.trim()}" is not a valid IPv4 address (e.g. 192.168.1.1).` };
    }
    return {
      ok: true as const,
      octal: octets.map((o) => o.toString(8)).join('.'),
      perOctet: octets.map((o) => ({ decimal: o, octal: o.toString(8) })),
    };
  }, [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.octal);
  }

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
        <input
          className="mono"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="e.g. 192.168.1.1"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid IPv4 address' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div>
          <div className="panel" style={{ marginBottom: 8 }}>
            <div className="panel-bar">
              <span>Octal (per-octet)</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={copyOutput}>
                  Copy
                </button>
              </div>
            </div>
            <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
              {result.octal}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            {result.perOctet.map((o, i) => (
              <div key={i} className="panel" style={{ padding: 14 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Octet {i + 1}
                </div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                  {o.decimal} → {o.octal}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
