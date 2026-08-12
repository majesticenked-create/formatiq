'use client';

import { useMemo, useState } from 'react';

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzE2MjM5MDIyLCJleHAiOjE3MTYyNDI2MjJ9.dQw4w9WgXcQ-rAdditionalSignaturePadding';

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function decodeSegment(segment: string, name: string) {
  let decoded: string;
  try {
    decoded = base64UrlDecode(segment);
  } catch {
    return { ok: false as const, message: `Could not base64url-decode the ${name}.` };
  }

  try {
    const parsed = JSON.parse(decoded);
    return { ok: true as const, json: JSON.stringify(parsed, null, 2), raw: parsed };
  } catch {
    return { ok: false as const, message: `${name} did not decode to valid JSON.` };
  }
}

function formatTimestamp(value: unknown): string | null {
  if (typeof value !== 'number') return null;
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return null;
  return date.toUTCString();
}

function tryDecode(input: string) {
  const value = input.trim();

  if (!value) {
    return { ok: false as const, message: 'Paste a JWT to decode.' };
  }

  const segments = value.split('.');
  if (segments.length !== 3) {
    return {
      ok: false as const,
      message: `Expected 3 dot-separated segments (header.payload.signature), got ${segments.length}.`,
    };
  }

  const [headerSeg, payloadSeg] = segments;

  const header = decodeSegment(headerSeg, 'header');
  if (!header.ok) {
    return { ok: false as const, message: header.message };
  }

  const payload = decodeSegment(payloadSeg, 'payload');
  if (!payload.ok) {
    return { ok: false as const, message: payload.message };
  }

  const claims: { label: string; value: string }[] = [];
  if (payload.raw && typeof payload.raw === 'object') {
    const obj = payload.raw as Record<string, unknown>;
    const iat = formatTimestamp(obj.iat);
    const exp = formatTimestamp(obj.exp);
    if (iat) claims.push({ label: 'iat (issued at)', value: iat });
    if (exp) claims.push({ label: 'exp (expires)', value: exp });
  }

  return { ok: true as const, header: header.json, payload: payload.json, claims };
}

export default function JwtDecoder() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryDecode(input), [input]);

  function copyHeader() {
    if (result.ok) navigator.clipboard.writeText(result.header);
  }

  function copyPayload() {
    if (result.ok) navigator.clipboard.writeText(result.payload);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div
        className="status-line"
        style={{
          background: 'var(--status-invalid-bg, rgba(255,0,0,0.06))',
          border: '1px solid var(--accent-dim)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 12,
        }}
      >
        ⚠ This tool only decodes the token - it does not verify the signature. A decoded token could have
        been altered or forged; never treat a successful decode here as proof the token is authentic.
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>JWT</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste a JWT here..."
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid JWT structure' : `✗ ${result.message}`}
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Header</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyHeader} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.header : '// Fix the errors above to see the decoded header'}</div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Payload</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyPayload} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.payload : '// Fix the errors above to see the decoded payload'}</div>
        </div>
      </div>

      {result.ok && result.claims.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Timestamp claims</span>
          </div>
          <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
            {result.claims.map((c) => `${c.label}: ${c.value}`).join('\n')}
          </div>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Like the <a href="/tools/encoders-decoders/aes-encrypt-decrypt">AES Encrypt/Decrypt</a> and{' '}
        <a href="/tools/validators/iban-validator">IBAN Validator</a> tools, this runs entirely client-side - your
        token never touches a server.
      </div>
    </div>
  );
}
