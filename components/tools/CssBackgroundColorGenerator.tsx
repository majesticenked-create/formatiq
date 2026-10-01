'use client';

import { useMemo, useState } from 'react';
import { copyToClipboard, hexToRgb, normalizeHex, parseRgbString, rgbToHex } from '@/lib/tools/css-color';

const DEFAULT_HEX = '#3b82f6';

export default function CssBackgroundColorGenerator() {
  const [hexInput, setHexInput] = useState(DEFAULT_HEX);
  const [rgbInput, setRgbInput] = useState('59, 130, 246');
  const [copied, setCopied] = useState(false);

  const hexResult = useMemo(() => normalizeHex(hexInput), [hexInput]);
  const hexError = hexInput.trim() !== '' && !hexResult;

  function setFromHex(value: string) {
    setHexInput(value);
    const normalized = normalizeHex(value);
    if (normalized) {
      const rgb = hexToRgb(normalized)!;
      setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }

  function setFromRgb(value: string) {
    setRgbInput(value);
    const rgb = parseRgbString(value);
    if (rgb) {
      setHexInput(rgbToHex(rgb));
    }
  }

  const rgbResult = parseRgbString(rgbInput);
  const rgbError = rgbInput.trim() !== '' && !rgbResult;

  const activeHex = hexResult ?? DEFAULT_HEX;
  const declaration = `background-color: ${activeHex};`;

  function copy() {
    copyToClipboard(declaration);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function reset() {
    setHexInput(DEFAULT_HEX);
    setRgbInput('59, 130, 246');
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-bar">
          <span>Preview</span>
        </div>
        <div style={{ height: 160, background: activeHex }} />
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Color</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="color"
              value={hexResult ?? DEFAULT_HEX}
              onChange={(e) => setFromHex(e.target.value)}
              style={{ width: 36, height: 36, padding: 0, border: '1px solid var(--border)', borderRadius: 4, background: 'none' }}
            />
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              HEX
            </label>
            <input
              className="mono"
              value={hexInput}
              onChange={(e) => setFromHex(e.target.value)}
              placeholder="#3b82f6"
              style={{ width: 120, padding: '6px 8px' }}
            />
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              RGB
            </label>
            <input
              className="mono"
              value={rgbInput}
              onChange={(e) => setFromRgb(e.target.value)}
              placeholder="59, 130, 246"
              style={{ width: 150, padding: '6px 8px' }}
            />
            <button className="icon-btn" onClick={reset}>
              Reset
            </button>
          </div>
          {hexError && <div className="status-line status-invalid">✗ Invalid HEX color. Use 3 or 6 hex digits, e.g. #3b82f6 or #38f.</div>}
          {rgbError && <div className="status-line status-invalid">✗ Invalid RGB color. Each channel must be an integer 0-255, e.g. 59, 130, 246.</div>}
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
        <pre className="output mono">{declaration}</pre>
      </div>
    </div>
  );
}
