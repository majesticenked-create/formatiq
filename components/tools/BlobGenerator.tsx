'use client';

import { useMemo, useState } from 'react';
import { mulberry32, randomSeed, randomFloat } from '@/lib/tools/seeded-random';

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

interface Point {
  x: number;
  y: number;
}

/**
 * Generates N points around a circle, each radius perturbed by a seeded random
 * amount, then connects them with a smooth closed cubic-bezier path (control
 * points derived from each point's neighbors, similar in spirit to a
 * Catmull-Rom-to-Bezier conversion) so the result reads as an organic blob
 * rather than a jagged polygon.
 */
function generateBlobPath(points: number, irregularity: number, size: number, seed: number): string {
  const rng = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const baseRadius = size / 2.6;

  const pts: Point[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = 1 + randomFloat(rng, -irregularity, irregularity);
    const r = baseRadius * wobble;
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }

  // Smooth closed curve through pts using cubic beziers with control points
  // placed a fraction of the way toward each point's neighbors.
  const n = pts.length;
  const smoothing = 0.2;
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    const cp1x = p1.x + (p2.x - p0.x) * smoothing;
    const cp1y = p1.y + (p2.y - p0.y) * smoothing;
    const cp2x = p2.x - (p3.x - p1.x) * smoothing;
    const cp2y = p2.y - (p3.y - p1.y) * smoothing;

    d += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  d += 'Z';
  return d;
}

function buildSvg(path: string, size: number, fill: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n  <path d="${escapeAttr(path)}" fill="${escapeAttr(fill)}" />\n</svg>`;
}

export default function BlobGenerator() {
  const [points, setPoints] = useState(8);
  const [irregularity, setIrregularity] = useState(0.35);
  const [size, setSize] = useState(300);
  const [fill, setFill] = useState('#7c5cff');
  const [seed, setSeed] = useState(() => randomSeed());

  const path = useMemo(
    () => generateBlobPath(points, irregularity, size, seed),
    [points, irregularity, size, seed]
  );
  const svgMarkup = useMemo(() => buildSvg(path, size, fill), [path, size, fill]);

  function reroll() {
    setSeed(randomSeed());
  }

  function download() {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blob-${seed}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Points:
        </label>
        <input
          type="number"
          min={4}
          max={20}
          value={points}
          onChange={(e) => setPoints(Math.min(20, Math.max(4, Number(e.target.value) || 4)))}
          className="mono"
          style={{ width: 64, padding: '4px 8px' }}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Irregularity:
        </label>
        <input
          type="range"
          min={0}
          max={0.6}
          step={0.01}
          value={irregularity}
          onChange={(e) => setIrregularity(Number(e.target.value))}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Size:
        </label>
        <input
          type="number"
          min={100}
          max={800}
          value={size}
          onChange={(e) => setSize(Math.min(800, Math.max(100, Number(e.target.value) || 100)))}
          className="mono"
          style={{ width: 72, padding: '4px 8px' }}
        />
        <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} />
        <button className="icon-btn" onClick={reroll}>
          Reroll seed
        </button>
        <button className="icon-btn" onClick={download}>
          Download SVG
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-bar">
          <span>Preview (seed {seed})</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <svg width={Math.min(size, 320)} height={Math.min(size, 320)} viewBox={`0 0 ${size} ${size}`}>
            <path d={path} fill={fill} />
          </svg>
        </div>
        <div className="status-line status-neutral">
          Same seed + settings always reproduces this exact shape.
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>SVG markup</span>
        </div>
        <textarea className="mono" value={svgMarkup} readOnly spellCheck={false} />
      </div>
    </div>
  );
}
