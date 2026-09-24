'use client';

import { useEffect, useState } from 'react';

type HmacAlgo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
type OutputFormat = 'hex' | 'base64';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function computeHmac(algo: HmacAlgo, secret: string, message: string): Promise<Uint8Array> {
  const keyData = new TextEncoder().encode(secret);
  const messageData = new TextEncoder().encode(message);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: algo },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return new Uint8Array(signature);
}

export default function HmacGenerator() {
  const [secret, setSecret] = useState('key');
  const [message, setMessage] = useState('The quick brown fox jumps over the lazy dog');
  const [algo, setAlgo] = useState<HmacAlgo>('SHA-256');
  const [format, setFormat] = useState<OutputFormat>('hex');
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!secret) {
      setResult(null);
      setStatus('idle');
      return;
    }

    setStatus('pending');

    computeHmac(algo, secret, message)
      .then((bytes) => {
        if (cancelled) return;
        setResult(format === 'hex' ? bytesToHex(bytes) : bytesToBase64(bytes));
        setStatus('done');
      })
      .catch(() => {
        if (cancelled) return;
        setResult(null);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [secret, message, algo, format]);

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-bar">
          <span>Secret key</span>
        </div>
        <input
          type="text"
          className="mono"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          spellCheck={false}
          style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
        />
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-bar">
          <span>Message</span>
        </div>
        <textarea
          className="mono"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Algorithm:
        </label>
        {(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as HmacAlgo[]).map((a) => (
          <button
            key={a}
            className={`icon-btn${algo === a ? ' is-active' : ''}`}
            onClick={() => setAlgo(a)}
          >
            {a === 'SHA-1' ? 'SHA-1 (legacy)' : a}
          </button>
        ))}
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Output:
        </label>
        {(['hex', 'base64'] as OutputFormat[]).map((f) => (
          <button
            key={f}
            className={`icon-btn${format === f ? ' is-active' : ''}`}
            onClick={() => setFormat(f)}
          >
            {f === 'hex' ? 'Hex' : 'Base64'}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="panel-bar">
          <span>HMAC-{algo}</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copy} disabled={!result}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px', wordBreak: 'break-all' }}>
          {status === 'pending' ? 'Computing…' : result ?? ''}
        </div>
        <div className={`status-line ${status === 'done' ? 'status-valid' : status === 'error' ? 'status-invalid' : 'status-neutral'}`}>
          {status === 'done' && '✓ Computed with crypto.subtle.sign - the secret and message never leave your browser.'}
          {status === 'error' && '✗ Could not compute HMAC for this input.'}
          {status === 'idle' && 'Enter a secret key to compute an HMAC.'}
          {status === 'pending' && 'Computing…'}
        </div>
      </div>

      <p className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
        HMAC (Hash-based Message Authentication Code) proves a message wasn&apos;t altered and came from
        someone holding the secret key - it is an integrity/authentication check, not encryption, and it
        does not hide the message contents.
      </p>
    </div>
  );
}
