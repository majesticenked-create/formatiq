'use client';

import { useState } from 'react';

type Mode = 'encrypt' | 'decrypt';

const PBKDF2_ITERATIONS = 250000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptText(text: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, new TextEncoder().encode(text))
  );
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(ciphertext, salt.length + iv.length);
  return bytesToBase64(combined);
}

async function decryptText(payload: string, passphrase: string): Promise<string> {
  const combined = base64ToBytes(payload);
  if (combined.length < SALT_LENGTH + IV_LENGTH + 1) {
    throw new Error('This doesn’t look like a value produced by this tool - too short to contain salt, IV, and ciphertext.');
  }
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);
  const key = await deriveKey(passphrase, salt);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );
  return new TextDecoder('utf-8', { fatal: true }).decode(plaintext);
}

export default function AesEncryptDecrypt() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [text, setText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setText('');
    setOutput('');
    setError(null);
  }

  async function run() {
    setError(null);
    setOutput('');
    if (!text.trim()) {
      setError(mode === 'encrypt' ? 'Enter text to encrypt.' : 'Enter a value to decrypt.');
      return;
    }
    if (!passphrase) {
      setError('Enter a passphrase.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'encrypt') {
        setOutput(await encryptText(text, passphrase));
      } else {
        setOutput(await decryptText(text.trim(), passphrase));
      }
    } catch (err) {
      setError(
        mode === 'encrypt'
          ? 'Could not encrypt this input.'
          : 'Could not decrypt - the passphrase may be wrong, or this isn’t a valid encrypted value.'
      );
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn ${mode === 'encrypt' ? 'is-active' : ''}`} onClick={() => switchMode('encrypt')}>
          Encrypt
        </button>
        <button className={`icon-btn ${mode === 'decrypt' ? 'is-active' : ''}`} onClick={() => switchMode('decrypt')}>
          Decrypt
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-bar">
          <span>{mode === 'encrypt' ? 'Text to encrypt' : 'Encrypted value (base64)'}</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setText('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Passphrase:
        </label>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="mono"
          style={{
            flex: 1,
            minWidth: 180,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <button className="icon-btn" onClick={run} disabled={busy}>
          {busy ? 'Working...' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
      </div>

      {error && <div className="status-line status-invalid">✗ {error}</div>}

      {output && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>{mode === 'encrypt' ? 'Encrypted output (base64)' : 'Decrypted text'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="output mono">{output}</div>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        For casual, convenience use only - sharing a short secret with someone who knows the passphrase. This is
        not a substitute for proper key management, secret rotation, or audited cryptographic tooling in a
        production security context.
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 8 }}>
        For inspecting tokens rather than encrypting data, see the{' '}
        <a href="/tools/encoders-decoders/jwt-decoder">JWT Decoder</a> - also fully client-side.
      </div>
    </div>
  );
}
