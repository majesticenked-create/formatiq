'use client';

import { useMemo, useState } from 'react';

type Arc = 'top' | 'bottom';
type Direction = 'clockwise' | 'counter-clockwise';

const SIZE = 400;
const CENTER = SIZE / 2;

/** Builds the SVG arc path a <textPath> can follow, for either the top or bottom half of a circle. */
function buildArcPath(radius: number, arc: Arc, direction: Direction): string {
  const cx = CENTER;
  const cy = CENTER;
  // Top arc: left -> right across the top. Bottom arc: left -> right across the bottom.
  // Reversing sweep flag flips the effective reading direction along the path.
  const startX = cx - radius;
  const endX = cx + radius;
  const y = cy;
  const sweep = direction === 'clockwise' ? 1 : 0;
  if (arc === 'top') {
    return `M ${startX} ${y} A ${radius} ${radius} 0 0 ${sweep} ${endX} ${y}`;
  }
  // Bottom arc traverses right -> left by default so text reads left-to-right along the bottom.
  const sweepBottom = direction === 'clockwise' ? 0 : 1;
  return `M ${endX} ${y} A ${radius} ${radius} 0 0 ${sweepBottom} ${startX} ${y}`;
}

export default function CircleTextGenerator() {
  const [text, setText] = useState('CIRCLE TEXT GENERATOR');
  const [radius, setRadius] = useState(140);
  const [fontSize, setFontSize] = useState(24);
  const [letterSpacing, setLetterSpacing] = useState(2);
  const [arc, setArc] = useState<Arc>('top');
  const [direction, setDirection] = useState<Direction>('clockwise');
  const [startOffset, setStartOffset] = useState(0);

  const pathId = 'circle-text-path';
  const arcPath = useMemo(() => buildArcPath(radius, arc, direction), [radius, arc, direction]);

  const svgMarkup = useMemo(() => {
    // Built as a string purely for the "copy/download raw markup" feature below;
    // the on-page preview renders the equivalent JSX directly (see return statement),
    // never via dangerouslySetInnerHTML, so React always escapes the user's text.
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <path id="${pathId}" d="${arcPath}" fill="none" />
  <text font-size="${fontSize}" letter-spacing="${letterSpacing}" fill="currentColor">
    <textPath href="#${pathId}" startOffset="${startOffset}%">${escaped}</textPath>
  </text>
</svg>`;
  }, [text, arcPath, fontSize, letterSpacing, startOffset]);

  function copySvg() {
    navigator.clipboard.writeText(svgMarkup);
  }

  function downloadSvg() {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circle-text.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Text</span>
        </div>
        <textarea className="mono" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Controls</span>
        </div>
        <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <label className="mono" style={{ fontSize: 12 }}>
            Radius: {radius}px
            <input type="range" min={60} max={180} value={radius} onChange={(e) => setRadius(Number(e.target.value))} style={{ width: '100%' }} />
          </label>
          <label className="mono" style={{ fontSize: 12 }}>
            Font size: {fontSize}px
            <input type="range" min={10} max={48} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} style={{ width: '100%' }} />
          </label>
          <label className="mono" style={{ fontSize: 12 }}>
            Letter spacing: {letterSpacing}px
            <input type="range" min={-2} max={20} value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value))} style={{ width: '100%' }} />
          </label>
          <label className="mono" style={{ fontSize: 12 }}>
            Start offset: {startOffset}%
            <input type="range" min={0} max={100} value={startOffset} onChange={(e) => setStartOffset(Number(e.target.value))} style={{ width: '100%' }} />
          </label>
        </div>
        <div className="control-row" style={{ padding: '0 12px 12px' }}>
          <button className={`icon-btn ${arc === 'top' ? 'is-active' : ''}`} onClick={() => setArc('top')}>
            Top arc
          </button>
          <button className={`icon-btn ${arc === 'bottom' ? 'is-active' : ''}`} onClick={() => setArc('bottom')}>
            Bottom arc
          </button>
          <button className={`icon-btn ${direction === 'clockwise' ? 'is-active' : ''}`} onClick={() => setDirection('clockwise')}>
            Clockwise
          </button>
          <button className={`icon-btn ${direction === 'counter-clockwise' ? 'is-active' : ''}`} onClick={() => setDirection('counter-clockwise')}>
            Counter-clockwise
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Preview</span>
        </div>
        <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ maxWidth: '100%', color: 'var(--text-primary, #222)' }}>
            <path id={pathId} d={arcPath} fill="none" />
            <text fontSize={fontSize} letterSpacing={letterSpacing} fill="currentColor">
              <textPath href={`#${pathId}`} startOffset={`${startOffset}%`}>
                {text}
              </textPath>
            </text>
          </svg>
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>SVG markup</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copySvg}>
              Copy
            </button>
            <button className="icon-btn" onClick={downloadSvg}>
              Download .svg
            </button>
          </div>
        </div>
        <pre className="output mono" style={{ padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {svgMarkup}
        </pre>
      </div>
    </div>
  );
}
