'use client';

import { useMemo, useState } from 'react';
import { base64ToBytes, bytesToHex } from '@/lib/tools/base64-utils';

const SAMPLE = 'SGk=';

export default function Base64ToHex() {
  const [input, setInput] = useState(SAMPLE);
  const [grouped, setGrouped] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, message: 'Paste a Base64 string or data URI.' };
    const decoded = base64ToBytes(input);
    if (!decoded.ok) return decoded;
    return {
      ok: true as const,
      output: bytesToHex(decoded.bytes, { grouped }),
      byteCount: decoded.bytes.length,
    };
  }, [input, grouped]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className={`icon-btn${grouped ? ' is-active' : ''}`} onClick={() => setGrouped(true)}>
          Grouped (space-separated)
        </button>
        <button className={`icon-btn${!grouped ? ' is-active' : ''}`} onClick={() => setGrouped(false)}>
          Compact
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Base64</span>
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
            placeholder="Paste Base64 or a data URI..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Hex</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ wordBreak: 'break-all' }}>
            {result.ok ? result.output : ''}
          </div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `✓ ${result.byteCount} byte${result.byteCount === 1 ? '' : 's'}` : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Decodes the Base64 string into its raw bytes first, then renders each byte as two hex
        digits - operating on the actual byte values, not on character codes of a UTF-8-decoded
        string, which matters because arbitrary Base64 payloads aren&apos;t guaranteed to be valid
        text at all. Runs entirely client-side.
      </div>
    </div>
  );
}
