'use client';

import { useState } from 'react';

type Mode = 'compress' | 'decompress';

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

async function gzipCompress(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function gzipDecompress(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes.slice().buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return new TextDecoder('utf-8', { fatal: true }).decode(buf);
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(2)} KB`;
}

const isSupported = typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

export default function TextCompressDecompress() {
  const [mode, setMode] = useState<Mode>('compress');
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog. '.repeat(10));
  const [output, setOutput] = useState('');
  const [inputSize, setInputSize] = useState<number | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'compress' ? 'The quick brown fox jumps over the lazy dog. '.repeat(10) : '');
    setOutput('');
    setInputSize(null);
    setOutputSize(null);
    setError(null);
  }

  async function run() {
    if (!input.trim()) {
      setError(mode === 'compress' ? 'Enter text to compress.' : 'Enter a base64 gzip string to decompress.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === 'compress') {
        const originalBytes = new TextEncoder().encode(input).length;
        const compressed = await gzipCompress(input);
        setInputSize(originalBytes);
        setOutputSize(compressed.length);
        setOutput(bytesToBase64(compressed));
      } else {
        const bytes = base64ToBytes(input.trim());
        setInputSize(bytes.length);
        const text = await gzipDecompress(bytes);
        setOutputSize(new TextEncoder().encode(text).length);
        setOutput(text);
      }
    } catch {
      setError(
        mode === 'compress'
          ? 'Could not compress this input.'
          : 'Could not decompress this input — check that it\'s a valid base64-encoded gzip string.'
      );
      setOutput('');
      setOutputSize(null);
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

  if (!isSupported) {
    return (
      <div className="status-line status-invalid">
        ✗ This browser doesn&apos;t support the CompressionStream/DecompressionStream APIs required for this tool.
      </div>
    );
  }

  const reduction =
    inputSize !== null && outputSize !== null && mode === 'compress'
      ? Math.round((1 - outputSize / inputSize) * 100)
      : null;

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn ${mode === 'compress' ? 'is-active' : ''}`} onClick={() => switchMode('compress')}>
          Compress
        </button>
        <button className={`icon-btn ${mode === 'decompress' ? 'is-active' : ''}`} onClick={() => switchMode('decompress')}>
          Decompress
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{mode === 'compress' ? 'Text input' : 'Base64 gzip input'}</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
      </div>

      <div className="control-row">
        <button className="icon-btn" onClick={run} disabled={busy}>
          {busy ? 'Working...' : mode === 'compress' ? 'Compress' : 'Decompress'}
        </button>
      </div>

      {error && <div className="status-line status-invalid">✗ {error}</div>}

      {output && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>{mode === 'compress' ? 'Compressed (base64)' : 'Decompressed text'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="output mono">{output}</div>
        </div>
      )}

      {inputSize !== null && outputSize !== null && (
        <div className={`status-line ${reduction === null || reduction >= 0 ? 'status-valid' : 'status-invalid'}`}>
          {mode === 'compress'
            ? `✓ ${formatBytes(inputSize)} → ${formatBytes(outputSize)}${reduction !== null ? ` (${reduction}% smaller)` : ''}`
            : `✓ ${formatBytes(inputSize)} → ${formatBytes(outputSize)}`}
        </div>
      )}
    </div>
  );
}
