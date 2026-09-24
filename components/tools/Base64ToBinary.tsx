'use client';

import { useMemo, useState } from 'react';
import { base64ToBytes } from '@/lib/tools/base64-utils';

const SAMPLE = 'SGk=';

function bytesToBinaryString(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}

export default function Base64ToBinary() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, message: 'Paste a Base64 string or data URI.' };
    const decoded = base64ToBytes(input);
    if (!decoded.ok) return decoded;
    return { ok: true as const, output: bytesToBinaryString(decoded.bytes), byteCount: decoded.bytes.length };
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
            <span>Binary (8 bits per byte)</span>
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
        Decodes the Base64 string into its raw bytes first, then renders each byte as an 8-bit,
        zero-padded binary group - this is different from converting each character&apos;s code point,
        which would silently break on multi-byte UTF-8 sequences in the decoded data. Runs entirely
        client-side.
      </div>
    </div>
  );
}
