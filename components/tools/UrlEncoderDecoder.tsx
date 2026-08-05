'use client';

import { useMemo, useState } from 'react';

type Mode = 'encode' | 'decode';

function encode(input: string) {
  try {
    return { ok: true as const, output: encodeURIComponent(input) };
  } catch {
    return { ok: false as const, message: 'Could not encode this input.' };
  }
}

function decode(input: string) {
  try {
    return { ok: true as const, output: decodeURIComponent(input) };
  } catch {
    return { ok: false as const, message: 'Malformed percent-encoding — check for stray "%" characters.' };
  }
}

export default function UrlEncoderDecoder() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('https://formatiq.com/tools?q=dev tools & more');

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
          className="icon-btn"
          style={{
            borderColor: mode === 'encode' ? 'var(--accent-dim)' : undefined,
            color: mode === 'encode' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setMode('encode')}
        >
          Encode
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'decode' ? 'var(--accent-dim)' : undefined,
            color: mode === 'decode' ? 'var(--text-primary)' : undefined,
          }}
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
            <span>{mode === 'encode' ? 'Plain text' : 'URL-encoded'}</span>
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
            <span>{mode === 'encode' ? 'URL-encoded' : 'Plain text'}</span>
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
