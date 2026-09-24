'use client';

import { useMemo, useState } from 'react';
import { binaryStringToBytes } from '@/lib/tools/binary-utils';
import { bytesToBase64 } from '@/lib/tools/base64-utils';

const SAMPLE_BINARY = '01001000 01101001';

export default function BinaryToBase64Converter() {
  const [input, setInput] = useState(SAMPLE_BINARY);

  const result = useMemo(() => {
    const parsed = binaryStringToBytes(input);
    if (!parsed.ok) return { ok: false as const, message: parsed.message };
    return { ok: true as const, output: bytesToBase64(parsed.bytes), byteCount: parsed.bytes.length };
  }, [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Binary (bit string)</span>
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
            placeholder="e.g. 01001000 01101001"
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Base64</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ wordBreak: 'break-all' }}>
            {result.ok ? result.output : `// ${result.message}`}
          </div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `✓ ${result.byteCount} byte${result.byteCount === 1 ? '' : 's'}` : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        The binary input is read as the bits of raw bytes (8 bits = 1 byte), and those bytes are
        Base64-encoded directly - the literal text of the bit string itself is never encoded.
        Whitespace between bytes is optional and stripped automatically; the total bit count must
        be a multiple of 8.
      </div>
    </div>
  );
}
