'use client';

import { useEffect, useRef, useState } from 'react';

const PERIOD_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const SAMPLE_SECRET = 'JBSWY3DPEHPK3PXP';

function base32Decode(input: string): Uint8Array | null {
  const trimmed = input.trim().replace(/\s+/g, '').replace(/=+$/, '').toUpperCase();
  if (!trimmed) return null;
  if (!/^[A-Z2-7]+$/.test(trimmed)) return null;

  let bits = '';
  for (const ch of trimmed) {
    const value = BASE32_ALPHABET.indexOf(ch);
    bits += value.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

function counterToBytes(counter: number): Uint8Array {
  const buf = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = c % 256;
    c = Math.floor(c / 256);
  }
  return buf;
}

async function hmacSha1(keyBytes: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, message as BufferSource);
  return new Uint8Array(signature);
}

function dynamicTruncate(hmac: Uint8Array, digits: number): string {
  const offset = hmac[hmac.length - 1] & 0xf;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return (binCode % 10 ** digits).toString().padStart(digits, '0');
}

async function generateTotp(secretBase32: string, timeWindow: number): Promise<{ ok: true; code: string } | { ok: false; message: string }> {
  const keyBytes = base32Decode(secretBase32);
  if (!keyBytes || keyBytes.length === 0) {
    return { ok: false, message: 'Enter a valid Base32 secret (letters A-Z and digits 2-7 only).' };
  }
  const hmac = await hmacSha1(keyBytes, counterToBytes(timeWindow));
  return { ok: true, code: dynamicTruncate(hmac, DIGITS) };
}

export default function TotpGenerator() {
  const [secret, setSecret] = useState(SAMPLE_SECRET);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(PERIOD_SECONDS);
  const lastWindowRef = useRef<number | null>(null);
  const lastSecretRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function tick() {
      const epochSeconds = Math.floor(Date.now() / 1000);
      const timeWindow = Math.floor(epochSeconds / PERIOD_SECONDS);
      setSecondsRemaining(PERIOD_SECONDS - (epochSeconds % PERIOD_SECONDS));

      if (timeWindow === lastWindowRef.current && secret === lastSecretRef.current) return;
      lastWindowRef.current = timeWindow;
      lastSecretRef.current = secret;

      generateTotp(secret, timeWindow).then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setCode(result.code);
          setError(null);
        } else {
          setCode(null);
          setError(result.message);
        }
      });
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [secret]);

  const formattedCode = code ? `${code.slice(0, 3)} ${code.slice(3)}` : null;
  const progressPercent = (secondsRemaining / PERIOD_SECONDS) * 100;

  function copyCode() {
    if (code) navigator.clipboard.writeText(code);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setSecret(SAMPLE_SECRET)}>
          Load sample secret
        </button>
        <button className="icon-btn" onClick={() => setSecret('')}>
          Clear
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Base32 secret key</span>
        </div>
        <textarea
          className="mono"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          spellCheck={false}
          placeholder="e.g. JBSWY3DPEHPK3PXP"
          style={{ minHeight: 64 }}
        />
        <div className={`status-line ${code ? 'status-valid' : 'status-invalid'}`}>
          {code ? '✓ Generating codes' : `✗ ${error ?? 'Enter a Base32 secret.'}`}
        </div>
      </div>

      {code && (
        <div className="panel">
          <div className="panel-bar">
            <span>Current TOTP code</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyCode}>
                Copy
              </button>
            </div>
          </div>
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div
              className="mono"
              style={{ fontSize: 40, fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-display)' }}
            >
              {formattedCode}
            </div>
            <div style={{ marginTop: 16, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'var(--accent-dim)',
                  transition: 'width 1s linear',
                }}
              />
            </div>
            <div className="status-line status-neutral" style={{ marginTop: 8, textAlign: 'center' }}>
              Refreshes in {secondsRemaining}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
