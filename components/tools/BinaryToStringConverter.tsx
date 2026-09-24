'use client';

import { useMemo, useState } from 'react';
import { binaryStringToBytes, bytesToBinaryString } from '@/lib/tools/binary-utils';

const SAMPLE_BINARY = '01001000 01100101 01101100 01101100 01101111';
const SAMPLE_TEXT = 'Hello';

type Mode = 'binaryToText' | 'textToBinary';

export default function BinaryToStringConverter() {
  const [mode, setMode] = useState<Mode>('binaryToText');
  const [input, setInput] = useState(SAMPLE_BINARY);

  const result = useMemo(() => {
    if (mode === 'textToBinary') {
      if (!input) return { ok: false as const, message: 'Type some text to convert.' };
      const bytes = new TextEncoder().encode(input);
      return { ok: true as const, output: bytesToBinaryString(bytes) };
    }
    const parsed = binaryStringToBytes(input);
    if (!parsed.ok) return { ok: false as const, message: parsed.message };
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(parsed.bytes);
      return { ok: true as const, output: text };
    } catch {
      return { ok: false as const, message: 'Those bits decode to bytes that are not valid UTF-8 text.' };
    }
  }, [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'binaryToText' ? SAMPLE_BINARY : SAMPLE_TEXT);
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'binaryToText' ? ' is-active' : ''}`} onClick={() => switchMode('binaryToText')}>
          Binary → Text
        </button>
        <button className={`icon-btn${mode === 'textToBinary' ? ' is-active' : ''}`} onClick={() => switchMode('textToBinary')}>
          Text → Binary
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'binaryToText' ? 'Binary (bit string)' : 'Text'}</span>
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
            placeholder={mode === 'binaryToText' ? 'e.g. 01001000 01101001' : 'Type text here...'}
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'binaryToText' ? 'Text' : 'Binary (bit string)'}</span>
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
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Binary input is grouped 8 bits at a time into raw bytes, then decoded as UTF-8 - not one
        character per bit-group treated as its own code unit - so a multi-byte character like
        &quot;€&quot; (bytes E2 82 AC, i.e. three 8-bit groups) decodes correctly as a single character.
      </div>
    </div>
  );
}
