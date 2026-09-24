'use client';

import { useMemo, useState } from 'react';
import { stripDataUriPrefix } from '@/lib/tools/base64-utils';

const MIME_OPTIONS = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp', 'font/woff2'];

const SAMPLE =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function isValidBase64Payload(value: string): boolean {
  return value.length > 0 && value.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(value);
}

export default function Base64ToCss() {
  const [input, setInput] = useState(SAMPLE);
  const [mime, setMime] = useState(MIME_OPTIONS[0]);

  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { ok: false as const, message: 'Paste a Base64 string or data URI.' };

    const dataUriMatch = trimmed.match(/^data:([^;,]+);base64,(.*)$/s);
    const payload = (dataUriMatch ? dataUriMatch[2] : trimmed).replace(/\s/g, '');
    const resolvedMime = dataUriMatch ? dataUriMatch[1] : mime;

    if (!isValidBase64Payload(payload)) {
      return { ok: false as const, message: 'Not valid Base64 - check the alphabet and padding.' };
    }

    const dataUri = `data:${resolvedMime};base64,${payload}`;
    return {
      ok: true as const,
      dataUri,
      cssValue: `url("${dataUri}")`,
      backgroundDeclaration: `background-image: url("${dataUri}");`,
    };
  }, [input, mime]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <div className="control-row">
        <span>MIME type (used only when input is bare Base64, not a data URI):</span>
        <select className="mono" value={mime} onChange={(e) => setMime(e.target.value)}>
          {MIME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Base64 string or data URI</span>
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
          placeholder="Paste a base64 string or data:...;base64,... URI..."
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ CSS value below' : `✗ ${'message' in result ? result.message : 'Invalid input'}`}
        </div>
      </div>

      {result.ok && (
        <>
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-bar">
              <span>CSS url() value</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={() => copy(result.cssValue)}>
                  Copy
                </button>
              </div>
            </div>
            <div className="output mono" style={{ wordBreak: 'break-all' }}>
              {result.cssValue}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-bar">
              <span>Full background-image declaration</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={() => copy(result.backgroundDeclaration)}>
                  Copy
                </button>
              </div>
            </div>
            <div className="output mono" style={{ wordBreak: 'break-all' }}>
              {result.backgroundDeclaration}
            </div>
          </div>
        </>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        This tool only constructs the CSS reference from the Base64 payload you provide - it does not
        validate that the underlying bytes are a real, well-formed asset of the chosen MIME type. If
        you paste a full data URI, its own embedded MIME type is used instead of the selector above.
        Runs entirely client-side; nothing you paste is ever uploaded.
      </div>
    </div>
  );
}
