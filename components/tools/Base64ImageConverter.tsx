'use client';

import { useRef, useState } from 'react';

type Mode = 'imageToBase64' | 'base64ToImage';

export default function Base64ImageConverter() {
  const [mode, setMode] = useState<Mode>('imageToBase64');
  const [dataUri, setDataUri] = useState('');
  const [fileName, setFileName] = useState('');
  const [encodeError, setEncodeError] = useState<string | null>(null);

  const [base64Input, setBase64Input] = useState('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function switchMode(next: Mode) {
    setMode(next);
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setEncodeError('Selected file is not an image.');
      setDataUri('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDataUri(reader.result as string);
      setFileName(file.name);
      setEncodeError(null);
    };
    reader.onerror = () => {
      setEncodeError('Could not read this file.');
      setDataUri('');
    };
    reader.readAsDataURL(file);
  }

  function copyDataUri() {
    if (dataUri) navigator.clipboard.writeText(dataUri);
  }

  function normalizeToDataUri(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('data:image/')) return trimmed;
    if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed)) {
      return `data:image/png;base64,${trimmed.replace(/\s/g, '')}`;
    }
    return null;
  }

  const previewUri = normalizeToDataUri(base64Input);

  function handleImageError() {
    setDecodeError('This does not decode as a valid image - check that the base64 data or data URI is complete and correct.');
  }

  function handleImageLoad() {
    setDecodeError(null);
  }

  return (
    <div>
      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'imageToBase64' ? 'var(--accent-dim)' : undefined,
            color: mode === 'imageToBase64' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('imageToBase64')}
        >
          Image → Base64
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'base64ToImage' ? 'var(--accent-dim)' : undefined,
            color: mode === 'base64ToImage' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('base64ToImage')}
        >
          Base64 → Image
        </button>
      </div>

      {mode === 'imageToBase64' ? (
        <div>
          <div className="control-row">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="mono"
            />
          </div>

          <div className="panel">
            <div className="panel-bar">
              <span>{fileName ? `Base64 data URI (${fileName})` : 'Base64 data URI'}</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={copyDataUri} disabled={!dataUri}>
                  Copy
                </button>
              </div>
            </div>
            <div className="output mono" style={{ wordBreak: 'break-all' }}>
              {dataUri || '// Choose an image file to see its base64 data URI'}
            </div>
            <div className={`status-line ${encodeError ? 'status-invalid' : dataUri ? 'status-valid' : 'status-neutral'}`}>
              {encodeError ? `✗ ${encodeError}` : dataUri ? `✓ ${dataUri.length} characters` : ' '}
            </div>
          </div>

          {dataUri && (
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-bar">
                <span>Preview</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dataUri} alt="Preview of the uploaded image, re-rendered from its Base64 encoding" style={{ maxWidth: '100%', maxHeight: 300 }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="panel">
            <div className="panel-bar">
              <span>Base64 string or data URI</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={() => setBase64Input('')}>
                  Clear
                </button>
              </div>
            </div>
            <textarea
              className="mono"
              value={base64Input}
              onChange={(e) => {
                setBase64Input(e.target.value);
                setDecodeError(null);
              }}
              spellCheck={false}
              placeholder="Paste a base64 string or data:image/... URI..."
            />
            <div className={`status-line ${decodeError ? 'status-invalid' : previewUri ? 'status-valid' : 'status-invalid'}`}>
              {decodeError
                ? `✗ ${decodeError}`
                : previewUri
                ? '✓ Rendering preview below'
                : '✗ Paste a base64 string or data URI to preview.'}
            </div>
          </div>

          {previewUri && (
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-bar">
                <span>Preview</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUri}
                  alt="Preview of the image decoded from the pasted Base64 string or data URI"
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
