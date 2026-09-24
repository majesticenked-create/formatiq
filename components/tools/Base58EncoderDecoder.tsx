'use client';

import { useMemo, useState } from 'react';
import { bytesToBase58, base58ToBytes } from '@/lib/tools/base58-utils';

type Mode = 'encode' | 'decode';

export default function Base58EncoderDecoder() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('Formatiq');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === 'encode') {
      if (!input) return { ok: false as const, message: 'Enter text to encode.' };
      return { ok: true as const, output: bytesToBase58(new TextEncoder().encode(input)) };
    }
    const decoded = base58ToBytes(input);
    if (!decoded.ok) return { ok: false as const, message: decoded.message };
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(decoded.bytes);
      return { ok: true as const, output: text };
    } catch {
      return { ok: false as const, message: 'Decoded bytes are not valid UTF-8 text.' };
    }
  }, [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'encode' ? 'Formatiq' : bytesToBase58(new TextEncoder().encode('Formatiq')));
  }

  function copy() {
    if (!result.ok) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn ${mode === 'encode' ? 'is-active' : ''}`} onClick={() => switchMode('encode')}>
          Text → Base58
        </button>
        <button className={`icon-btn ${mode === 'decode' ? 'is-active' : ''}`} onClick={() => switchMode('decode')}>
          Base58 → Text
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{mode === 'encode' ? 'Text input' : 'Base58 input'}</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
      </div>

      <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
        {result.ok ? '✓ Converted' : `✗ ${result.message}`}
      </div>

      {result.ok && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>{mode === 'encode' ? 'Base58 output' : 'Decoded text'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="output mono">{result.output}</div>
        </div>
      )}
    </div>
  );
}
