'use client';

import { useEffect, useRef, useState } from 'react';

const SIZES = [16, 32, 180];

function drawFromImage(canvas: HTMLCanvasElement, img: HTMLImageElement, size: number) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
}

function drawFromText(canvas: HTMLCanvasElement, text: string, bg: string, fg: string, size: number) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(size * 0.5)}px system-ui, -apple-system, Helvetica, Arial, sans-serif`;
  ctx.fillText(text.slice(0, 2).toUpperCase(), size / 2, size / 2 + size * 0.03);
}

export default function FaviconGenerator() {
  const [mode, setMode] = useState<'image' | 'text'>('text');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [initials, setInitials] = useState('FQ');
  const [bgColor, setBgColor] = useState('#0E1116');
  const [fgColor, setFgColor] = useState('#F2B705');
  const [error, setError] = useState<string | null>(null);

  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setMode('image');
        setError(null);
      };
      img.onerror = () => setError('Could not load this image.');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    for (const size of SIZES) {
      const canvas = canvasRefs.current[size];
      if (!canvas) continue;
      if (mode === 'image' && image) {
        drawFromImage(canvas, image, size);
      } else {
        drawFromText(canvas, initials || 'FQ', bgColor, fgColor, size);
      }
    }
  }, [mode, image, initials, bgColor, fgColor]);

  function download(size: number) {
    const canvas = canvasRefs.current[size];
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `favicon-${size}x${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div>
      <div className="control-row">
        <button
          className={`icon-btn${mode === 'text' ? ' is-active' : ''}`}
          onClick={() => setMode('text')}
        >
          Generate from text
        </button>
        <button
          className={`icon-btn${mode === 'image' ? ' is-active' : ''}`}
          onClick={() => setMode('image')}
          disabled={!image}
        >
          Use uploaded image
        </button>
      </div>

      <div className="control-row">
        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="mono" />
      </div>

      {mode === 'text' && (
        <div className="control-row">
          <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Initials:
          </label>
          <input
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            maxLength={2}
            className="mono"
            style={{
              width: 60,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text-primary)',
              padding: '6px 8px',
            }}
          />
          <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Background:
          </label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Text:
          </label>
          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
        </div>
      )}

      {error && <div className="status-line status-invalid">✗ {error}</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}
      >
        {SIZES.map((size) => (
          <div className="panel" key={size}>
            <div className="panel-bar">
              <span>
                {size}×{size}
              </span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={() => download(size)}>
                  Download
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 100 }}>
              <canvas
                ref={(el) => {
                  canvasRefs.current[size] = el;
                }}
                style={{
                  width: Math.min(size, 96),
                  height: Math.min(size, 96),
                  imageRendering: size <= 32 ? 'pixelated' : 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
