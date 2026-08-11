'use client';

import { useMemo, useState } from 'react';

type Mode = 'encode' | 'decode';
type ByteFormat = 'hex' | 'decimal';

function encodeToBytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text));
}

function formatBytes(bytes: number[], format: ByteFormat): string {
  if (format === 'hex') {
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');
  }
  return bytes.join(' ');
}

function parseBytes(input: string, format: ByteFormat): { ok: true; bytes: number[] } | { ok: false; message: string } {
  const tokens = input.trim().split(/[\s,]+/).filter(Boolean);
  if (tokens.length === 0) {
    return { ok: false, message: 'Enter byte values to decode.' };
  }
  const bytes: number[] = [];
  for (const token of tokens) {
    const clean = token.replace(/^0x/i, '');
    const value = format === 'hex' ? parseInt(clean, 16) : parseInt(clean, 10);
    if (Number.isNaN(value) || value < 0 || value > 255) {
      return { ok: false, message: `"${token}" is not a valid ${format === 'hex' ? 'hex' : 'decimal'} byte (0-255).` };
    }
    bytes.push(value);
  }
  return { ok: true, bytes };
}

function decodeFromBytes(bytes: number[]): { ok: true; text: string } | { ok: false; message: string } {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    return { ok: true, text };
  } catch {
    return { ok: false, message: 'These bytes are not valid UTF-8 — the sequence is malformed or incomplete.' };
  }
}

export default function Utf8EncodeDecode() {
  const [mode, setMode] = useState<Mode>('encode');
  const [format, setFormat] = useState<ByteFormat>('hex');
  const [input, setInput] = useState('Café ☕');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === 'encode') {
      if (!input) return { ok: false as const, message: 'Enter text to encode.' };
      const bytes = encodeToBytes(input);
      return { ok: true as const, output: formatBytes(bytes, format), byteCount: bytes.length };
    }
    const parsed = parseBytes(input, format);
    if (!parsed.ok) return { ok: false as const, message: parsed.message };
    const decoded = decodeFromBytes(parsed.bytes);
    if (!decoded.ok) return { ok: false as const, message: decoded.message };
    return { ok: true as const, output: decoded.text, byteCount: parsed.bytes.length };
  }, [mode, format, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'encode' ? 'Café ☕' : format === 'hex' ? '43 61 66 c3 a9 20 e2 98 95' : '67 97 102 233 32 226 152 149');
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
          Text → UTF-8 bytes
        </button>
        <button className={`icon-btn ${mode === 'decode' ? 'is-active' : ''}`} onClick={() => switchMode('decode')}>
          UTF-8 bytes → Text
        </button>
        <button className={`icon-btn ${format === 'hex' ? 'is-active' : ''}`} onClick={() => setFormat('hex')}>
          Hex
        </button>
        <button className={`icon-btn ${format === 'decimal' ? 'is-active' : ''}`} onClick={() => setFormat('decimal')}>
          Decimal
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{mode === 'encode' ? 'Text input' : `Byte input (${format})`}</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
      </div>

      <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
        {result.ok ? `✓ ${result.byteCount} byte${result.byteCount === 1 ? '' : 's'}` : `✗ ${result.message}`}
      </div>

      {result.ok && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>{mode === 'encode' ? `UTF-8 bytes (${format})` : 'Decoded text'}</span>
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
