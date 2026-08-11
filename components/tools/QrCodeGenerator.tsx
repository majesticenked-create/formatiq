'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

type Size = 'small' | 'medium' | 'large';

const SIZE_PX: Record<Size, number> = {
  small: 160,
  medium: 256,
  large: 384,
};

export default function QrCodeGenerator() {
  const [input, setInput] = useState('https://formatiq.com');
  const [size, setSize] = useState<Size>('medium');
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!input.trim()) {
      setError('Enter some text or a URL to generate a QR code.');
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    QRCode.toCanvas(canvas, input, { width: SIZE_PX[size], margin: 2 }, (err) => {
      setError(err ? err.message : null);
    });
  }, [input, size]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas || error) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput('https://formatiq.com')}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Size:
        </label>
        {(['small', 'medium', 'large'] as Size[]).map((s) => (
          <button
            key={s}
            className="icon-btn"
            style={{
              borderColor: size === s ? 'var(--accent-dim)' : undefined,
              color: size === s ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => setSize(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button className="icon-btn" onClick={downloadPng} disabled={!!error}>
          Download as PNG
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Text or URL</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Enter text or a URL to encode..."
        />
        <div className={`status-line ${error ? 'status-invalid' : 'status-valid'}`}>
          {error ? `✗ ${error}` : '✓ QR code generated below'}
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>QR code</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={input ? `QR code encoding: ${input.slice(0, 80)}` : 'QR code preview'}
            style={{ maxWidth: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
