'use client';

import { useMemo, useState } from 'react';
import { hexToBytes } from '@/lib/tools/hex-utf8-utils';
import { bytesToBase64 } from '@/lib/tools/base64-utils';

const SAMPLE = '48656c6c6f';

function convert(input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Enter a hex string to convert, e.g. 48656c6c6f.' };
  }
  const parsed = hexToBytes(input);
  if (!parsed.ok) {
    return { ok: false as const, message: parsed.message };
  }
  return { ok: true as const, base64: bytesToBase64(parsed.bytes), byteCount: parsed.bytes.length };
}

export default function HexToBase64Converter() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convert(input), [input]);

  function copy() {
    if (!result.ok) return;
    navigator.clipboard.writeText(result.base64);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Hex input</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} placeholder="48656c6c6f" />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ ${result.byteCount} byte${result.byteCount === 1 ? '' : 's'}` : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>Base64</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="output mono" style={{ wordBreak: 'break-all' }}>
            {result.base64}
          </div>
        </div>
      )}

      <div className="status-line status-neutral">
        The hex digits are parsed as raw bytes (two hex digits = one byte), then those bytes are
        Base64-encoded - the hex string&apos;s characters are never Base64-encoded directly as text.
      </div>
    </div>
  );
}
