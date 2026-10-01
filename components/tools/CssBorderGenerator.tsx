'use client';

import { useMemo, useState } from 'react';
import { copyToClipboard, normalizeHex } from '@/lib/tools/css-color';

const STYLE_OPTIONS = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none'] as const;
const MIN_WIDTH = 0;
const MAX_WIDTH = 50;

export default function CssBorderGenerator() {
  const [widthInput, setWidthInput] = useState('2');
  const [style, setStyle] = useState<(typeof STYLE_OPTIONS)[number]>('solid');
  const [colorInput, setColorInput] = useState('#3b82f6');
  const [radiusInput, setRadiusInput] = useState('0');
  const [copied, setCopied] = useState(false);

  const width = Number(widthInput);
  const widthError =
    widthInput.trim() === '' || !/^\d+(\.\d+)?$/.test(widthInput.trim()) || width < MIN_WIDTH || width > MAX_WIDTH;

  const radius = Number(radiusInput);
  const radiusError = radiusInput.trim() !== '' && (!/^\d+(\.\d+)?$/.test(radiusInput.trim()) || radius < 0);

  const hex = normalizeHex(colorInput);
  const colorError = colorInput.trim() !== '' && !hex;

  const safeWidth = widthError ? 0 : width;
  const safeColor = hex ?? '#3b82f6';
  const safeRadius = radiusError ? 0 : radius || 0;

  const declaration = `border: ${safeWidth}px ${style} ${safeColor};`;
  const radiusDeclaration = safeRadius > 0 ? `\nborder-radius: ${safeRadius}px;` : '';
  const css = declaration + radiusDeclaration;

  const previewStyle = useMemo(
    () => ({
      border: style === 'none' ? 'none' : `${safeWidth}px ${style} ${safeColor}`,
      borderRadius: safeRadius,
    }),
    [safeWidth, style, safeColor, safeRadius],
  );

  function copy() {
    copyToClipboard(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function reset() {
    setWidthInput('2');
    setStyle('solid');
    setColorInput('#3b82f6');
    setRadiusInput('0');
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-bar">
          <span>Preview</span>
        </div>
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 160, height: 90, ...previewStyle }} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Border</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <label>
              Width (px, 0-{MAX_WIDTH}){' '}
              <input
                className="mono"
                value={widthInput}
                onChange={(e) => setWidthInput(e.target.value)}
                style={{ width: 70, padding: '6px 8px' }}
              />
            </label>
            <label>
              Style{' '}
              <select value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
                {STYLE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="color"
              value={hex ?? '#3b82f6'}
              onChange={(e) => setColorInput(e.target.value)}
              style={{ width: 32, height: 32, padding: 0 }}
            />
            <input
              className="mono"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="#3b82f6"
              style={{ width: 110, padding: '6px 8px' }}
            />
            <label>
              Corner radius (px, optional){' '}
              <input
                className="mono"
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                style={{ width: 70, padding: '6px 8px' }}
              />
            </label>
            <button className="icon-btn" onClick={reset}>
              Reset
            </button>
          </div>
          {widthError && (
            <div className="status-line status-invalid">✗ Width must be a number between {MIN_WIDTH} and {MAX_WIDTH}.</div>
          )}
          {colorError && <div className="status-line status-invalid">✗ Invalid HEX color. Use 3 or 6 hex digits, e.g. #3b82f6.</div>}
          {radiusError && <div className="status-line status-invalid">✗ Corner radius must be a non-negative number.</div>}
          <div className="status-line status-neutral">
            Corner radius here is a single uniform value applied to all four corners - handy for a quick rounded
            border without needing a separate tool.
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>CSS</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copy}>
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>
        <pre className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
          {css}
        </pre>
      </div>
    </div>
  );
}
