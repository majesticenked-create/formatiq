'use client';

import { useMemo, useState } from 'react';
import { copyToClipboard, normalizeHex } from '@/lib/tools/css-color';

const STYLE_OPTIONS = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none'] as const;
const MIN_WIDTH = 0;
const MAX_WIDTH = 50;

type Corner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';

const CORNER_LABELS: Record<Corner, string> = {
  topLeft: 'Top-left',
  topRight: 'Top-right',
  bottomRight: 'Bottom-right',
  bottomLeft: 'Bottom-left',
};

function parseCornerValue(value: string): number {
  const n = Number(value);
  if (value.trim() === '' || !/^\d+(\.\d+)?$/.test(value.trim()) || n < 0) return 0;
  return n;
}

export default function CssBorderGenerator() {
  const [widthInput, setWidthInput] = useState('2');
  const [style, setStyle] = useState<(typeof STYLE_OPTIONS)[number]>('solid');
  const [colorInput, setColorInput] = useState('#3b82f6');
  const [radiusInput, setRadiusInput] = useState('0');
  const [linkCorners, setLinkCorners] = useState(true);
  const [cornerInputs, setCornerInputs] = useState<Record<Corner, string>>({
    topLeft: '0',
    topRight: '0',
    bottomRight: '0',
    bottomLeft: '0',
  });
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

  const safeCorners: Record<Corner, number> = {
    topLeft: parseCornerValue(cornerInputs.topLeft),
    topRight: parseCornerValue(cornerInputs.topRight),
    bottomRight: parseCornerValue(cornerInputs.bottomRight),
    bottomLeft: parseCornerValue(cornerInputs.bottomLeft),
  };
  const cornersAllEqual =
    safeCorners.topLeft === safeCorners.topRight &&
    safeCorners.topRight === safeCorners.bottomRight &&
    safeCorners.bottomRight === safeCorners.bottomLeft;
  const perCornerActive = !linkCorners && !cornersAllEqual;

  function setCorner(corner: Corner, value: string) {
    if (linkCorners) {
      setCornerInputs({ topLeft: value, topRight: value, bottomRight: value, bottomLeft: value });
    } else {
      setCornerInputs((prev) => ({ ...prev, [corner]: value }));
    }
  }

  const declaration = `border: ${safeWidth}px ${style} ${safeColor};`;
  const radiusDeclaration = perCornerActive
    ? `\nborder-radius: ${safeCorners.topLeft}px ${safeCorners.topRight}px ${safeCorners.bottomRight}px ${safeCorners.bottomLeft}px;`
    : safeRadius > 0
      ? `\nborder-radius: ${safeRadius}px;`
      : '';
  const css = declaration + radiusDeclaration;

  const previewStyle = useMemo(
    () => ({
      border: style === 'none' ? 'none' : `${safeWidth}px ${style} ${safeColor}`,
      borderRadius: perCornerActive
        ? `${safeCorners.topLeft}px ${safeCorners.topRight}px ${safeCorners.bottomRight}px ${safeCorners.bottomLeft}px`
        : safeRadius,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeWidth, style, safeColor, safeRadius, perCornerActive, safeCorners.topLeft, safeCorners.topRight, safeCorners.bottomRight, safeCorners.bottomLeft],
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
    setLinkCorners(true);
    setCornerInputs({ topLeft: '0', topRight: '0', bottomRight: '0', bottomLeft: '0' });
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
            Use the uniform &quot;Corner radius&quot; field above for a quick rounded border on all four corners, or turn off
            &quot;Link all corners&quot; below to set each corner independently.
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Per-corner radius</span>
          <div className="panel-actions">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={linkCorners} onChange={(e) => setLinkCorners(e.target.checked)} />
              Link all corners
            </label>
          </div>
        </div>
        <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {(Object.keys(CORNER_LABELS) as Corner[]).map((corner) => (
            <label key={corner}>
              {CORNER_LABELS[corner]} (px){' '}
              <input
                className="mono"
                value={cornerInputs[corner]}
                onChange={(e) => setCorner(corner, e.target.value)}
                style={{ width: 70, padding: '6px 8px' }}
              />
            </label>
          ))}
        </div>
        <div className="status-line status-neutral">
          {linkCorners
            ? 'Corners are linked - editing any one corner applies the same value to all four, equivalent to the uniform "Corner radius" field above.'
            : 'Corners are independent - each can have its own radius, producing a four-value border-radius declaration.'}
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
