'use client';

import { useEffect, useMemo, useState } from 'react';

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

type Source = 'text' | 'file';

export default function Crc32Checksum() {
  const [source, setSource] = useState<Source>('text');
  const [text, setText] = useState('Formatiq');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (source === 'text') {
      setFileName(null);
      setFileBytes(null);
      setError(null);
    }
  }, [source]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File is larger than 5 MB - pick a smaller file for in-browser checksumming.');
      setFileBytes(null);
      setFileName(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileBytes(new Uint8Array(reader.result as ArrayBuffer));
      setFileName(file.name);
      setError(null);
    };
    reader.onerror = () => setError('Could not read this file.');
    reader.readAsArrayBuffer(file);
  }

  const checksum = useMemo(() => {
    if (source === 'text') {
      if (!text) return null;
      return crc32(new TextEncoder().encode(text));
    }
    if (!fileBytes) return null;
    return crc32(fileBytes);
  }, [source, text, fileBytes]);

  const hex = checksum !== null ? checksum.toString(16).padStart(8, '0').toUpperCase() : null;

  function copy() {
    if (hex) navigator.clipboard.writeText(hex);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn ${source === 'text' ? 'is-active' : ''}`} onClick={() => setSource('text')}>
          Text
        </button>
        <button className={`icon-btn ${source === 'file' ? 'is-active' : ''}`} onClick={() => setSource('file')}>
          File
        </button>
      </div>

      {source === 'text' ? (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-bar">
            <span>Text input</span>
          </div>
          <textarea className="mono" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </div>
      ) : (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-bar">
            <span>File input (max 5 MB)</span>
          </div>
          <div style={{ padding: 12 }}>
            <input type="file" onChange={(e) => handleFile(e.target.files?.[0])} className="mono" />
            {fileName && (
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                {fileName} - {fileBytes?.length.toLocaleString()} bytes
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div className="status-line status-invalid">✗ {error}</div>}

      <div className="panel">
        <div className="panel-bar">
          <span>CRC32 checksum</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copy} disabled={!hex}>
              Copy
            </button>
          </div>
        </div>
        <div className="output mono" style={{ minHeight: 'auto', padding: '10px 12px' }}>
          {hex ?? '- enter text or choose a file above'}
        </div>
      </div>
    </div>
  );
}
