'use client';

import { useMemo, useState } from 'react';
import { copyToClipboard, normalizeHex } from '@/lib/tools/css-color';
import { buildButtonCss, buildButtonHtml } from '@/lib/tools/css-button';

const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'none'] as const;

function safeColor(input: string, fallback: string): string {
  return normalizeHex(input) ?? fallback;
}

export default function CssButtonGenerator() {
  const [label, setLabel] = useState('Click me');
  const [fontSize, setFontSize] = useState('16');
  const [fontWeight, setFontWeight] = useState('600');
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#7c5cff');
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const [hoverBgColor, setHoverBgColor] = useState('#6342f5');
  const [hoverTextColor, setHoverTextColor] = useState('#ffffff');
  const [borderWidth, setBorderWidth] = useState('0');
  const [borderStyle, setBorderStyle] = useState<(typeof BORDER_STYLES)[number]>('none');
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderRadius, setBorderRadius] = useState('8');
  const [paddingV, setPaddingV] = useState('10');
  const [paddingH, setPaddingH] = useState('20');
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowX, setShadowX] = useState('0');
  const [shadowY, setShadowY] = useState('4');
  const [shadowBlur, setShadowBlur] = useState('12');
  const [shadowSpread, setShadowSpread] = useState('0');
  const [shadowColor, setShadowColor] = useState('#00000040');
  const [hovering, setHovering] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const safeBg = safeColor(bgColor, '#7c5cff');
  const safeText = safeColor(textColor, '#ffffff');
  const safeBorderColor = safeColor(borderColor, '#000000');
  const boxShadow = shadowEnabled
    ? `${Number(shadowX) || 0}px ${Number(shadowY) || 0}px ${Number(shadowBlur) || 0}px ${Number(shadowSpread) || 0}px ${shadowColor}`
    : 'none';

  const css = useMemo(
    () =>
      buildButtonCss({
        fontSize: Number(fontSize) || 16,
        fontWeight: Number(fontWeight) || 400,
        textColor,
        bgColor,
        hoverEnabled,
        hoverBgColor,
        hoverTextColor,
        borderWidth: Number(borderWidth) || 0,
        borderStyle,
        borderColor,
        borderRadius: Number(borderRadius) || 0,
        paddingV: Number(paddingV) || 0,
        paddingH: Number(paddingH) || 0,
        shadowEnabled,
        shadowX: Number(shadowX) || 0,
        shadowY: Number(shadowY) || 0,
        shadowBlur: Number(shadowBlur) || 0,
        shadowSpread: Number(shadowSpread) || 0,
        shadowColor,
      }),
    [
      fontSize, fontWeight, textColor, bgColor, hoverEnabled, hoverBgColor, hoverTextColor,
      borderWidth, borderStyle, borderColor, borderRadius, paddingV, paddingH,
      shadowEnabled, shadowX, shadowY, shadowBlur, shadowSpread, shadowColor,
    ],
  );

  const html = buildButtonHtml(label);

  function copyCss() {
    copyToClipboard(css);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 1200);
  }
  function copyHtml() {
    copyToClipboard(html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 1200);
  }

  const previewStyle: React.CSSProperties = {
    fontSize: Number(fontSize) || 16,
    fontWeight: Number(fontWeight) || 400,
    color: hovering && hoverEnabled ? safeColor(hoverTextColor, safeText) : safeText,
    backgroundColor: hovering && hoverEnabled ? safeColor(hoverBgColor, safeBg) : safeBg,
    border: `${Number(borderWidth) || 0}px ${borderStyle} ${safeBorderColor}`,
    borderRadius: Number(borderRadius) || 0,
    padding: `${Number(paddingV) || 0}px ${Number(paddingH) || 0}px`,
    boxShadow,
    cursor: 'pointer',
    transition: 'background-color 150ms ease, color 150ms ease',
  };

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Live preview (hover it)</span>
        </div>
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
          <button
            style={previewStyle}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {label || 'Click me'}
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Content &amp; colors</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <label>
            Label <input className="mono" value={label} onChange={(e) => setLabel(e.target.value)} style={{ width: 140, padding: '6px 8px' }} />
          </label>
          <label>
            Font size (px) <input className="mono" value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Font weight <input className="mono" value={fontWeight} onChange={(e) => setFontWeight(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Text color <input type="color" value={safeText} onChange={(e) => setTextColor(e.target.value)} />
          </label>
          <label>
            Background <input type="color" value={safeBg} onChange={(e) => setBgColor(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Hover state</span>
          <div className="panel-actions">
            <label style={{ fontSize: 13 }}>
              <input type="checkbox" checked={hoverEnabled} onChange={(e) => setHoverEnabled(e.target.checked)} /> Enable hover styling
            </label>
          </div>
        </div>
        {hoverEnabled && (
          <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label>
              Hover background <input type="color" value={safeColor(hoverBgColor, safeBg)} onChange={(e) => setHoverBgColor(e.target.value)} />
            </label>
            <label>
              Hover text color <input type="color" value={safeColor(hoverTextColor, safeText)} onChange={(e) => setHoverTextColor(e.target.value)} />
            </label>
          </div>
        )}
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Border &amp; padding</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <label>
            Border width <input className="mono" value={borderWidth} onChange={(e) => setBorderWidth(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Border style{' '}
            <select value={borderStyle} onChange={(e) => setBorderStyle(e.target.value as typeof borderStyle)}>
              {BORDER_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Border color <input type="color" value={safeBorderColor} onChange={(e) => setBorderColor(e.target.value)} />
          </label>
          <label>
            Radius <input className="mono" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Padding V <input className="mono" value={paddingV} onChange={(e) => setPaddingV(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
          <label>
            Padding H <input className="mono" value={paddingH} onChange={(e) => setPaddingH(e.target.value)} style={{ width: 60, padding: '6px 8px' }} />
          </label>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Box shadow</span>
          <div className="panel-actions">
            <label style={{ fontSize: 13 }}>
              <input type="checkbox" checked={shadowEnabled} onChange={(e) => setShadowEnabled(e.target.checked)} /> Enable
            </label>
          </div>
        </div>
        {shadowEnabled && (
          <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label>
              X <input className="mono" value={shadowX} onChange={(e) => setShadowX(e.target.value)} style={{ width: 50, padding: '6px 8px' }} />
            </label>
            <label>
              Y <input className="mono" value={shadowY} onChange={(e) => setShadowY(e.target.value)} style={{ width: 50, padding: '6px 8px' }} />
            </label>
            <label>
              Blur <input className="mono" value={shadowBlur} onChange={(e) => setShadowBlur(e.target.value)} style={{ width: 50, padding: '6px 8px' }} />
            </label>
            <label>
              Spread <input className="mono" value={shadowSpread} onChange={(e) => setShadowSpread(e.target.value)} style={{ width: 50, padding: '6px 8px' }} />
            </label>
            <label>
              Color <input type="text" className="mono" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} style={{ width: 100, padding: '6px 8px' }} />
            </label>
          </div>
        )}
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>CSS</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copyCss}>
              {copiedCss ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>
        <pre className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
          {css}
        </pre>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>HTML</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copyHtml}>
              {copiedHtml ? 'Copied!' : 'Copy HTML'}
            </button>
          </div>
        </div>
        <pre className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
          {html}
        </pre>
      </div>
    </div>
  );
}
