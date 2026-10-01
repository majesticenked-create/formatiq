'use client';

import { useMemo, useState } from 'react';
import { copyToClipboard, quoteCssUrl } from '@/lib/tools/css-color';

type Mode = 'url' | 'linear' | 'radial';

const SIZE_OPTIONS = ['auto', 'cover', 'contain'] as const;
const POSITION_OPTIONS = ['center', 'top', 'bottom', 'left', 'right'] as const;
const REPEAT_OPTIONS = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'] as const;
const ATTACHMENT_OPTIONS = ['scroll', 'fixed'] as const;

export default function CssBackgroundImageGenerator() {
  const [mode, setMode] = useState<Mode>('url');
  const [url, setUrl] = useState('https://example.com/image.jpg');
  const [size, setSize] = useState<(typeof SIZE_OPTIONS)[number]>('cover');
  const [position, setPosition] = useState<(typeof POSITION_OPTIONS)[number]>('center');
  const [repeat, setRepeat] = useState<(typeof REPEAT_OPTIONS)[number]>('no-repeat');
  const [attachment, setAttachment] = useState<(typeof ATTACHMENT_OPTIONS)[number]>('scroll');
  const [angle, setAngle] = useState(90);
  const [colorA, setColorA] = useState('#3b82f6');
  const [colorB, setColorB] = useState('#8b5cf6');
  const [copied, setCopied] = useState(false);

  const imageValue = useMemo(() => {
    if (mode === 'linear') return `linear-gradient(${angle}deg, ${colorA}, ${colorB})`;
    if (mode === 'radial') return `radial-gradient(circle, ${colorA}, ${colorB})`;
    return quoteCssUrl(url);
  }, [mode, angle, colorA, colorB, url]);

  const css = useMemo(() => {
    if (mode === 'url') {
      return [
        `background-image: ${imageValue};`,
        `background-size: ${size};`,
        `background-position: ${position};`,
        `background-repeat: ${repeat};`,
        `background-attachment: ${attachment};`,
      ].join('\n');
    }
    return `background-image: ${imageValue};`;
  }, [mode, imageValue, size, position, repeat, attachment]);

  // Preview only ever uses `url` as a React style prop value (never raw HTML),
  // and no request is made to fetch or validate the URL server-side - the
  // browser's normal <img>-equivalent background loading applies as-is.
  const previewStyle =
    mode === 'url'
      ? {
          backgroundImage: `url(${JSON.stringify(url)})`,
          backgroundSize: size,
          backgroundPosition: position,
          backgroundRepeat: repeat,
          backgroundAttachment: attachment,
        }
      : { backgroundImage: imageValue };

  function copy() {
    copyToClipboard(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row" style={{ flexWrap: 'wrap' }}>
        <button className={`icon-btn${mode === 'url' ? ' is-active' : ''}`} onClick={() => setMode('url')}>
          Image URL
        </button>
        <button className={`icon-btn${mode === 'linear' ? ' is-active' : ''}`} onClick={() => setMode('linear')}>
          Linear gradient
        </button>
        <button className={`icon-btn${mode === 'radial' ? ' is-active' : ''}`} onClick={() => setMode('radial')}>
          Radial gradient
        </button>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="panel-bar">
          <span>Preview</span>
        </div>
        <div style={{ height: 160, border: '1px solid var(--border)', ...previewStyle }} />
      </div>

      {mode === 'url' && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Image settings</span>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="mono"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{ width: '100%', padding: '6px 8px' }}
            />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label>
                Size{' '}
                <select value={size} onChange={(e) => setSize(e.target.value as typeof size)}>
                  {SIZE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Position{' '}
                <select value={position} onChange={(e) => setPosition(e.target.value as typeof position)}>
                  {POSITION_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Repeat{' '}
                <select value={repeat} onChange={(e) => setRepeat(e.target.value as typeof repeat)}>
                  {REPEAT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Attachment{' '}
                <select value={attachment} onChange={(e) => setAttachment(e.target.value as typeof attachment)}>
                  {ATTACHMENT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      )}

      {(mode === 'linear' || mode === 'radial') && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Gradient settings</span>
          </div>
          <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {mode === 'linear' && (
              <>
                <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Angle
                </label>
                <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} style={{ width: 140 }} />
                <span className="mono" style={{ fontSize: 13, width: 40 }}>
                  {angle}°
                </span>
              </>
            )}
            <input type="color" value={colorA} onChange={(e) => setColorA(e.target.value)} style={{ width: 32, height: 32, padding: 0 }} />
            <input type="color" value={colorB} onChange={(e) => setColorB(e.target.value)} style={{ width: 32, height: 32, padding: 0 }} />
          </div>
        </div>
      )}

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
