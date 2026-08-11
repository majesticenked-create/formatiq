'use client';

import { useEffect, useState } from 'react';

// Ramp goes from sparsest (space, for bright pixels) to densest (@, for dark
// pixels) — the classic brightness-to-character mapping used by ASCII-art
// converters. Monochrome only: color ASCII art needs per-character color
// styling (e.g. individually colored <span> runs), which is a meaningfully
// bigger scope than a plain-text output block — monochrome is a real,
// complete tool on its own and keeps the output copy-pasteable as plain text.
const RAMP = ' .:-=+*#%@';

// Monospace character cells are taller than they are wide, so sampling at a
// 1:1 pixel aspect ratio would render vertically stretched — this factor
// compensates by sampling fewer rows than a naive width-based aspect would give.
const CHAR_ASPECT_CORRECTION = 0.55;

const MIN_WIDTH = 20;
const MAX_WIDTH = 300;
const DEFAULT_WIDTH = 100;

function imageToAscii(img: HTMLImageElement, outputWidth: number): string {
  const outputHeight = Math.max(1, Math.round((img.height / img.width) * outputWidth * CHAR_ASPECT_CORRECTION));

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
  const { data } = ctx.getImageData(0, 0, outputWidth, outputHeight);

  let output = '';
  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      const i = (y * outputWidth + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3] / 255;
      // Blend transparent pixels toward white so a transparent PNG background
      // renders as blank space rather than as the darkest character.
      const brightness = alpha * ((0.299 * r + 0.587 * g + 0.114 * b) / 255) + (1 - alpha);
      const rampIndex = Math.min(RAMP.length - 1, Math.floor((1 - brightness) * RAMP.length));
      output += RAMP[rampIndex];
    }
    output += '\n';
  }
  return output;
}

export default function ImageToAsciiArt() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [outputWidth, setOutputWidth] = useState(DEFAULT_WIDTH);
  const [ascii, setAscii] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        setError(null);
      };
      img.onerror = () => setError('Could not load this image.');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    if (!image) {
      setAscii('');
      return;
    }
    setAscii(imageToAscii(image, outputWidth));
  }, [image, outputWidth]);

  function copyOutput() {
    if (!ascii) return;
    navigator.clipboard.writeText(ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row">
        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="mono" />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Output width (characters):
        </label>
        <input
          type="number"
          min={MIN_WIDTH}
          max={MAX_WIDTH}
          value={outputWidth}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) setOutputWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n)));
          }}
          className="mono"
          style={{
            width: 90,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
      </div>

      {error && <div className="status-line status-invalid">✗ {error}</div>}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>ASCII art</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copyOutput} disabled={!ascii}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <pre
          className="mono"
          style={{
            margin: 0,
            padding: '12px 16px',
            overflowX: 'auto',
            fontSize: 6,
            lineHeight: 1,
            background: 'var(--surface)',
            color: 'var(--text-primary)',
          }}
        >
          {ascii || '// Upload an image above to generate ASCII art'}
        </pre>
      </div>
    </div>
  );
}
