'use client';

import { useMemo, useState } from 'react';

type Mode = 'encode' | 'decode';

function encode(input: string) {
  try {
    return { ok: true as const, output: btoa(unescape(encodeURIComponent(input))) };
  } catch {
    return { ok: false as const, message: 'Could not encode this input.' };
  }
}

function decode(input: string) {
  try {
    return { ok: true as const, output: decodeURIComponent(escape(atob(input.trim()))) };
  } catch {
    return { ok: false as const, message: 'Not valid Base64.' };
  }
}

const SAMPLE_PLAIN = 'Formatiq makes dev tools fast.';
const SAMPLE_ENCODED = 'Rm9ybWF0aXEgbWFrZXMgZGV2IHRvb2xzIGZhc3Qu';

export default function Base64Tool({ defaultMode = 'encode' }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [input, setInput] = useState(defaultMode === 'decode' ? SAMPLE_ENCODED : SAMPLE_PLAIN);

  const result = useMemo(() => (mode === 'encode' ? encode(input) : decode(input)), [mode, input]);

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button
          className={`icon-btn${mode === 'encode' ? ' is-active' : ''}`}
          onClick={() => setMode('encode')}
        >
          Encode
        </button>
        <button
          className={`icon-btn${mode === 'decode' ? ' is-active' : ''}`}
          onClick={() => setMode('decode')}
        >
          Decode
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'encode' ? 'Plain text' : 'Base64'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'encode' ? 'Base64' : 'Plain text'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Done' : `✗ ${result.message}`}
          </div>
        </div>
      </div>
    </div>
  );
}
