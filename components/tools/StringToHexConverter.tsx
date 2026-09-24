'use client';

import { useMemo, useState } from 'react';
import { textToHex } from '@/lib/tools/hex-utf8-utils';

const SAMPLE_TEXT = 'Hello';

export default function StringToHexConverter() {
  const [input, setInput] = useState(SAMPLE_TEXT);

  const result = useMemo(() => {
    if (!input) return { ok: false as const, message: 'Type some text to convert.' };
    const hex = textToHex(input);
    return { ok: true as const, output: hex, byteCount: hex.length / 2 };
  }, [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Text</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} placeholder="Type text here..." />
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
            {result.ok ? result.output : `// ${result.message}`}
          </div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `✓ ${result.byteCount} byte${result.byteCount === 1 ? '' : 's'}` : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Text is encoded to its raw UTF-8 bytes with `TextEncoder` (never `charCodeAt`), so
        multi-byte characters are handled correctly - e.g. &quot;€&quot; encodes to the three bytes
        &quot;E282AC&quot;, not a single truncated byte.
      </div>
    </div>
  );
}
