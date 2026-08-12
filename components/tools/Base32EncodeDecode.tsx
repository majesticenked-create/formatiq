'use client';

import { useMemo, useState } from 'react';

type Mode = 'encode' | 'decode';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(bytes: Uint8Array): string {
  let output = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 0x1f];
  }

  while (output.length % 8 !== 0) output += '=';
  return output;
}

function base32Decode(input: string): { ok: true; bytes: Uint8Array } | { ok: false; message: string } {
  const cleaned = input.trim().toUpperCase().replace(/=+$/, '');
  if (!cleaned) return { ok: false, message: 'Enter a Base32 string to decode.' };
  if (!/^[A-Z2-7]+$/.test(cleaned)) {
    return { ok: false, message: 'Base32 can only contain A-Z and 2-7 (plus optional trailing "=" padding).' };
  }

  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of cleaned) {
    value = (value << 5) | ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return { ok: true, bytes: new Uint8Array(bytes) };
}

export default function Base32EncodeDecode() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('Formatiq');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === 'encode') {
      if (!input) return { ok: false as const, message: 'Enter text to encode.' };
      return { ok: true as const, output: base32Encode(new TextEncoder().encode(input)) };
    }
    const decoded = base32Decode(input);
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
    setInput(next === 'encode' ? 'Formatiq' : 'IZXXE3LBORUXC===');
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
          Text → Base32
        </button>
        <button className={`icon-btn ${mode === 'decode' ? 'is-active' : ''}`} onClick={() => switchMode('decode')}>
          Base32 → Text
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{mode === 'encode' ? 'Text input' : 'Base32 input'}</span>
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
            <span>{mode === 'encode' ? 'Base32 output' : 'Decoded text'}</span>
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
