'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/tools/css-color';
import { buildResizeCss, type ResizeValue, type OverflowValue } from '@/lib/tools/css-box-resize';

const RESIZE_OPTIONS: ResizeValue[] = ['none', 'both', 'horizontal', 'vertical'];
const OVERFLOW_OPTIONS: OverflowValue[] = ['auto', 'hidden', 'scroll'];

export default function CssBoxResizeGenerator() {
  const [resize, setResize] = useState<ResizeValue>('both');
  const [overflow, setOverflow] = useState<OverflowValue>('auto');
  const [copied, setCopied] = useState(false);

  const css = buildResizeCss(resize, overflow);

  function copy() {
    copyToClipboard(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Resize settings</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <label>
            resize{' '}
            <select value={resize} onChange={(e) => setResize(e.target.value as ResizeValue)}>
              {RESIZE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label>
            overflow{' '}
            <select value={overflow} onChange={(e) => setOverflow(e.target.value as OverflowValue)}>
              {OVERFLOW_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="status-line status-neutral">
          The CSS <code className="mono">resize</code> property only takes effect on an element whose{' '}
          <code className="mono">overflow</code> is something other than its default, visible value - that is
          why this tool pairs resize with an overflow dropdown (auto, hidden, or scroll) rather than leaving
          overflow at its default.
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Live preview (drag the corner/edge handle)</span>
        </div>
        <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
          <div
            className="mono"
            style={{
              width: 220,
              height: 120,
              minWidth: 60,
              minHeight: 40,
              maxWidth: 480,
              maxHeight: 360,
              border: '1px solid var(--border-color, #444)',
              padding: 12,
              resize,
              overflow,
              background: 'var(--panel-bg, rgba(124,92,255,0.06))',
            }}
          >
            This box uses real native CSS <code>resize</code> - drag its handle to resize it directly, no
            JavaScript involved in the resizing itself.
          </div>
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
      </div>
    </div>
  );
}
