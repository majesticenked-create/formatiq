'use client';

import { useState } from 'react';
import { copyToClipboard, hexToRgb, normalizeHex } from '@/lib/tools/css-color';
import { buildGlassCss } from '@/lib/tools/css-glassmorphism';

export default function CssGlassmorphismGenerator() {
  const [bgColorInput, setBgColorInput] = useState('#ffffff');
  const [opacity, setOpacity] = useState('20');
  const [blur, setBlur] = useState('10');
  const [borderOpacity, setBorderOpacity] = useState('30');
  const [borderWidth, setBorderWidth] = useState('1');
  const [radius, setRadius] = useState('16');
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const hex = normalizeHex(bgColorInput) ?? '#ffffff';
  const rgb = hexToRgb(hex) ?? { r: 255, g: 255, b: 255 };

  const safeOpacity = Math.min(100, Math.max(0, Number(opacity) || 0)) / 100;
  const safeBorderOpacity = Math.min(100, Math.max(0, Number(borderOpacity) || 0)) / 100;
  const safeBlur = Math.max(0, Number(blur) || 0);
  const safeBorderWidth = Math.max(0, Number(borderWidth) || 0);
  const safeRadius = Math.max(0, Number(radius) || 0);

  const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${safeOpacity})`;
  const borderRgba = `rgba(255, 255, 255, ${safeBorderOpacity})`;

  const css = buildGlassCss({
    bgColorInput: bgColorInput,
    opacityPct: Number(opacity) || 0,
    blurPx: Number(blur) || 0,
    borderOpacityPct: Number(borderOpacity) || 0,
    borderWidthPx: Number(borderWidth) || 0,
    radiusPx: Number(radius) || 0,
    shadowEnabled,
  });

  function copy() {
    copyToClipboard(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Live preview</span>
        </div>
        <div
          style={{
            padding: 32,
            display: 'flex',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg, #ff6ec4, #7873f5 35%, #4ade80 70%, #fbbf24), repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0 10px, transparent 10px 20px)',
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 260,
              height: 140,
              background: bgRgba,
              backdropFilter: `blur(${safeBlur}px)`,
              WebkitBackdropFilter: `blur(${safeBlur}px)`,
              border: `${safeBorderWidth}px solid ${borderRgba}`,
              borderRadius: safeRadius,
              boxShadow: shadowEnabled ? '0 8px 32px rgba(0,0,0,0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            Glass panel
          </div>
        </div>
        <div className="status-line status-neutral">
          Previewed against a busy gradient/pattern background so the blur effect is actually visible - a glass
          panel over a flat color would look identical with or without backdrop-filter.
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Settings</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <label>
            Background color <input type="color" value={hex} onChange={(e) => setBgColorInput(e.target.value)} />
          </label>
          <label>
            Background opacity (%) <input className="mono" value={opacity} onChange={(e) => setOpacity(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Blur (px) <input className="mono" value={blur} onChange={(e) => setBlur(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Border opacity (%) <input className="mono" value={borderOpacity} onChange={(e) => setBorderOpacity(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Border width (px) <input className="mono" value={borderWidth} onChange={(e) => setBorderWidth(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Border radius (px) <input className="mono" value={radius} onChange={(e) => setRadius(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            <input type="checkbox" checked={shadowEnabled} onChange={(e) => setShadowEnabled(e.target.checked)} /> Drop shadow
          </label>
        </div>
      </div>

      <div className="panel">
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
        <div className="status-line status-neutral">
          Both <code className="mono">backdrop-filter</code> and the <code className="mono">-webkit-</code>
          prefixed version are included since Safari has historically required the prefix. Browser support for
          backdrop-filter is broad but not universal, and very low background opacity combined with low-contrast
          text can hurt readability - check text contrast against whatever sits behind the glass panel.
        </div>
      </div>
    </div>
  );
}
