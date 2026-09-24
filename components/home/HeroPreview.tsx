import Link from 'next/link';
import { CheckIcon } from '@/components/icons/UiIcons';

// Real sample data: the "output" pane is JSON.stringify of the same object, so
// the preview is always genuinely valid and correctly formatted JSON.
const SAMPLE = {
  project: 'formatiq',
  version: 2,
  features: ['format', 'validate', 'convert'],
  private: true,
};
const INPUT = JSON.stringify(SAMPLE);
const OUTPUT_LINES = JSON.stringify(SAMPLE, null, 2).split('\n');

function highlight(line: string) {
  const parts: React.ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    if (m[1] && m[2]) {
      parts.push(<span key={i++} className="k">{m[1]}</span>);
      parts.push(m[2]);
    } else if (m[1]) {
      parts.push(<span key={i++} className="s">{m[1]}</span>);
    } else {
      parts.push(<span key={i++} className="n">{m[0]}</span>);
    }
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

/**
 * Static, purely presentational miniature of the JSON Formatter. It is one
 * link to the real tool; the inner mock is aria-hidden and contains no
 * focusable or fake-interactive controls (the "buttons" are plain spans).
 */
export default function HeroPreview() {
  return (
    <Link
      href="/tools/formatters/json-formatter"
      className="hero-preview"
      aria-label="Open the JSON Formatter tool"
    >
      <div aria-hidden="true">
        <div className="hero-preview-bar">
          <span className="demo-dot" />
          <span className="demo-dot" />
          <span className="demo-dot" />
          <span className="demo-label">JSON Formatter</span>
        </div>
        <div className="hero-preview-toolbar">
          <span className="hp-btn hp-btn-primary">Format</span>
          <span className="hp-btn">Minify</span>
          <span className="hp-btn">Clear</span>
          <span className="hp-status">
            <CheckIcon size={14} /> Valid JSON
          </span>
        </div>
        <div className="hero-preview-panes">
          <div className="hero-preview-pane">
            <div className="hero-preview-pane-label">Input</div>
            <div className="hp-code">
              <span className="hp-ln">1</span>
              <span className="hp-line hp-raw">{INPUT}</span>
            </div>
          </div>
          <div className="hero-preview-pane">
            <div className="hero-preview-pane-label">Output</div>
            <div className="demo-body hp-out">
              {OUTPUT_LINES.map((line, idx) => (
                <div key={idx} className="hp-code">
                  <span className="hp-ln">{idx + 1}</span>
                  <span className="hp-line">{highlight(line)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
