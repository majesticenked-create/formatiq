'use client';

import { useMemo, useState } from 'react';
import { hexToUtf8, textToHex } from '@/lib/tools/hex-utf8-utils';

type Mode = 'hexToText' | 'textToHex';

export default function HexToUtf8Converter() {
  const [mode, setMode] = useState<Mode>('hexToText');
  const [input, setInput] = useState('48656C6C6F');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === 'textToHex') {
      if (!input) return { ok: false as const, message: 'Enter text to encode.' };
      return { ok: true as const, output: textToHex(input), byteCount: textToHex(input).length / 2 };
    }
    const decoded = hexToUtf8(input);
    if (!decoded.ok) return { ok: false as const, message: decoded.message };
    return { ok: true as const, output: decoded.text, byteCount: decoded.byteCount };
  }, [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'hexToText' ? '48656C6C6F' : 'Hello');
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
        <button className={`icon-btn ${mode === 'hexToText' ? 'is-active' : ''}`} onClick={() => switchMode('hexToText')}>
          Hex → UTF-8 text
        </button>
        <button className={`icon-btn ${mode === 'textToHex' ? 'is-active' : ''}`} onClick={() => switchMode('textToHex')}>
          Text → Hex
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{mode === 'hexToText' ? 'Hex input' : 'Text input'}</span>
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
            <span>{mode === 'hexToText' ? 'Decoded text' : 'Hex bytes'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="output mono" style={{ wordBreak: 'break-all' }}>
            {result.output}
          </div>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Hex digits are read two at a time as raw bytes, then decoded as UTF-8 - not one big
        number, so this handles multi-byte characters correctly (e.g. &quot;E282AC&quot; decodes to the
        euro sign &quot;€&quot;, a single 3-byte character). Spaces and a leading &quot;0x&quot; are stripped
        automatically, but a contiguous hex string like &quot;48656C6C6F&quot; works too. Odd-length hex
        is rejected, since a byte is always two hex digits.
      </div>
    </div>
  );
}
