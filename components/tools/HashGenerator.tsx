'use client';

import { useEffect, useState } from 'react';

const SAMPLE = 'Formatiq makes dev tools fast.';

/**
 * Minimal, self-contained MD5 implementation (RFC 1321). crypto.subtle
 * doesn't support MD5, so this fills the one gap; SHA-1/256/512 below use
 * the native Web Crypto API.
 */
function md5(input: string): string {
  function rotl(x: number, c: number) {
    return (x << c) | (x >>> (32 - c));
  }
  function toHex(n: number) {
    let s = '';
    for (let i = 0; i < 4; i++) {
      s += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return s;
  }

  const K = new Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32);
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
    20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6,
    10, 15, 21,
  ];

  const bytes = Array.from(new TextEncoder().encode(input));
  const originalBitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push((originalBitLen / 2 ** (8 * i)) & 0xff);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 64) {
    const M = new Array(16);
    for (let i = 0; i < 16; i++) {
      M[i] =
        bytes[chunkStart + i * 4] |
        (bytes[chunkStart + i * 4 + 1] << 8) |
        (bytes[chunkStart + i * 4 + 2] << 16) |
        (bytes[chunkStart + i * 4 + 3] << 24);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, S[i])) | 0;
    }

    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  return [a0, b0, c0, d0].map(toHex).join('');
}

async function sha(algo: 'SHA-1' | 'SHA-256' | 'SHA-512', input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface Hashes {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

function HashRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="panel" style={{ marginBottom: 8 }}>
      <div className="panel-bar">
        <span>{label}</span>
        <div className="panel-actions">
          <button className="icon-btn" onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px', wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  );
}

export default function HashGenerator() {
  const [input, setInput] = useState(SAMPLE);
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!input) {
      setHashes(null);
      setError('Enter some text to hash.');
      return;
    }

    async function run() {
      try {
        const [sha1, sha256, sha512] = await Promise.all([
          sha('SHA-1', input),
          sha('SHA-256', input),
          sha('SHA-512', input),
        ]);
        if (cancelled) return;
        setHashes({ md5: md5(input), sha1, sha256, sha512 });
        setError(null);
      } catch {
        if (cancelled) return;
        setError('Could not compute hashes for this input.');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [input]);

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

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Input text</span>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        <div className={`status-line ${hashes ? 'status-valid' : 'status-invalid'}`}>
          {hashes ? '✓ Hashes generated below' : `✗ ${error}`}
        </div>
      </div>

      {hashes && (
        <div>
          <HashRow label="MD5" value={hashes.md5} />
          <HashRow label="SHA-1" value={hashes.sha1} />
          <HashRow label="SHA-256" value={hashes.sha256} />
          <HashRow label="SHA-512" value={hashes.sha512} />
        </div>
      )}
    </div>
  );
}
