'use client';

import { useMemo, useState } from 'react';

type Mode = 'encode' | 'decode';

function textToBinary(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}

function binaryToText(input: string): { ok: true; text: string } | { ok: false; message: string } {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { ok: false, message: 'Enter space-separated 8-bit binary bytes to decode.' };

  const bytes: number[] = [];
  for (const token of tokens) {
    if (!/^[01]{1,8}$/.test(token)) {
      return { ok: false, message: `"${token}" is not a valid 8-bit binary byte (only 0s and 1s, up to 8 digits).` };
    }
    bytes.push(parseInt(token, 2));
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    return { ok: true, text };
  } catch {
    return { ok: false, message: 'These bytes don’t form valid UTF-8 text.' };
  }
}

export default function TextToBinaryConverter() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('Hello!');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === 'encode') {
      if (!input) return { ok: false as const, message: 'Enter text to convert to binary.' };
      return { ok: true as const, output: textToBinary(input) };
    }
    const decoded = binaryToText(input);
    if (!decoded.ok) return { ok: false as const, message: decoded.message };
    return { ok: true as const, output: decoded.text };
  }, [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'encode' ? 'Hello!' : '01001000 01100101 01101100 01101100 01101111 00100001');
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
          Text → Binary
        </button>
        <button className={`icon-btn ${mode === 'decode' ? 'is-active' : ''}`} onClick={() => switchMode('decode')}>
          Binary → Text
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{mode === 'encode' ? 'Text input' : 'Binary input (space-separated bytes)'}</span>
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
            <span>{mode === 'encode' ? 'Binary output' : 'Decoded text'}</span>
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
