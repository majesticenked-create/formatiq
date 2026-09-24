'use client';

import { useMemo, useState } from 'react';
import { byteListToText, textToByteList } from '@/lib/tools/byte-string-utils';

const SAMPLE_TEXT = 'Hello';
const SAMPLE_BYTES = '72 101 108 108 111';

type Mode = 'bytesToText' | 'textToBytes';

export default function ByteToStringConverter() {
  const [mode, setMode] = useState<Mode>('bytesToText');
  const [input, setInput] = useState(SAMPLE_BYTES);

  const result = useMemo(() => {
    if (mode === 'bytesToText') {
      const decoded = byteListToText(input);
      if (!decoded.ok) return { ok: false as const, message: decoded.message };
      return { ok: true as const, output: decoded.text };
    }
    if (!input) return { ok: false as const, message: 'Type some text to convert.' };
    return { ok: true as const, output: textToByteList(input) };
  }, [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'bytesToText' ? SAMPLE_BYTES : SAMPLE_TEXT);
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'bytesToText' ? ' is-active' : ''}`} onClick={() => switchMode('bytesToText')}>
          Bytes → Text
        </button>
        <button className={`icon-btn${mode === 'textToBytes' ? ' is-active' : ''}`} onClick={() => switchMode('textToBytes')}>
          Text → Bytes
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'bytesToText' ? 'Decimal byte values' : 'Text'}</span>
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
            placeholder={mode === 'bytesToText' ? 'Space or comma separated bytes, e.g. 72 101 108 108 111' : 'Type text here...'}
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'bytesToText' ? 'Text' : 'Decimal byte values'}</span>
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
