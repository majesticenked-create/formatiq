'use client';

import { useMemo, useState } from 'react';

type Result = { ok: true; ip: string; perOctet: { octal: string; decimal: number }[] } | { ok: false; message: string };

/**
 * Parses a dot-separated octal-per-octet IPv4 notation (e.g. "300.250.001.001") into a normal
 * dotted-decimal IPv4 address. This is the exact inverse of ip-to-octal-converter, which turns
 * an IPv4 address into its four octets each rendered in octal (via `o.toString(8)`, unpadded) -
 * so parsing here accepts each octet with or without leading zeros, requires octal digits only
 * (0-7 - an "8" or "9" is never valid octal), and rejects any octet whose *decoded* value falls
 * outside the valid 0-255 byte range (an octal-digit-valid token like "400" decodes to 256,
 * which is out of range and must be rejected, not clamped or silently accepted).
 */
function parseOctalIp(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: 'Enter an IPv4 address in per-octet octal notation, e.g. 300.250.1.1.' };
  }

  const parts = trimmed.split('.');
  if (parts.length !== 4) {
    return { ok: false, message: `Expected exactly 4 dot-separated octal octets, got ${parts.length}.` };
  }

  const perOctet: { octal: string; decimal: number }[] = [];
  for (const part of parts) {
    if (part === '' || !/^[0-7]+$/.test(part)) {
      return { ok: false, message: `"${part}" isn't valid octal - each octet must use only digits 0-7.` };
    }
    const decimal = parseInt(part, 8);
    if (decimal > 255) {
      return { ok: false, message: `"${part}" (octal) is ${decimal} in decimal - out of range, each octet must be 0-255.` };
    }
    perOctet.push({ octal: part, decimal });
  }

  return { ok: true, ip: perOctet.map((o) => o.decimal).join('.'), perOctet };
}

export default function OctalToIpConverter() {
  const [input, setInput] = useState('300.250.1.1');

  const result = useMemo<Result>(() => parseOctalIp(input), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.ip);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Per-octet octal IPv4</span>
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
          placeholder="e.g. 300.250.1.1"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid octal IPv4 notation' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div>
          <div className="panel" style={{ marginBottom: 8 }}>
            <div className="panel-bar">
              <span>Dotted-decimal IPv4</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={copyOutput}>
                  Copy
                </button>
              </div>
            </div>
            <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
              {result.ip}
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
                  {o.octal} → {o.decimal}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
