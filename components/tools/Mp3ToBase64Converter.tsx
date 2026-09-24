'use client';

import { useRef, useState } from 'react';

type Mode = 'audioToBase64' | 'base64ToAudio';

/**
 * Audio-specific counterpart to Base64ImageConverter - that tool's file picker explicitly checks
 * `file.type.startsWith('image/')`, which rejects audio files like MP3 outright, and its preview
 * renders an <img>, which can't play sound. The underlying mechanism (FileReader -> data URI) is
 * identical; only the MIME check and the preview element differ, so this reuses that same
 * FileReader-based approach rather than a parallel Base64 implementation.
 */
export default function Mp3ToBase64Converter() {
  const [mode, setMode] = useState<Mode>('audioToBase64');
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
    if (!file.type.startsWith('audio/')) {
      setEncodeError('Selected file is not an audio file.');
      setDataUri('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // FileReader.readAsDataURL preserves the file's exact bytes - it never re-encodes or
      // re-samples the audio, unlike routing through a decode/re-encode pipeline (e.g. the Web
      // Audio API or a <canvas>-based approach some image tools use) which would risk altering it.
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
    if (trimmed.startsWith('data:audio/')) return trimmed;
    if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed)) {
      return `data:audio/mpeg;base64,${trimmed.replace(/\s/g, '')}`;
    }
    return null;
  }

  const previewUri = normalizeToDataUri(base64Input);

  function handleAudioError() {
    setDecodeError('This does not decode as valid audio - check that the base64 data or data URI is complete and correct.');
  }

  function handleAudioLoad() {
    setDecodeError(null);
  }

  return (
    <div>
      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'audioToBase64' ? 'var(--accent-dim)' : undefined,
            color: mode === 'audioToBase64' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('audioToBase64')}
        >
          MP3 → Base64
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'base64ToAudio' ? 'var(--accent-dim)' : undefined,
            color: mode === 'base64ToAudio' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('base64ToAudio')}
        >
          Base64 → MP3
        </button>
      </div>

      {mode === 'audioToBase64' ? (
        <div>
          <div className="control-row">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
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
              {dataUri || '// Choose an MP3 (or other audio) file to see its base64 data URI'}
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
                <audio src={dataUri} controls style={{ width: '100%', maxWidth: 400 }} />
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
              placeholder="Paste a base64 string or data:audio/... URI..."
            />
            <div className={`status-line ${decodeError ? 'status-invalid' : previewUri ? 'status-valid' : 'status-invalid'}`}>
              {decodeError
                ? `✗ ${decodeError}`
                : previewUri
                ? '✓ Ready to play below'
                : '✗ Paste a base64 string or data URI to preview.'}
            </div>
          </div>

          {previewUri && (
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-bar">
                <span>Preview</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <audio
                  src={previewUri}
                  controls
                  style={{ width: '100%', maxWidth: 400 }}
                  onError={handleAudioError}
                  onLoadedMetadata={handleAudioLoad}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Reads the file&apos;s exact bytes via the browser&apos;s FileReader API and encodes them as a
        base64 data URI - no re-encoding, resampling, or compression, so the decoded audio is
        byte-for-byte identical to the original file. Runs entirely client-side; the file never
        leaves your browser.
      </div>
    </div>
  );
}
