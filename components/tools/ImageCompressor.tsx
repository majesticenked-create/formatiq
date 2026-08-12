'use client';

import { useState } from 'react';

interface ImageInfo {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressor() {
  const [original, setOriginal] = useState<ImageInfo | null>(null);
  const [compressed, setCompressed] = useState<ImageInfo | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return;
    }
    setError(null);
    setCompressed(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setOriginal({
          dataUrl: reader.result as string,
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
        });
      };
      img.onerror = () => setError('Could not load this image.');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function compress() {
    if (!original) return;
    setBusy(true);
    setError(null);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas is not supported in this browser.');
        setBusy(false);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          setBusy(false);
          if (!blob) {
            setError('Compression failed for this image.');
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            setCompressed({
              dataUrl: reader.result as string,
              width: img.width,
              height: img.height,
              size: blob.size,
              type: format,
            });
          };
          reader.readAsDataURL(blob);
        },
        format,
        quality
      );
    };
    img.onerror = () => {
      setError('Could not process this image.');
      setBusy(false);
    };
    img.src = original.dataUrl;
  }

  function download() {
    if (!compressed) return;
    const ext = format === 'image/jpeg' ? 'jpg' : 'webp';
    const a = document.createElement('a');
    a.href = compressed.dataUrl;
    a.download = `compressed.${ext}`;
    a.click();
  }

  const reduction =
    original && compressed ? Math.round((1 - compressed.size / original.size) * 100) : null;

  return (
    <div>
      <div className="control-row">
        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="mono" />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Format:
        </label>
        <button
          className={`icon-btn ${format === 'image/jpeg' ? 'is-active' : ''}`}
          onClick={() => setFormat('image/jpeg')}
        >
          JPG
        </button>
        <button
          className={`icon-btn ${format === 'image/webp' ? 'is-active' : ''}`}
          onClick={() => setFormat('image/webp')}
        >
          WebP
        </button>
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Quality: {Math.round(quality * 100)}%
        </label>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
        />
        <button className="icon-btn" onClick={compress} disabled={!original || busy}>
          {busy ? 'Compressing...' : 'Compress'}
        </button>
      </div>

      {error && <div className="status-line status-invalid">✗ {error}</div>}

      {original && (
        <div className="panels" style={{ marginTop: 16 }}>
          <div className="panel">
            <div className="panel-bar">
              <span>Original - {formatBytes(original.size)}</span>
            </div>
            <div style={{ padding: 12, textAlign: 'center' }}>
              <img
                src={original.dataUrl}
                alt="Original"
                style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 4 }}
              />
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                {original.width} × {original.height}
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-bar">
              <span>Compressed{compressed ? ` - ${formatBytes(compressed.size)}` : ''}</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={download} disabled={!compressed}>
                  Download
                </button>
              </div>
            </div>
            <div style={{ padding: 12, textAlign: 'center' }}>
              {compressed ? (
                <>
                  <img
                    src={compressed.dataUrl}
                    alt="Compressed"
                    style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 4 }}
                  />
                  <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    {compressed.width} × {compressed.height}
                  </div>
                </>
              ) : (
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '40px 0' }}>
                  Click "Compress" to see the result
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reduction !== null && (
        <div className={`status-line ${reduction >= 0 ? 'status-valid' : 'status-invalid'}`}>
          {reduction >= 0
            ? `✓ ${reduction}% smaller (${formatBytes(original!.size)} → ${formatBytes(compressed!.size)})`
            : `File got ${Math.abs(reduction)}% larger - try a lower quality or the other format.`}
        </div>
      )}
    </div>
  );
}
