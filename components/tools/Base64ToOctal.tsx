'use client';

import { useMemo, useState } from 'react';
import { base64ToBytes, bytesToOctal } from '@/lib/tools/base64-utils';

const SAMPLE = 'SGk=';

export default function Base64ToOctal() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, message: 'Paste a Base64 string or data URI.' };
    const decoded = base64ToBytes(input);
    if (!decoded.ok) return decoded;
    return { ok: true as const, output: bytesToOctal(decoded.bytes), byteCount: decoded.bytes.length };
  }, [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
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
            <span>Octal (3 digits per byte)</span>
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
        Decodes the Base64 string into its raw bytes first, then renders each byte as 3-digit,
        zero-padded octal (e.g. byte 65 becomes &quot;101&quot;) - operating on the actual byte
        values, not on character codes of a UTF-8-decoded string. Runs entirely client-side.
      </div>
    </div>
  );
}
