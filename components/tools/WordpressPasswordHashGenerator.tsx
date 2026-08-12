'use client';

import { useState } from 'react';

const ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DEFAULT_COUNT_LOG2 = 8;

/**
 * Minimal, self-contained MD5 implementation (RFC 1321) returning raw bytes.
 * phpass repeatedly MD5-hashes binary strings, so raw output is needed
 * rather than the hex string most MD5 tools expose (see hash-generator.tsx
 * for the hex-output sibling of this same algorithm).
 */
function md5Bytes(input: number[]): number[] {
  function rotl(x: number, c: number) {
    return (x << c) | (x >>> (32 - c));
  }

  const K = new Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32);
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
    20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6,
    10, 15, 21,
  ];

  const bytes = [...input];
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

  const out: number[] = [];
  for (const word of [a0, b0, c0, d0]) {
    for (let i = 0; i < 4; i++) out.push((word >>> (i * 8)) & 0xff);
  }
  return out;
}

// phpass's custom base64-like alphabet encoding, per the portable hash
// framework's crypt_private/encode64 — a different bit order than
// standard base64, so it can't be produced with btoa().
function encode64(input: number[]): string {
  let output = '';
  let i = 0;
  const count = input.length;
  while (i < count) {
    let value = input[i++];
    output += ITOA64[value & 0x3f];
    if (i < count) value |= input[i] << 8;
    output += ITOA64[(value >> 6) & 0x3f];
    if (i++ >= count) break;
    if (i < count) value |= input[i] << 16;
    output += ITOA64[(value >> 12) & 0x3f];
    if (i++ >= count) break;
    output += ITOA64[(value >> 18) & 0x3f];
  }
  return output;
}

function randomSaltBytes(): number[] {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr);
}

function phpassHash(password: string, saltBytes: number[], countLog2 = DEFAULT_COUNT_LOG2): string {
  const passwordBytes = Array.from(new TextEncoder().encode(password));
  const countChar = ITOA64[Math.min(countLog2 + 5, 30)];
  const prefix = '$P$' + countChar + encode64(saltBytes);

  let count = 1 << countLog2;
  let hash = md5Bytes([...saltBytes, ...passwordBytes]);
  do {
    hash = md5Bytes([...hash, ...passwordBytes]);
  } while (--count);

  return prefix + encode64(hash);
}

function verifyPhpassHash(password: string, storedHash: string): boolean {
  if (!/^\$P\$/.test(storedHash) && !/^\$H\$/.test(storedHash)) return false;
  const countChar = storedHash[3];
  const countLog2 = ITOA64.indexOf(countChar) - 5;
  if (countLog2 < 4 || countLog2 > 31) return false;
  const saltChars = storedHash.slice(4, 12);
  const saltBytes = decode64(saltChars, 8);
  const recomputed = phpassHash(password, saltBytes, countLog2);
  return recomputed === storedHash;
}

function decode64(str: string, count: number): number[] {
  const out: number[] = [];
  let i = 0;
  let si = 0;
  while (i < count) {
    let value = ITOA64.indexOf(str[si++]) | (ITOA64.indexOf(str[si++]) << 6);
    out.push(value & 0xff);
    i++;
    if (i >= count) break;
    value = (value >> 8) | (ITOA64.indexOf(str[si++]) << 4);
    out.push(value & 0xff);
    i++;
  }
  return out.slice(0, count);
}

export default function WordpressPasswordHashGenerator() {
  const [password, setPassword] = useState('correct horse battery staple');
  const [hash, setHash] = useState<string>('');
  const [copied, setCopied] = useState(false);

  function generate() {
    if (!password) return;
    setHash(phpassHash(password, randomSaltBytes()));
  }

  function copy() {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const verified = hash ? verifyPhpassHash(password, hash) : null;

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Plaintext password</span>
        </div>
        <textarea
          className="mono"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setHash('');
          }}
          spellCheck={false}
          style={{ minHeight: 44 }}
        />
      </div>

      <div className="control-row">
        <button className="btn btn-primary" onClick={generate} disabled={!password}>
          Generate hash
        </button>
        <button className="icon-btn" onClick={copy} disabled={!hash}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {hash && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>WordPress-compatible hash ($P$)</span>
          </div>
          <div className="output mono">{hash}</div>
          <div className={`status-line ${verified ? 'status-valid' : 'status-invalid'}`}>
            {verified ? '✓ Self-verified: re-checking the password against this hash succeeds' : '✗ Verification failed'}
          </div>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        For local dev/testing convenience only - e.g. manually inserting a test user row into a dev database. Not
        a substitute for WordPress's own registration or password-reset flow in production, and newer WordPress
        versions default to bcrypt for new passwords rather than this legacy phpass format.
      </div>
    </div>
  );
}
